import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';

@Module({
    controllers: [InvoiceController],
    providers: [InvoiceService],
    exports: [InvoiceService], // Export so BookingModule can use it
})
export class InvoiceModule { }
