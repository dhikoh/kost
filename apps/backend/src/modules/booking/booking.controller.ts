import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard, TenantGuard)
export class BookingController {
    constructor(private readonly bookingService: BookingService) { }

    @Get()
    findAll(@Request() req) {
        return this.bookingService.findAll(req.user.tenantId);
    }

    @Post()
    create(@Request() req, @Body() data: any) {
        return this.bookingService.create(req.user.tenantId, data);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.bookingService.remove(id, req.user.tenantId);
    }
}
