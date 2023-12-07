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
