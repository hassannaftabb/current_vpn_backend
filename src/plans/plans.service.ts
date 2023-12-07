import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}
  async create(createPlanDto: CreatePlanDto) {
    const plan = this.planRepository.create(createPlanDto);
    await this.planRepository.save(plan);

    return plan;
  }

  async findAll() {
    const plans = await this.planRepository.find();
    const premiumPlans = plans.filter((plan) => plan.name !== 'FREE');
    return premiumPlans;
  }

  async findOne(id: string) {
    const plan = await this.planRepository.findOneBy({ _id: new ObjectId(id) });

    if (!plan) {
      throw new Error('Plan not found');
    }

    return plan;
  }
}
