import * as moment from 'moment';

export function generateOtp(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

export function generateOtpExpiry(): string {
  return moment().add(10, 'minutes').toDate().toString();
}

export function isOtpExpired(otpExpiry: string): boolean {
  const now = moment().toDate().toString();
  return now > otpExpiry;
}
