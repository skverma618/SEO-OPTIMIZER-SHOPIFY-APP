import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shops')
export class Shop {
  @PrimaryColumn()
  shopDomain: string;

  @Column()
  accessToken: string;

  @Column()
  scope: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  shopName: string;

  @Column({ nullable: true })
  planName: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  installedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
