import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import * as moment from 'moment';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }
  @Get('confirm-subscription/:payment_intent_id')
  confirmSubscription(@Param('payment_intent_id') payment_intent_id: string) {
    return this.subscriptionsService.confirmSubscription(payment_intent_id);
  }

  @Get()
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }
  @Get('user/:user_id')
  findOneByUserId(@Param('user_id') user_id: string) {
    return this.subscriptionsService.findOneByUserId(user_id);
  }

  @Post('webhooks/stripe')
  stripeWebhook(@Request() req: any) {
    return this.subscriptionsService.stripeWebhookHandler(req);
  }
  @Post('assign')
  assignPlan(@Body() body: CreateSubscriptionDto) {
    if (!body.expiryDate) {
      body.expiryDate = moment().add(body.planDuration, 'days').toDate();
    }
    return this.subscriptionsService.create(body);
  }
}
