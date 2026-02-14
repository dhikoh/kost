import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard, TenantGuard)
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Get()
    findAll(@Request() req) {
        return this.invoiceService.findAll(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.invoiceService.findOne(req.user.tenantId, id);
    }

    @Post(':id/pay')
    pay(@Request() req, @Param('id') id: string, @Body() body: { amount: number, method: string }) {
        return this.invoiceService.pay(req.user.tenantId, id, body.amount, body.method);
    }
}
