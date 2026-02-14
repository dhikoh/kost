import { SetMetadata } from '@nestjs/common';

export const LIMIT_KEY = 'limit_resource';
export const CheckLimit = (resource: 'maxRooms' | 'maxStaff') => SetMetadata(LIMIT_KEY, resource);
