import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const [, token] = authHeader.split(' ');
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });
      if (
        payload.email === process.env.LB_ADMIN_EMAIL &&
        payload.password === process.env.LB_ADMIN_PASSWORD
      ) {
        request.user = payload;
        return true;
      } else {
        throw new UnauthorizedException(
          'You are not permitted to access, this is only accessible by Admin!',
        );
      }
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(
        'You are not permitted to access, this is only accessible by Admin!',
      );
    }
  }
}
