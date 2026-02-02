import { Controller, Get, Post, Delete, UseGuards, Request, Param, Body } from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('saved-searches')
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createSavedSearchDto: any) {
    return this.savedSearchesService.create(createSavedSearchDto, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    return this.savedSearchesService.findAll(req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.savedSearchesService.remove(id, req.user.userId);
  }
}