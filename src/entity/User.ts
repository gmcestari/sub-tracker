import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Subscription } from './Subscription';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { default: 0 })
  count: number;

  @Column('text')
  email: string;

  @Column('text')
  password: string;

  @Column('text')
  name: string;

  @Column('text')
  lastName: string;

  @OneToMany(
    _type => Subscription,
    subscription => subscription.owner
  )
  subscriptions: Subscription[];
}
