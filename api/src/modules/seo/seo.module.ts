import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { Shop } from '../../entities/shop.entity';
import { ScanHistory } from '../../entities/scan-history.entity';
import { ShopifyModule } from '../shopify/shopify.module';

// Import parallel analysis services
import { ParallelSeoAnalysisService } from './parallel-seo-analysis.service';
import { SimplifiedSeoAnalysisService } from './simplified-seo-analysis.service';
import { ProductContentAnalysisWorker } from './workers/product-content-analysis.worker';
import { SeoMetadataAnalysisWorker } from './workers/seo-metadata-analysis.worker';
import { ImageAnalysisWorker } from './workers/image-analysis.worker';
import { MetafieldsAnalysisWorker } from './workers/metafields-analysis.worker';
import { ProductDataTransformerService } from './product-data-transformer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop, ScanHistory]),
    ShopifyModule,
  ],
  controllers: [SeoController],
  providers: [
    SeoService,
    ParallelSeoAnalysisService,
    SimplifiedSeoAnalysisService,
    ProductContentAnalysisWorker,
    SeoMetadataAnalysisWorker,
    ImageAnalysisWorker,
    MetafieldsAnalysisWorker,
    ProductDataTransformerService,
  ],
  exports: [
    SeoService,
    ParallelSeoAnalysisService,
    SimplifiedSeoAnalysisService,
  ],
})
export class SeoModule {}
