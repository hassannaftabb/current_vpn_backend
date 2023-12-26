import {
  Column,
  Entity,
  ObjectIdColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export class Reference {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  owner: string | ObjectId;

  @Column()
  code: string;

  @Column()
  status: string;

  @Column()
  receiver: string | ObjectId;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
