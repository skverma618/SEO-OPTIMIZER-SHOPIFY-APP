import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Shop } from './shop.entity';

@Entity('scan_history')
export class ScanHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shopDomain: string;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'shopDomain', referencedColumnName: 'shopDomain' })
  shop: Shop;

  @Column('json')
  scanResults: any;

  @Column()
  totalProducts: number;

  @Column()
  productsWithIssues: number;

  @Column({ nullable: true })
  scanType: string; // 'store' or 'products'

  @CreateDateColumn()
  createdAt: Date;
}
