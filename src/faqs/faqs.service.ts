import { Injectable } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from './entities/faq.entity';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: MongoRepository<Faq>,
  ) {}
  async create(createFaqDto: CreateFaqDto) {
    const faq = this.faqRepository.create(createFaqDto);
    return await this.faqRepository.save(faq);
  }

  async findAll() {
    return await this.faqRepository.find();
  }

  async findOne(id: string) {
    return await this.faqRepository.findOneBy({
      _id: new ObjectId(id),
    });
  }

  async update(id: string, updateFaqDto: UpdateFaqDto) {
    await this.faqRepository.update(new ObjectId(id), updateFaqDto);
    return {
      message: 'Faq upated successfully!',
    };
  }

  async remove(id: string) {
    return await this.faqRepository.delete(new ObjectId(id));
  }
}
