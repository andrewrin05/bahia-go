import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { BoatsService } from './boats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('boats')
export class BoatsController {
  constructor(private readonly boatsService: BoatsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Request() req, @Body() createBoatDto: any) {
    console.log('Received create boat request', createBoatDto);
    try {
      return await this.boatsService.create(createBoatDto, req.user.userId);
    } catch (error) {
      console.error('Error creating boat:', error);
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.boatsService.findAllPublished();
  }

  @Get('search')
  findSearch(@Query() query: any) {
    return this.boatsService.searchPublished(query);
  }

  @Get(':id/availability')
  async availability(@Param('id') id: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }
    return this.boatsService.checkAvailability(id, startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boatsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() updateBoatDto: any) {
    return this.boatsService.update(id, updateBoatDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.boatsService.remove(id);
  }

  // Admin listing including no publicados
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllAdmin() {
    return this.boatsService.findAll();
  }
}