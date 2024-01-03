import {
  Column,
  Entity,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { Device } from './device.type';

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  googleAccessToken?: string;

  @Column({ default: 'ACTIVE' })
  status?: string;

  @Column({ nullable: true })
  selfReference?: string;

  @Column({ nullable: true })
  referredBy?: string;

  @Column({ nullable: true })
  referredByCode?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  autoLoginKey?: string;

  @Column()
  devices?: Device[];

  @Column({ nullable: true })
  otp?: number;

  @Column({ nullable: true })
  otpExpiry?: string;

  @Column({ default: 15 })
  time?: number;

  @OneToOne(() => Subscription, (subscription) => subscription.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  subscription: Subscription;

  @Column({ type: 'boolean', nullable: true })
  isPremiumUser?: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
