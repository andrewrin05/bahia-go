import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    return this.prisma.message.create({
      data: { ...data, senderId: userId },
    });
  }

  async findByBoat(boatId: string) {
    return this.prisma.message.findMany({
      where: { boatId },
      include: {
        sender: true,
        boat: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findConversations(userId: string) {
    // Get unique boats where user has messages
    const messages = await this.prisma.message.findMany({
      where: {
        senderId: userId,
      },
      include: {
        boat: true,
        sender: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by boat
    const conversations = {};
    messages.forEach(msg => {
      if (!conversations[msg.boatId]) {
        conversations[msg.boatId] = {
          boat: msg.boat,
          lastMessage: msg,
          messages: [],
        };
      }
      conversations[msg.boatId].messages.push(msg);
    });

    return Object.values(conversations);
  }
}