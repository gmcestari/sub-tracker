import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Currency } from './Currency';
import { User } from './User';

@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  startDate: string;

  @Column('int')
  freeTrialDuration: number;

  @Column('text')
  frequency: string;

  @Column('bool')
  autoRenew: boolean;

  @Column('money')
  amount: number;

  @ManyToOne(
    _type => Currency,
    currency => currency.subscriptions
  )
  currency: Currency;

  @ManyToOne(
    _type => User,
    user => user.subscriptions
  )
  owner: User;
}
