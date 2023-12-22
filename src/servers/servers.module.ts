import { Module } from '@nestjs/common';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from './entities/server.entity';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { User } from 'src/user/entities/user.entity';
import { Plan } from 'src/plans/entities/plan.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { PaymentsService } from 'src/payments/payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Server, User, Plan, Subscription]),
    SubscriptionsModule,
  ],
  controllers: [ServersController],
  providers: [ServersService, SubscriptionsService, PaymentsService],
})
export class ServersModule {}