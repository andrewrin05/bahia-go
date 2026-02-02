import { Module } from '@nestjs/common';
import { BoatsService } from './boats.service';
import { BoatsController } from './boats.controller';

@Module({
  providers: [BoatsService],
  controllers: [BoatsController],
})
export class BoatsModule {}