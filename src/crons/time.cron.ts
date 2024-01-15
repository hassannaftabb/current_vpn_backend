import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserTimeCronsService {
  constructor(private usersService: UserService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronAt12amUTC() {
    await this.checkUsers();
  }

  private async checkUsers() {
    const users = await this.usersService.getAllUsers();

    for (const user of users) {
      if (!user.isPremiumUser) {
        await this.usersService.manageUserTime(user._id, 0);
      }
    }
  }
}
