import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServersModule } from './servers/servers.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentsModule } from './payments/payments.module';
import { PlansModule } from './plans/plans.module';
import { ReferenceModule } from './reference/reference.module';
import { FaqsModule } from './faqs/faqs.module';
import { UserTimeCronsService } from './crons/time.cron';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: 'mongodb+srv://hassannaftabb:kLBgCS61OZZdjxfd@main.6j9dolg.mongodb.net/?retryWrites=true&w=majority',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
    }),
    UserModule,
    AuthModule,
    ServersModule,
    SubscriptionsModule,
    PaymentsModule,
    PlansModule,
    ReferenceModule,
    FaqsModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserTimeCronsService],
})
export class AppModule {}
