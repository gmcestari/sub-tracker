import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Subscription } from './Subscription';

@Entity('currencies')
export class Currency extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { default: 'eur' })
  code: string;

  @Column('text')
  name: string;

  @OneToMany(
    _type => Subscription,
    subscription => subscription.currency
  )
  subscriptions: Subscription[];
}
