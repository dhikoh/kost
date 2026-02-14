import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Get()
    findAll(@Request() req) {
        return this.customerService.findAll(req.user.tenantId);
    }

    @Post()
    create(@Request() req, @Body() data: any) {
        return this.customerService.create(req.user.tenantId, data);
    }

    @Put(':id')
    update(@Request() req, @Param('id') id: string, @Body() data: any) {
        return this.customerService.update(id, req.user.tenantId, data);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.customerService.remove(id, req.user.tenantId);
    }
}
