import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { Shop } from '../../entities/shop.entity';
import { ScanHistory } from '../../entities/scan-history.entity';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop, ScanHistory]),
    ShopifyModule,
  ],
  controllers: [SeoController],
  providers: [SeoService],
  exports: [SeoService],
})
export class SeoModule {}
