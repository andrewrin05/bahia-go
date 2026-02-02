import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { boatId: string }, userId: string) {
    return this.prisma.favorite.create({
      data: { ...data, userId },
    });
  }

  async findAll(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        boat: true,
      },
    });
  }

  async remove(boatId: string, userId: string) {
    return this.prisma.favorite.deleteMany({
      where: { boatId, userId },
    });
  }
}