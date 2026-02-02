import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

interface WompiCheckoutOptions {
  bookingId: string;
  redirectUrl?: string;
  customerEmail?: string;
}

@Injectable()
export class PaymentsService {
  private cachedAcceptanceToken: string | null = null;
  private cachedAcceptanceExpires: number | null = null;

  constructor(private config: ConfigService, private prisma: PrismaService) {}

  private getBaseUrl() {
    return this.config.get<string>('WOMPI_BASE_URL') || 'https://production.wompi.co';
  }

  private async getAcceptanceToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedAcceptanceToken && this.cachedAcceptanceExpires && now < this.cachedAcceptanceExpires) {
      return this.cachedAcceptanceToken;
    }

    const publicKey = this.config.get<string>('WOMPI_PUBLIC_KEY');
    if (!publicKey) {
      throw new InternalServerErrorException('WOMPI_PUBLIC_KEY is not configured');
    }

    const res = await fetch(`${this.getBaseUrl()}/v1/merchants/${publicKey}`);
    if (!res.ok) {
      const text = await res.text();
      throw new InternalServerErrorException(`Failed to fetch acceptance token: ${text}`);
    }

    const data = await res.json();
    const token = data?.data?.presigned_acceptance?.acceptance_token;
    const expires = data?.data?.presigned_acceptance?.expires_at;
    if (!token) {
      throw new InternalServerErrorException('No acceptance token returned by Wompi');
    }

    this.cachedAcceptanceToken = token;
    this.cachedAcceptanceExpires = expires ? expires * 1000 : now + 1000 * 60 * 10;
    return token;
  }

  async createWompiCheckout(userId: string, opts: WompiCheckoutOptions) {
    const publicKey = this.config.get<string>('WOMPI_PUBLIC_KEY');
    if (!publicKey) {
      throw new InternalServerErrorException('WOMPI_PUBLIC_KEY is not configured');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: opts.bookingId },
      include: { user: true },
    });

    if (!booking || booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }

    const acceptanceToken = await this.getAcceptanceToken();
    const amountInCents = Math.round((booking.totalPrice || 0) * 100);
    const currency = booking.currency || 'COP';
    const reference = `BOOK-${booking.id}-${Date.now()}`;
    const customerEmail = opts.customerEmail || booking.user?.email;
    const redirectUrl = opts.redirectUrl || this.config.get<string>('WOMPI_REDIRECT_URL') || 'https://checkout.bahiago.app/return';

    const params = new URLSearchParams({
      'public-key': publicKey,
      'amount-in-cents': amountInCents.toString(),
      currency,
      reference,
      'redirect-url': redirectUrl,
      'acceptance-token': acceptanceToken,
    });

    if (customerEmail) {
      params.append('customer-data.email', customerEmail);
    }

    const checkoutUrl = `https://checkout.wompi.co/p/?${params.toString()}`;

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentProvider: 'wompi',
        paymentReference: reference,
        paymentStatus: 'pending_payment',
        paymentCheckoutUrl: checkoutUrl,
      },
    });

    return {
      checkoutUrl,
      reference,
      amountInCents,
      currency,
      acceptanceToken,
    };
  }

  async handleWompiWebhook(event: any) {
    const transaction = event?.data?.transaction || event?.transaction;
    if (!transaction) return { received: true };

    const reference: string | undefined = transaction.reference;
    const status: string | undefined = transaction.status;

    if (!reference) return { received: true };

    // Verificar firma si se configura WOMPI_WEBHOOK_SECRET
    const signature = event?.signature || event?.event_data?.signature;
    const properties: string[] | undefined = signature?.properties;
    const checksum: string | undefined = signature?.checksum;
    const webhookSecret = this.config.get<string>('WOMPI_WEBHOOK_SECRET');

    if (webhookSecret && properties?.length && checksum) {
      const getByPath = (obj: any, path: string) => path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
      const baseString = properties
        .map((prop) => {
          const val = getByPath(event, prop);
          return val === undefined || val === null ? '' : String(val);
        })
        .join(''); // Wompi concatena sin separadores
      const computed = crypto.createHmac('sha256', webhookSecret).update(baseString).digest('hex');
      if (computed !== checksum) {
        throw new ForbiddenException('Invalid webhook signature');
      }
    }

    // Map Wompi statuses to booking paymentStatus
    const statusMap: Record<string, string> = {
      APPROVED: 'paid',
      VOIDED: 'cancelled',
      DECLINED: 'failed',
      ERROR: 'failed',
      PENDING: 'pending_payment',
    };

    const paymentStatus = statusMap[status || ''] || 'pending_payment';

    await this.prisma.booking.updateMany({
      where: { paymentReference: reference },
      data: {
        paymentStatus,
        status: paymentStatus === 'paid' ? 'confirmed' : undefined,
      },
    });

    return { received: true };
  }
}
