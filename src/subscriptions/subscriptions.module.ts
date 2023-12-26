import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Plan } from 'src/plans/entities/plan.entity';
import { User } from 'src/user/entities/user.entity';
import { PaymentsModule } from 'src/payments/payments.module';
import { Reference } from 'src/reference/entities/reference.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Plan, User, Reference]),
    PaymentsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
