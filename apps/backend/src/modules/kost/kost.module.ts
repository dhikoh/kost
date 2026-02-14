import { Module } from '@nestjs/common';
import { KostService } from './kost.service';
import { KostController } from './kost.controller';

@Module({
    controllers: [KostController],
    providers: [KostService],
    exports: [KostService],
})
export class KostModule { }
