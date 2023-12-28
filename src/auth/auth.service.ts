import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { EmailLoginDto } from './dto/local.dto';
import * as bcrypt from 'bcrypt';
import { GoogleAuthDto } from './dto/google.dto';
import { AdminAuthDto } from './dto/admin.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}
  async logInViaEmail(emailoginDto: EmailLoginDto) {
    const user = await this.userService.getUserByEmail(
      emailoginDto.email,
      emailoginDto.device,
    );
    if (!user) {
      throw new NotFoundException(
        `User with ${emailoginDto.email} email doesn't exist`,
      );
    }
    if (user && user.googleAccessToken) {
      throw new UnauthorizedException(
        'You are logged in with this email using google provider, please try to login with it!',
      );
    }
    const passMatch = await bcrypt.compare(
      emailoginDto.password,
      user.password,
    );
    if (user && passMatch === true) {
      const payloadForToken = {
        email: user.email,
        id: user._id,
        name: user.name,
      };
      const token = this.jwtService.sign(payloadForToken);
      return {
        accessToken: token,
        email: user.email,
        _id: user._id,
        name: user.name,
      };
    } else {
      throw new UnauthorizedException('Invalid Credentials');
    }
  }

  async authViaGoogle(googleAuthDto: GoogleAuthDto) {
    const user = await this.userService.getUserByEmail(
      googleAuthDto.email,
      googleAuthDto.device,
    );
    if (user && user.googleAccessToken) {
      const payloadForToken = {
        email: user.email,
        id: user._id,
        name: user.name,
      };
      const token = this.jwtService.sign(payloadForToken);
      return {
        accessToken: token,
        email: user.email,
        _id: user._id,
        name: user.name,
      };
    } else if (user && !user.googleAccessToken) {
      throw new UnauthorizedException(
        `There is already a user registered with ${googleAuthDto.email}, and was not registred using Google, please try to sign in using your email and password.`,
      );
    } else {
      const createdUser: any = await this.userService.create(googleAuthDto);
      const payloadForToken = {
        email: createdUser.email,
        id: createdUser._id,
        name: createdUser.name,
      };
      const token = this.jwtService.sign(payloadForToken);
      return {
        accessToken: token,
        email: createdUser.email,
        _id: createdUser._id,
        name: createdUser.name,
      };
    }
  }
  async adminAuth(adminAuthDto: AdminAuthDto) {
    const adminEmail = process.env.LB_ADMIN_EMAIL;
    const adminPassword = process.env.LB_ADMIN_PASSWORD;
    if (
      adminAuthDto.email === adminEmail &&
      adminAuthDto.password === adminPassword
    ) {
      const payloadForToken = {
        email: adminEmail,
        id: 0,
        password: adminPassword,
      };
      const token = this.jwtService.sign(payloadForToken);
      return {
        accessToken: token,
        email: adminEmail,
        id: 0,
      };
    } else {
      throw new UnauthorizedException('Invalid Admin Credentials!');
    }
  }
}
