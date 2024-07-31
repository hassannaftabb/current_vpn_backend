import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from './entities/server.entity';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ServersService {
  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: MongoRepository<Server>,
    private subscriptionService: SubscriptionsService,
    private readonly httpService: HttpService,
  ) {}
  async create(createServerDto: CreateServerDto) {
    const server = this.serverRepository.create(createServerDto);
    return await this.serverRepository.save(server);
  }

  async findAll() {
    const getFlagUrl = (countryCode) =>
      `https://flagcdn.com/h40/${countryCode}.png`;

    const servers = await this.serverRepository.find();
    const serversWithFlags = servers.map((server) => {
      const flagUrl = server.countryCode
        ? getFlagUrl(server.countryCode)
        : null;
      return { ...server, flagUrl };
    });

    return serversWithFlags;
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

  async getOvpnConfig(userId, serverIp) {
    try {
      const subscription =
        await this.subscriptionService.validateAndGetUserActiveSubscription(
          userId,
        );
      const serverDetails = await this.serverRepository.findOne({
        where: {
          serverIP: serverIp.trim(),
        },
      });
      if (!serverDetails) {
        throw new NotFoundException('Server record not found.');
      }
      if (serverDetails.isPremium && subscription.plan?.name === 'FREE') {
        throw new UnauthorizedException(
          'You are trying to access a premium server, please upgrade your plan first.',
        );
      }

      const ovpnConfig = await this.httpService
        .get(`http://${serverDetails.serverIP}:3000/add-user?userID=${userId}`)
        .toPromise();

      return ovpnConfig.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
