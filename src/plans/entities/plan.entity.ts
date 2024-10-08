import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Plan {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  name: string;

  @Column()
  durationType: string;

  @Column({ nullable: true })
  stripePaymentLink: string;

  @Column({ nullable: true })
  level: string;

  @Column('int')
  durationInDays: number;

  @Column()
  price: string;

  @Column()
  discountedPrice: number;

  @Column()
  monthlyPrice: number;

  @Column()
  devices: number;

  @Column()
  label: string;

  @Column()
  features: string[];

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
