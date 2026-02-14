import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionService } from '../subscription/subscription.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private subscriptionService: SubscriptionService
    ) { }

    // @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        console.log('AuthController.login MANUAL ENTRY', loginDto);
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        console.log('AuthController.login user validated', !!user);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() registerDto: any) {
        // Validation should ideally be done here with DTO
        if (!registerDto.email || !registerDto.password || !registerDto.fullName || !registerDto.kostName) {
            throw new Error('Missing required fields');
        }
        return this.authService.register(registerDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req) {
        const user = req.user;
        if (user.tenantId) {
            const plan = await this.subscriptionService.getCurrentPlan(user.tenantId);
            return { ...user, plan };
        }
        return user;
    }

    @Get('ping')
    ping() {
        console.log('AuthController.ping PONG');
        return 'pong';
    }
}
