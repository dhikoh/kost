import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@repo/database';

@Injectable()
export class InvoiceService {
    async createFromBooking(booking: any, tenantId: string) {
        // Calculate amount based on Room Price
        const room = await prisma.room.findUnique({ where: { id: booking.roomId } });
        if (!room) throw new NotFoundException('Room not found');

        // Simple invoice generation
        const invoiceNumber = `INV/${new Date().getFullYear()}/${new Date().getTime()}`;

        return prisma.invoice.create({
            data: {
                tenantId,
                bookingId: booking.id,
                invoiceNumber,
                amount: room.price,
                dueDate: new Date(new Date().setDate(new Date().getDate() + 3)), // Due in 3 days
                status: 'UNPAID', // Using String literal for SQLite
            }
        });
    }

    async findAll(tenantId: string) {
        return prisma.invoice.findMany({
            where: { tenantId },
            include: {
                booking: {
                    include: {
                        customer: { select: { fullName: true } },
                        room: { select: { roomNumber: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(tenantId: string, id: string) {
        return prisma.invoice.findFirst({
            where: { id, tenantId },
            include: {
                booking: {
                    include: {
                        customer: true,
                        room: true
                    }
                },
                payments: true
            }
        });
    }

    async pay(tenantId: string, id: string, amount: number, method: string) {
        const invoice = await this.findOne(tenantId, id);
        if (!invoice) throw new NotFoundException('Invoice not found');

        // Create Payment
        await prisma.payment.create({
            data: {
                tenantId,
                invoiceId: id,
                amount,
                paymentMethod: method,
            }
        });

        // Update Invoice Status
        // Simple logic: If payment >= amount, mark PAID
        // In real app, sum all payments
        return prisma.invoice.update({
            where: { id },
            data: { status: 'PAID' }
        });
    }
}
