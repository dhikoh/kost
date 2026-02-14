
import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcrypt';
const bcrypt = { compare: async (s: string, h: string) => true, genSalt: async () => 'salt', hash: async (s: string, salt: string) => 'hash' };

const prisma = new PrismaClient();

// Mock UsersService
class UsersService {
    async findOne(email: string) {
        console.log('UsersService.findOne called with:', email);
        try {
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    tenant: true,
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });
            console.log('UsersService.findOne returned keys:', Object.keys(user || {}));
            if (user?.roles) {
                console.log('Roles found:', user.roles.length);
                console.log('First role structure:', JSON.stringify(user.roles[0], null, 2));
            }
            return user;
        } catch (e) {
            console.error('UsersService.findOne Error:', e);
            throw e;
        }
    }
}

// Mock JwtService
const jwtService = {
    sign: (payload: any) => 'mock_token'
};

// Mock AuthService
class AuthService {
    usersService: UsersService;
    jwtService: any;

    constructor(usersService: UsersService, jwtService: any) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }

    async validateUser(email: string, pass: string) {
        console.log('AuthService.validateUser called');
        const user = await this.usersService.findOne(email);
        if (user) {
            console.log('User found in validateUser');
            // Simulate bcrypt compare
            const isMatch = await bcrypt.compare(pass, user.passwordHash);
            console.log('Password match:', isMatch);
            if (isMatch) {
                const { passwordHash, ...result } = user;
                return result;
            }
        }
        return null;
    }

    async login(user: any) {
        console.log('AuthService.login called');
        try {
            const roles = user.roles ? user.roles.map((r: any) => r.role.name) : [];
            console.log('Mapped roles:', roles);
            const payload = { email: user.email, sub: user.id, tenantId: user.tenantId, roles };
            console.log('Payload:', payload);

            const token = this.jwtService.sign(payload);
            const response = {
                access_token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    tenantId: user.tenantId,
                    roles,
                },
            };
            console.log('Login response constructed');
            return response;
        } catch (error) {
            console.error('AuthService.login Error:', error);
            throw error;
        }
    }
}

async function main() {
    const usersService = new UsersService();
    const authService = new AuthService(usersService, jwtService);

    console.log('Starting execution...');
    const email = 'owner@demo.com';
    const pass = 'owner123';

    try {
        const validatedUser = await authService.validateUser(email, pass);
        console.log('Validated User keys:', Object.keys(validatedUser || {}));

        if (validatedUser) {
            const loginRes = await authService.login(validatedUser);
            console.log('Login Result:', JSON.stringify(loginRes, null, 2));
        } else {
            console.log('Validation failed');
        }
    } catch (e) {
        console.error('Main Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
