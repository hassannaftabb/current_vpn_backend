import { ObjectId } from 'mongodb';
import { Plan } from 'src/plans/entities/plan.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Subscription {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column('date', { nullable: true })
  expiryDate?: Date;

  @Column('boolean')
  isActive: boolean;

  @Column()
  userId?: string | ObjectId;

  @Column('boolean', { nullable: true })
  isExpired?: boolean;

  @Column()
  planId: string | ObjectId;

  @Column({ type: 'json' })
  plan: Plan;

  @OneToOne(() => User, (user) => user.subscription)
  user: User;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
