import { Module } from '@nestjs/common';
import { ShopifyService } from './shopify.service';

@Module({
  providers: [ShopifyService],
  exports: [ShopifyService],
})
export class ShopifyModule {}
