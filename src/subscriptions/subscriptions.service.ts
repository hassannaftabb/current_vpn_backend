import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { MongoRepository } from 'typeorm';
import { Plan } from 'src/plans/entities/plan.entity';
import { Subscription } from './entities/subscription.entity';
import { PaymentsService } from 'src/payments/payments.service';
import * as moment from 'moment';
import { generateRandomPassword } from './utils';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { Reference } from 'src/reference/entities/reference.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
    @InjectRepository(Plan)
    private readonly planRepository: MongoRepository<Plan>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: MongoRepository<Subscription>,
    private readonly paymentsService: PaymentsService,
    @InjectRepository(Reference)
    private readonly referenceRepository: MongoRepository<Reference>,
  ) {}
  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    applyReferall?: boolean,
  ) {
    const user = await this.userRepository.findOneBy({
      _id: new ObjectId(createSubscriptionDto.userId),
    });
    const plan = await this.planRepository.findOneBy({
      name: createSubscriptionDto.planName,
    });
    if (!user || !plan) {
      throw new NotFoundException('Missing plan or user.');
    }

    const existingSubscriptionForPlan =
      await this.subscriptionRepository.findOne({
        where: {
          planId: plan._id,
          userId: new ObjectId(createSubscriptionDto.userId),
        },
      });
    const previousSubscription = await this.subscriptionRepository.findOne({
      where: {
        userId: new ObjectId(createSubscriptionDto.userId),
        isActive: true,
        isExpired: false,
      },
    });
    if (
      existingSubscriptionForPlan &&
      existingSubscriptionForPlan.isActive &&
      !existingSubscriptionForPlan.isExpired
    ) {
      throw new BadRequestException(
        'You already have the same active plan. Please choose another plan to continue.',
      );
    }

    if (user.referredBy && applyReferall) {
      const referall = await this.userRepository.findOne({
        where: {
          _id: new ObjectId(user.referredBy),
        },
      });
      const referallSubscription = await this.subscriptionRepository.findOne({
        where: {
          userId: referall._id,
          isActive: true,
          isExpired: false,
        },
      });
      const referallSubscriptionExpiryDate = referallSubscription?.expiryDate
        ? referallSubscription?.expiryDate
        : new Date();
      const expiryDate = moment(referallSubscriptionExpiryDate)
        .add(1, 'month')
        .toDate();
      const referenceLog = this.referenceRepository.create({
        code: user.referredByCode,
        owner: referall._id,
        receiver: user._id,
        status: 'ACCEPTED',
      });
      await this.referenceRepository.save(referenceLog);
      await this.create(
        {
          expiryDate,
          isActive: true,
          isExpired: false,
          planName: 'MONTHLY_PRO',
          userId: referall._id,
        },
        false,
      );
    }
    const subscription = {
      ...createSubscriptionDto,
      user: user,
      plan: plan,
      userId: user._id,
    };
    if (previousSubscription) {
      previousSubscription.isActive = false;
      previousSubscription.isExpired = true;

      await this.subscriptionRepository.save(previousSubscription);
    }

    const created_subscription =
      this.subscriptionRepository.create(subscription);
    user.isPremiumUser = plan.name === 'FREE' ? false : true;
    user.subscription = created_subscription;
    await this.userRepository.save(user);

    return await this.subscriptionRepository.save(created_subscription);
  }

  findAll() {
    return `This action returns all subscriptions`;
  }

  async findOne(id: string) {
    return await this.subscriptionRepository.findOne({
      where: { _id: new ObjectId(id) },
      relations: {
        user: true,
      },
    });
  }
  async findOneByUserId(id: string | ObjectId) {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        userId: new ObjectId(id),
        isActive: true,
        isExpired: false,
      },
    });
    if (!subscription) return null;
    return subscription;
  }

  async confirmSubscription(paymentIntentId) {
    const paymentIntent = await this.paymentsService.getPaymentIntent(
      paymentIntentId,
    );
    const plan = await this.planRepository.findOneBy({
      _id: new ObjectId(paymentIntent.metadata.plan_id),
    });

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not succeeded, please try again!');
    }

    if (paymentIntent.amount_received / 100 != parseFloat(plan.price)) {
      throw new BadRequestException('Not enough payment for plan subscription');
    }
    const expiryDate = moment().add(plan.durationInDays, 'days').toDate();
    await this.create({
      expiryDate,
      isActive: true,
      isExpired: false,
      planName: plan.name,
      userId: paymentIntent.metadata.user_id,
    });
  }

  async validateAndGetUserActiveSubscription(userId: string) {
    const subscription = await this.subscriptionRepository.findOneBy({
      userId: new ObjectId(userId),
      isActive: true,
      isExpired: false,
    });
    if (
      subscription &&
      subscription.plan.name !== 'FREE' &&
      moment().format('DD/MM/YYYY') ===
        moment(subscription.expiryDate).format('DD/MM/YYYY')
    ) {
      const userSubscription = await this.create({
        expiryDate: null,
        isActive: true,
        isExpired: false,
        planName: 'FREE',
        userId: userId,
      });
      return userSubscription;
    } else {
      return subscription;
    }
  }
  update(id: number) {
    return `This action updates a #${id} subscription`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscription`;
  }

  async stripeWebhookHandler(request) {
    switch (request.body.type) {
      case 'checkout.session.completed':
        const stripeSessionInfo = request.body.data.object;
        if (stripeSessionInfo.payment_status === 'paid') {
          const planName = stripeSessionInfo.metadata.plan_name;

          if (!planName) {
            throw new BadRequestException(
              "The payment doesn't have a valid plan",
            );
          }

          const searchParams = {
            name: planName.trim(),
          };
          const plan = await this.planRepository.findOneBy(searchParams);

          const expiryDate = moment().add(plan.durationInDays, 'days').toDate();

          const existingUser = await this.userRepository.findOneBy({
            email: stripeSessionInfo.customer_details.email,
          });

          if (existingUser) {
            await this.create(
              {
                expiryDate,
                isActive: true,
                isExpired: false,
                planName: plan.name,
                userId: existingUser._id,
              },
              true,
            );
          } else {
            const randPassword = generateRandomPassword(12);
            const newUser = this.userRepository.create({
              email: stripeSessionInfo.customer_details.email,
              name: stripeSessionInfo.customer_details.name,
              password: await bcrypt.hash(randPassword, 10),
            });

            await this.userRepository
              .save(newUser)
              .then(async (createdUser) => {
                await this.create({
                  expiryDate,
                  isActive: true,
                  isExpired: false,
                  planName: plan.name,
                  userId: createdUser._id,
                });
              });
          }
        }

      default:
        break;
    }

    return true;
  }
}
