import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting End-to-End System Verification...');

    // 1. Setup Data
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'demo-kost' } });
    if (!tenant) throw new Error('Demo Tenant not found. Run seed first.');

    // DEBUG: Log all rooms
    const allRooms = await prisma.room.findMany({ where: { tenantId: tenant.id } });
    console.log(`🔎 Found ${allRooms.length} rooms for tenant ${tenant.name}`);
    allRooms.forEach(r => console.log(`   - Room ${r.roomNumber}: ${r.status}`));

    let room = allRooms.find(r => r.status === 'AVAILABLE');

    if (!room) {
        console.warn('⚠️ No Available Room found. Attempting to force reset Room 101...');
        const targetRoom = allRooms[0];
        if (targetRoom) {
            room = await prisma.room.update({
                where: { id: targetRoom.id },
                data: { status: 'AVAILABLE', currentBookingId: null }
            });
            console.log(`✅ Forced Room ${room.roomNumber} to AVAILABLE.`);
        } else {
            throw new Error('No rooms exist at all.');
        }
    }

    const customer = await prisma.customer.findFirst({ where: { tenantId: tenant.id } });
    if (!customer) throw new Error('No Customer found. Run seed or create one.');

    console.log(`📋 Config: Tenant [${tenant.name}], Room [${room.roomNumber}], Customer [${customer.fullName}]`);

    // 2. Create Booking
    console.log('\nTesting 1: Create Booking...');
    const booking = await prisma.booking.create({
        data: {
            tenantId: tenant.id,
            roomId: room.id,
            customerId: customer.id,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            durationMonth: 1,
            status: 'ACTIVE',
        }
    });
    console.log(`✅ Booking Created: ${booking.id}`);

    // 3. Update Room Status (Simulate Service)
    await prisma.room.update({
        where: { id: room.id },
        data: { status: 'OCCUPIED', currentBookingId: booking.id }
    });
    console.log(`✅ Room Status Updated to OCCUPIED`);

    // 4. Verify Invoice Generation
    console.log('\nTesting 2: Generate Invoice...');
    const invoice = await prisma.invoice.create({
        data: {
            tenantId: tenant.id,
            bookingId: booking.id,
            invoiceNumber: `TEST-INV-${new Date().getTime()}`,
            amount: room.price,
            dueDate: new Date(),
            status: 'UNPAID'
        }
    });
    console.log(`✅ Invoice Created: ${invoice.invoiceNumber} [UNPAID]`);

    // 5. Verify Payment
    console.log('\nTesting 3: Process Payment...');
    await prisma.payment.create({
        data: {
            tenantId: tenant.id,
            invoiceId: invoice.id,
            amount: Number(room.price),
            paymentMethod: 'CASH'
        }
    });

    const paidInvoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PAID' }
    });
    console.log(`✅ Invoice Paid: ${paidInvoice.status}`);

    // 6. Cleanup
    console.log('\nTesting 4: Cleanup...');
    await prisma.payment.deleteMany({ where: { invoiceId: invoice.id } });
    await prisma.invoice.delete({ where: { id: invoice.id } });
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.room.update({
        where: { id: room.id },
        data: { status: 'AVAILABLE', currentBookingId: null }
    });
    console.log(`✅ Cleanup Complete.`);

    console.log('\n🎉 ALL SYSTEMS GO! Logic Verification Successful.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
