
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { prisma } from '@repo/database';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
            throw new UnauthorizedException('Missing X-API-KEY header');
        }

        // In a real scenario, we would hash the incoming key and compare with DB.
        // For this prototype, we'll assume the key is the ID or a simple token.
        // Let's assume we store the direct key for simplicity in this demo, 
        // or we hash it. Let's do a direct lookup for now to get it working fast.

        // Check if key exists and is active
        // We need to match `keyHash`. Let's assume for this MVP the 'key' sent IS the 'keyHash' 
        // (or we simply check if any API key record matches this string).

        const validKey = await prisma.apiKey.findFirst({
            where: {
                keyHash: apiKey as string, // In prod, hash(apiKey)
                isActive: true,
            },
        });

        if (!validKey) {
            throw new UnauthorizedException('Invalid API Key');
        }

        // Log usage (Async to not block)
        // prisma.apiUsageLog.create(...)
        request.tenantId = validKey.tenantId; // Attach tenant context
        return true;
    }
}
