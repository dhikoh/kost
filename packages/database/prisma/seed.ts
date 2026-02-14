import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding...');

    // 1. Create Roles
    const roles = [
        { name: 'SUPERADMIN', level: 99 },
        { name: 'OWNER', level: 50 },
        { name: 'STAFF', level: 10 },
        { name: 'CUSTOMER', level: 1 },
    ];

    for (const r of roles) {
        await prisma.role.upsert({
            where: { name: r.name },
            update: {},
            create: r,
        });
        console.log(`  Created role: ${r.name}`);
    }

    // 2. Create Plans
    // Plan name is not unique in schema, so we check first
    const plans = [
        {
            name: 'Basic',
            price: 100000,
            maxRooms: 10,
            maxStaff: 1,
            maxApiCalls: 1000,
            allowMultiBranch: false,
            allowFinance: false,
            allowExport: false,
        },
        {
            name: 'Pro',
            price: 250000,
            maxRooms: 50,
            maxStaff: 5,
            maxApiCalls: 10000,
            allowMultiBranch: true,
            allowFinance: true,
            allowExport: true,
        },
        {
            name: 'Enterprise',
            price: 500000,
            maxRooms: 9999,
            maxStaff: 9999,
            maxApiCalls: 100000,
            allowMultiBranch: true,
            allowFinance: true,
            allowExport: true,
        },
    ];

    for (const p of plans) {
        const existing = await prisma.plan.findFirst({ where: { name: p.name } });
        if (!existing) {
            await prisma.plan.create({ data: p });
            console.log(`  Created plan: ${p.name}`);
        } else {
            console.log(`  Plan ${p.name} already exists.`);
        }
    }

    // 3. Create Superadmin Tenant
    const adminTenant = await prisma.tenant.upsert({
        where: { slug: 'sysadmin' },
        update: {},
        create: {
            name: 'System Administrator',
            slug: 'sysadmin',
            address: 'Cloud',
            phone: '0000000000',
            isActive: true,
        },
    });
    console.log(`  Created admin tenant: ${adminTenant.name}`);

    // 4. Create Superadmin User
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash('admin123', salt);
    const superadminRole = await prisma.role.findUnique({ where: { name: 'SUPERADMIN' } });

    if (superadminRole) {
        await prisma.user.upsert({
            where: { email: 'admin@modula.click' },
            update: {
                passwordHash,
            },
            create: {
                email: 'admin@modula.click',
                fullName: 'Super Admin',
                passwordHash,
                phone: '081234567890',
                tenantId: adminTenant.id,
                roles: {
                    create: { roleId: superadminRole.id }
                }
            },
        });
        console.log(`  Created superadmin: admin@modula.click`);
    }

    // 5. Create Demo Tenant (for testing)
    const demoPlan = await prisma.plan.findFirst({ where: { name: 'Pro' } });

    const demoTenant = await prisma.tenant.upsert({
        where: { slug: 'demo-kost' },
        update: {},
        create: {
            name: 'Demo Kost Bahagia',
            slug: 'demo-kost',
            address: 'Jl. Demo No. 123, Jakarta',
            phone: '081299998888',
            isActive: true,
            subscription: {
                create: {
                    planId: demoPlan?.id as string,
                    status: 'ACTIVE',
                    startDate: new Date(),
                    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                }
            }
        },
    });
    console.log(`  Created demo tenant: ${demoTenant.name}`);

    // 6. Create Demo Owner User
    const ownerPass = await bcrypt.hash('owner123', salt);
    const ownerRole = await prisma.role.findUnique({ where: { name: 'OWNER' } });

    if (ownerRole) {
        await prisma.user.upsert({
            where: { email: 'owner@demo.com' },
            update: { passwordHash: ownerPass },
            create: {
                email: 'owner@demo.com',
                fullName: 'Bapak Kost Demo',
                passwordHash: ownerPass,
                phone: '081233334444',
                tenantId: demoTenant.id,
                roles: {
                    create: { roleId: ownerRole.id }
                }
            }
        });
        console.log(`  Created demo owner: owner@demo.com`);
        console.log(`  Created demo owner: owner@demo.com`);
    }

    // 7. Create Demo Kost & Rooms
    const demoKost = await prisma.kost.create({
        data: {
            tenantId: demoTenant.id,
            name: 'Kost Bahagia Pusat',
            description: 'Kost ternyaman di Jakarta Pusat',
        }
    });
    console.log(`  Created demo kost: ${demoKost.name}`);

    const demoRoomType = await prisma.roomType.create({
        data: {
            tenantId: demoTenant.id,
            name: 'Deluxe AC',
            basePrice: 1500000,
            facilities: '["AC", "WiFi", "Kamar Mandi Dalam"]', // Stringified JSON
        }
    });
    console.log(`  Created room type: ${demoRoomType.name}`);

    // Create 5 Rooms
    for (let i = 1; i <= 5; i++) {
        await prisma.room.create({
            data: {
                tenantId: demoTenant.id,
                kostId: demoKost.id,
                roomTypeId: demoRoomType.id,
                roomNumber: `10${i}`,
                price: demoRoomType.basePrice,
                status: 'AVAILABLE',
            }
        });
    }
    console.log(`  Created 5 demo rooms (101-105)`);

    // 8. Create Demo Customer
    const demoCustomer = await prisma.customer.create({
        data: {
            tenantId: demoTenant.id,
            fullName: 'Anak Kost Demo',
            phone: '08123456789',
            email: 'anakkost@gmail.com',
            ktpNumber: '3301234567890001',
            address: 'Jalan Raya No. 1',
        }
    });

    // 9. Create API Key for Demo Tenant
    const apiKey = await prisma.apiKey.create({
        data: {
            tenantId: demoTenant.id,
            keyHash: 'DEMO-API-KEY-123', // Simple key for testing
            isActive: true,
        }
    });
    console.log(`  Created API Key: ${apiKey.keyHash}`);

    console.log(`  Created demo customer: ${demoCustomer.fullName}`);

    // 10. Create Basic Plan Tenant & User (for testing restrictions)
    const basicPlan = await prisma.plan.findFirst({ where: { name: 'Basic' } });
    if (basicPlan) {
        const basicTenant = await prisma.tenant.create({
            data: {
                name: 'Kost Hemat',
                slug: 'kost-hemat',
                address: 'Jl. Hemat Pangkal Kaya',
                phone: '0899999999',
                isActive: true,
                subscription: {
                    create: {
                        planId: basicPlan.id,
                        status: 'ACTIVE',
                        startDate: new Date(),
                        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    }
                }
            }
        });

        if (ownerRole) {
            const basicPass = await bcrypt.hash('basic123', salt);
            await prisma.user.create({
                data: {
                    email: 'basic@demo.com',
                    fullName: 'Juragan Hemat',
                    passwordHash: basicPass,
                    phone: '08988887777',
                    tenantId: basicTenant.id,
                    roles: {
                        create: [{ roleId: ownerRole.id }]
                    }
                }
            });
            console.log(`  Created basic user: basic@demo.com`);
        }
    }

    // 11. Create Staff User for Demo Tenant
    const staffRole = await prisma.role.findUnique({ where: { name: 'STAFF' } });
    if (staffRole) {
        const staffPass = await bcrypt.hash('staff123', salt);
        await prisma.user.create({
            data: {
                email: 'staff@demo.com',
                fullName: 'Mbak Staff',
                passwordHash: staffPass,
                phone: '08777776666',
                tenantId: demoTenant.id,
                roles: {
                    create: [{ roleId: staffRole.id }]
                }
            }
        });
        console.log(`  Created staff user: staff@demo.com`);
    }

    // 12. Create Dummy Booking & Expense for Demo Tenant
    // Get some rooms
    const rooms = await prisma.room.findMany({ where: { tenantId: demoTenant.id } });
    if (rooms.length > 0) {
        await prisma.booking.create({
            data: {
                tenantId: demoTenant.id,
                roomId: rooms[0].id,
                customerId: demoCustomer.id,
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                durationMonth: 1,
                status: 'CONFIRMED',
            }
        });
        console.log(`  Created dummy booking`);
    }

    await prisma.expense.create({
        data: {
            tenantId: demoTenant.id,
            title: 'Listrik Bulan Ini',
            amount: 500000,
            category: 'UTILITIES',
            expenseDate: new Date(),
        }
    });
    console.log(`  Created dummy expense`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
