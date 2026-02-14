
import { SetMetadata } from '@nestjs/common';

export const CheckLimit = (resource: 'maxRooms' | 'maxStaff' | 'maxKosts') => SetMetadata('checkLimit', resource);
