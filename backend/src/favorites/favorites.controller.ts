import { Controller, Get, Post, Delete, UseGuards, Request, Param } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Param('boatId') boatId: string) {
    return this.favoritesService.create({ boatId }, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    return this.favoritesService.findAll(req.user.userId);
  }

  @Delete(':boatId')
  @UseGuards(JwtAuthGuard)
  remove(@Param('boatId') boatId: string, @Request() req) {
    return this.favoritesService.remove(boatId, req.user.userId);
  }
}