import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
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
import { ChangePasswordDto } from './dto/update-pass.dto';
import { Device } from './entities/device.type';
import { Reference } from 'src/reference/entities/reference.entity';
import { generateOtp, generateOtpExpiry, isOtpExpired } from './utils/utils';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectRepository(Reference)
    private readonly referenceRepository: MongoRepository<Reference>,
  ) {}
  generateRandomReferenceCode(length = 10) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return `CV${result}`;
  }

  async generateRefreshToken(email, id, name) {
    const payloadForToken = {
      email: email,
      id: id,
      name: name,
    };

    return this.jwtService.sign(payloadForToken, {
      expiresIn: '60d',
    });
  }
  async generateAccessToken(email, id, name) {
    const payloadForToken = {
      email: email,
      id: id,
      name: name,
    };

    return this.jwtService.sign(payloadForToken);
  }

  async validateRefreshTokenAndGenerateAccessToken(refreshToken) {
    const payload = await this.jwtService.verifyAsync(refreshToken);
    if (payload) {
      const user = await this.getUserById(payload.id);
      if (!user) {
        throw new NotFoundException('User does not exist!');
      }

      if (user.refreshToken === refreshToken) {
        const accessToken = await this.generateAccessToken(
          user.email,
          user._id,
          user.name,
        );
        return { ...user, accessToken };
      }
    } else {
      throw new UnauthorizedException(
        'Refresh token is expired please login again.',
      );
    }
  }

  async create(createUserDto: CreateUserDto) {
    if (
      createUserDto.provider === ProviderEnum.LOCAL &&
      !createUserDto.password
    ) {
      throw new NotFoundException('Password must be provided!');
    } else {
      const referall = await this.userRepository.findOne({
        where: {
          selfReference: createUserDto.reference,
        },
      });
      const userToCreate: any = {
        email: createUserDto.email,
        ...(createUserDto.password && {
          password: await bcrypt.hash(createUserDto.password, 10),
        }),
        ...(createUserDto.googleAccessToken && {
          googleAccessToken: createUserDto.googleAccessToken,
        }),
        name: createUserDto.name,
        time: 15,
        status: 'ACTIVE',
        devices: [createUserDto.device],
        referredBy: referall ? referall._id : null,
        selfReference: this.generateRandomReferenceCode(),
        referredByCode: referall ? referall.selfReference : null,
      };
      const isExistingUser = await this.getUserByEmail(createUserDto.email);
      if (isExistingUser) {
        throw new InternalServerErrorException('User already exists!');
      }

      const user: any = this.userRepository.create(userToCreate);

      return this.userRepository
        .save(user)
        .then(async (user) => {
          const refreshToken = await this.generateRefreshToken(
            user.email,
            user._id,
            user.name,
          );
          const payloadForToken = {
            email: user.email,
            id: user._id,
            name: user.name,
          };
          user.refreshToken = refreshToken;
          await this.userRepository.save(user);
          const token = this.jwtService.sign(payloadForToken);
          return { ...user, accessToken: token, _id: user._id, refreshToken };
        })
        .catch((err) => {
          throw new HttpException(`${err}`, HttpStatus.BAD_REQUEST);
        });
    }
  }

  async refreshUserToken(userId) {
    const user = await this.getUserById(userId);
    const refreshToken = await this.generateRefreshToken(
      user.email,
      user._id,
      user.name,
    );
    user.refreshToken = refreshToken;
    return await this.userRepository.save(user);
  }
  async getUserByEmail(email: string, device?: Device): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: email, status: 'ACTIVE' },
    });
    if (existingUser) {
      if (device) {
        const existingDeviceIdx = existingUser.devices.findIndex(
          (d) => d.id === device.id,
        );
        if (existingDeviceIdx !== -1) {
          existingUser.devices[existingDeviceIdx] = device;
        } else {
          existingUser.devices = [...existingUser.devices, device];
        }
        await this.userRepository.save(existingUser);
      }
      return existingUser;
    } else {
      return null;
    }
  }
  async getUserById(id: string | ObjectId, device?: Device): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { _id: new ObjectId(id), status: 'ACTIVE' },
    });

    if (existingUser) {
      if (device) {
        const existingDeviceIdx = existingUser.devices.findIndex(
          (d) => d.id === device.id,
        );
        if (existingDeviceIdx !== -1) {
          existingUser.devices[existingDeviceIdx] = device;
        } else {
          existingUser.devices = [...existingUser.devices, device];
        }
        await this.userRepository.save(existingUser);
      }
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
      location: updateUserDto.location,
    };
    await this.userRepository
      .update({ _id: new ObjectId(userId) }, userToUpdate)
      .then(async () => {
        return await this.getUserById(userId);
      });
  }

  async manageUserTime(user_id, time) {
    return await this.userRepository
      .update(user_id, {
        time,
      })
      .then(async () => {
        return {
          time: (await this.getUserById(user_id)).time,
        };
      });
  }
  async getUserTime(user_id) {
    const user = await this.getUserById(user_id);
    if (!user) {
      throw new NotFoundException('No user found!');
    }
    return {
      time: user.time,
    };
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
    }

    const passwordMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!passwordMatch) {
      throw new HttpException(
        'Incorrect current password!',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new HttpException(
        'New password and confirm password do not match!',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }
  async cancelAccount(id: string) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
    }

    return await this.userRepository
      .update(id, {
        status: 'CANCELLED',
      })
      .then(() => {
        return {
          message: 'Account cancelled successfully!',
        };
      });
  }

  async getUserDevices(user_id: string) {
    const user = await this.getUserById(user_id);
    return { devices: user.devices };
  }
  async deleteUserDevice(user_id: string, device_id) {
    const user = await this.getUserById(user_id);
    const device_idx = user.devices.findIndex((d) => d.id === device_id);
    user.devices.splice(device_idx, 1);
    return await this.userRepository.save(user);
  }

  async getUserReferallInfo(user_id) {
    const allSentReferalls = await this.referenceRepository.find({
      where: {
        owner: new ObjectId(user_id),
      },
      select: {
        status: true,
        code: true,
        _id: true,
        createdAt: true,
      },
    });
    return allSentReferalls;
  }

  async resendOtp(email: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    const newOtp = generateOtp();
    const newOtpExpiry = generateOtpExpiry();

    user.otp = newOtp;
    user.otpExpiry = newOtpExpiry;

    await this.userRepository.save(user);

    await this.emailService.sendResetPasswordOtpEmail(
      user.email,
      user.name,
      newOtp,
    );

    return { message: 'OTP Resent successfully' };
  }

  async initiateResetPassword(email: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const newOtp = generateOtp();
    const newOtpExpiry = generateOtpExpiry();

    user.otp = newOtp;
    user.otpExpiry = newOtpExpiry;

    await this.userRepository.save(user);

    await this.emailService.sendResetPasswordOtpEmail(
      user.email,
      user.name,
      newOtp,
    );

    return { message: 'Reset password OTP sent successfully' };
  }

  async confirmResetPassword(
    email: string,
    userOtp: number,
    newPassword: string,
  ) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (user.otp !== userOtp) {
      throw new HttpException('Invalid OTP!', HttpStatus.BAD_REQUEST);
    }

    if (isOtpExpired(user.otpExpiry)) {
      throw new HttpException('OTP has expired!', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;

    await this.userRepository.save(user);

    await this.emailService.sendPasswordResetConfirmationEmail(
      user.email,
      user.name,
    );

    return { message: 'Password reset successfully' };
  }
  async captureOrMatchAutoLoginKey(userId, deviceId: string) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    const saltRounds = 10;
    const hash = await bcrypt.hash(deviceId, saltRounds);
    if (user.autoLoginKey) {
      if (user.autoLoginKey === hash) {
        return user;
      } else {
        throw new UnauthorizedException('Auto Login key does not match!');
      }
    } else {
      user.autoLoginKey = hash;
      return await this.userRepository.save(user);
    }
  }
}
