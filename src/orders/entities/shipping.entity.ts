import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../enums/order-status.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { OrderEntity } from './order.entity';

@Entity('shippings')
export class ShippingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phone: string;

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  address: string;

  @Column({ default: '' })
  city: string;

  @Column({ default: '' })
  postCode: string;

  @Column({ default: '' })
  state: string;

  @Column({ default: '' })
  country: string;

  @CreateDateColumn()
  createdAt: Timestamp;

  @UpdateDateColumn()
  updatedAt: Timestamp;

  @OneToOne(() => OrderEntity, (order) => order.shippingAddress)
  order: OrderEntity;
}
