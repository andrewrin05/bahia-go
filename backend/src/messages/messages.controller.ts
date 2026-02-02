import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createMessageDto: any) {
    return this.messagesService.create(createMessageDto, req.user.userId);
  }

  @Get('conversations/me')
  @UseGuards(JwtAuthGuard)
  findConversations(@Request() req) {
    return this.messagesService.findConversations(req.user.userId);
  }

  @Get(':boatId')
  @UseGuards(JwtAuthGuard)
  findByBoat(@Param('boatId') boatId: string) {
    return this.messagesService.findByBoat(boatId);
  }

  // Alias para compatibilidad previa
  @Get('boat/:boatId')
  @UseGuards(JwtAuthGuard)
  findByBoatAlias(@Param('boatId') boatId: string) {
    return this.messagesService.findByBoat(boatId);
  }
}