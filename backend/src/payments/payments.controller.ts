import { Body, Controller, Post, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('wompi/checkout')
  @UseGuards(JwtAuthGuard)
  async createWompiCheckout(@Request() req, @Body() body: any) {
    const { bookingId, redirectUrl, customerEmail } = body;
    if (!bookingId) {
      throw new BadRequestException('bookingId is required');
    }
    return this.paymentsService.createWompiCheckout(req.user.userId, {
      bookingId,
      redirectUrl,
      customerEmail,
    });
  }

  // Webhook sin verificación de firma (agregar verificación HMAC para producción)
  @Post('wompi/webhook')
  async wompiWebhook(@Body() payload: any) {
    return this.paymentsService.handleWompiWebhook(payload);
  }
}
