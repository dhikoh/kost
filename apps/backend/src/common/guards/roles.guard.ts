import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();

        // Expand 'TENANT' to include 'OWNER' and 'STAFF'
        // Expand 'TENANT_STAFF' to include 'STAFF'
        // This allows using 'TENANT' as a group in decorators
        const effectiveRequiredRoles = new Set<string>();
        requiredRoles.forEach(role => {
            effectiveRequiredRoles.add(role);
            if (role === 'TENANT') {
                effectiveRequiredRoles.add('OWNER');
                effectiveRequiredRoles.add('STAFF'); // Assuming STAFF is the name
            }
            if (role === 'TENANT_STAFF') {
                effectiveRequiredRoles.add('STAFF');
            }
        });

        // console.log('RolesGuard: required=', requiredRoles, 'effective=', Array.from(effectiveRequiredRoles), 'user=', user.roles);

        return Array.from(effectiveRequiredRoles).some((role) => user.roles?.includes(role));
    }
}
