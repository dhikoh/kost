import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/database';
import { InvoiceService } from '../invoice/invoice.service';
import { BookingGateway } from './booking.gateway';

@Injectable()
export class BookingService {
    constructor(
        private readonly invoiceService: InvoiceService,
        private readonly bookingGateway: BookingGateway
    ) { }

    findAll(tenantId: string) {
        return prisma.booking.findMany({
            where: { tenantId },
            include: {
                room: true,
                customer: true,
                tenant: { select: { name: true } }
            },
            orderBy: { startDate: 'desc' },
        });
    }

    async create(tenantId: string, data: any) {
        // 1. Create Booking
        const booking = await prisma.booking.create({
            data: {
                tenantId,
                roomId: data.roomId,
                customerId: data.customerId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                durationMonth: 1, // Simplified for now
                status: 'ACTIVE',
            },
        });

        // 2. Update Room Status
        await prisma.room.update({
            where: { id: data.roomId },
            data: { status: 'OCCUPIED', currentBookingId: booking.id }
        });

        // 3. Generate Invoice (Auto)
        await this.invoiceService.createFromBooking(booking, tenantId);

        // 4. Realtime Notification
        this.bookingGateway.notifyNewBooking(booking);

        return booking;
    }

    async remove(id: string, tenantId: string) {
        const booking = await prisma.booking.findFirst({ where: { id, tenantId } });
        if (booking) {
            // Free up room
            await prisma.room.update({
                where: { id: booking.roomId },
                data: { status: 'AVAILABLE', currentBookingId: null }
            });
        }
        return prisma.booking.deleteMany({
            where: { id, tenantId },
        });
    }
}
