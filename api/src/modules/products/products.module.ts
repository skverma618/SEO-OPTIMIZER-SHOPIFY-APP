import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Shop } from '../../entities/shop.entity';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop]),
    ShopifyModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
