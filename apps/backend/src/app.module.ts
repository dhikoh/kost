import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { StaffModule } from './modules/staff/staff.module';
import { PlanModule } from './modules/plan/plan.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { KostModule } from './modules/kost/kost.module';
import { RoomTypeModule } from './modules/room-type/room-type.module';
import { RoomModule } from './modules/room/room.module';
import { BookingModule } from './modules/booking/booking.module';
import { CustomerModule } from './modules/customer/customer.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { FinanceModule } from './modules/finance/finance.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    TenantModule,
    StaffModule,
    PlanModule,
    SubscriptionModule,
    KostModule,
    RoomTypeModule,
    RoomModule,
    BookingModule,
    CustomerModule,
    InvoiceModule,
    FinanceModule,
    PublicModule,
    // ThrottlerModule.forRoot([{
    //   ttl: 60000,
    //   limit: 100,
    // }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule { }
