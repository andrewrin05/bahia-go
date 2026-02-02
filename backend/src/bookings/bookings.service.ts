import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new BadRequestException('Invalid date range');
    }

    const conflicts = await this.prisma.booking.count({
      where: {
        boatId: data.boatId,
        status: { not: 'cancelled' },
        startDate: { lt: end },
        endDate: { gt: start },
      },
    });

    if (conflicts > 0) {
      throw new BadRequestException('Dates not available for this boat');
    }

    return this.prisma.booking.create({
      data: {
        ...data,
        userId,
        currency: data?.currency || 'COP',
        paymentStatus: data?.paymentStatus || 'pending',
      },
    });
  }

  async findAll(userId?: string) {
    return this.prisma.booking.findMany({
      where: userId ? { userId } : {},
      include: {
        boat: true,
        user: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        boat: true,
        user: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.booking.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.booking.delete({
      where: { id },
    });
  }
}