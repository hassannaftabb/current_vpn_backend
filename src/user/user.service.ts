import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MongoRepository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ProviderEnum } from './entities/enums/provider.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
    private jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    if (
      createUserDto.provider === ProviderEnum.LOCAL &&
      !createUserDto.password
    ) {
      throw new NotFoundException('Password must be provided!');
    } else {
      const userToCreate: any = {
        email: createUserDto.email,
        ...(createUserDto.password && {
          password: await bcrypt.hash(createUserDto.password, 10),
        }),
        ...(createUserDto.googleAccessToken && {
          googleAccessToken: createUserDto.googleAccessToken,
        }),
        name: createUserDto.name,
      };
      const isExistingUser = await this.getUserByEmail(createUserDto.email);
      if (isExistingUser) {
        throw new InternalServerErrorException('User already exists!');
      }
      const user: any = this.userRepository.create(userToCreate);
      return this.userRepository
        .save(user)
        .then(async (user) => {
          const payloadForToken = {
            email: user.email,
            id: user._id,
            name: user.name,
          };
          const token = this.jwtService.sign(payloadForToken);
          return { ...user, accessToken: token, id: user._id };
        })
        .catch((err) => {
          throw new HttpException(`${err}`, HttpStatus.BAD_REQUEST);
        });
    }
  }
  async getUserByEmail(email: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: email },
    });
    if (existingUser) {
      return existingUser;
    } else {
      return null;
    }
  }
  async getUserById(id: string | ObjectId): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (existingUser) {
      return existingUser;
    } else {
      return null;
    }
  }

  getAllUsers() {
    return this.userRepository.find();
  }
  async deletUserById(userId: string) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('No such user with this id');
    }
    await this.userRepository.delete({ _id: new ObjectId(userId) });
    return this.getAllUsers();
  }
  async updateUserById(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('No such user with this id');
    }
    const userToUpdate = {
      name: updateUserDto.name,
      email: updateUserDto.email,
      password:
        updateUserDto.password !== '' ? updateUserDto.password : user.password,
      phoneNumber: updateUserDto.phoneNumber,
    };
    await this.userRepository
      .update({ _id: new ObjectId(userId) }, userToUpdate)
      .then(async () => {
        return await this.getUserById(userId);
      });
  }
}
