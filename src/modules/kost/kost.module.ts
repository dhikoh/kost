import { Module } from '@nestjs/common';
import { KostService } from './kost.service';
import { KostController } from './kost.controller';

@Module({
  providers: [KostService],
  controllers: [KostController]
})
export class KostModule {}
