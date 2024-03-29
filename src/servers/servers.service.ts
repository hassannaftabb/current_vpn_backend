import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from './entities/server.entity';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { Servers } from './enums/server.enum';
import { HttpService } from '@nestjs/axios';
import { Stream } from 'stream';

@Injectable()
export class ServersService {
  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: MongoRepository<Server>,
    private subscriptionService: SubscriptionsService,
    private readonly httpService: HttpService
  ) { }
  async create(createServerDto: CreateServerDto) {
    const server = this.serverRepository.create(createServerDto);
    return await this.serverRepository.save(server);
  }

  findAll() {
    return this.serverRepository.find();
  }

  async findOne(id: string) {
    return await this.serverRepository.findOne({
      where: {
        id: new ObjectId(id),
      },
    });
  }

  async update(id: string, updateServerDto: UpdateServerDto) {
    await this.serverRepository
      .update(new ObjectId(id), updateServerDto)
      .then(async () => {
        return await this.serverRepository.findOneBy({
          id: new ObjectId(id),
        });
      });
  }

  async remove(id: string) {
    return await this.serverRepository.delete(new ObjectId(id));
  }

  async getConnectionDetails(userId, server) {
    if (!Servers[server]) {
      throw new NotFoundException('Server record not found.');
    }
    const subscription =
      await this.subscriptionService.validateAndGetUserActiveSubscription(
        userId,
      );
    if (!(subscription.plan.name === 'FREE')) {
      return this.serverRepository.findOneBy({
        name: Servers[server],
      });
    }
  }

  async getOvpnConfig(userId, server) {
    if (!Servers[server]) {
      throw new NotFoundException('Server record not found.');
    }

    const serverDetails = await this.serverRepository.findOneBy({
      name: Servers[server],
    });

    const ovpnConfig = await this.httpService
      .get(`http://${serverDetails.serverIP}:3000/add-user?userID=${userId}`)
      .toPromise();

    return ovpnConfig.data;
  }
}
