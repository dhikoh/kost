const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'owner@demo.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            roles: {
                include: {
                    role: true
                }
            }
        }
    });

    console.log('User:', JSON.stringify(user, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
