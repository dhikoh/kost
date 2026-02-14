import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const params = request.params;

        if (!user) {
            return true; // Allow if guarded by Public/Optional, otherwise JwtAuthGuard handles
        }

        // Superadmin bypass
        if (user.roles?.includes('SUPERADMIN')) {
            return true;
        }

        // If route has tenantId param, check match (if applicable)
        // Or if accessing tenant-specific resource, ensure user.tenantId is set

        if (!user.tenantId) {
            // Only Superadmin can be without tenantId in this context usually
            throw new ForbiddenException('Tenant context required');
        }

        return true;
    }
}
