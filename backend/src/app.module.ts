import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LocationModule } from './location/location.module';
import { PropertyModule } from './property/property.module';
import { BookingModule } from './booking/booking.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationModule } from './notification/notification.module';
import { SettingsModule } from './settings/settings.module';
import { MediaModule } from './media/media.module';
import { LeadModule } from './lead/lead.module';
import { CustomerModule } from './customer/customer.module';
import { SupplierModule } from './supplier/supplier.module';
import { ReportModule } from './report/report.module';
import { IntegrationModule } from './integration/integration.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    LocationModule,
    PropertyModule,
    BookingModule,
    DashboardModule,
    NotificationModule,
    SettingsModule,
    MediaModule,
    LeadModule,
    CustomerModule,
    SupplierModule,
    ReportModule,
    IntegrationModule,
    BlogModule,
  ],
})
export class AppModule {}
