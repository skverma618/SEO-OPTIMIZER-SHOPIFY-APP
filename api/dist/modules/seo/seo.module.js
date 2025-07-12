"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const seo_controller_1 = require("./seo.controller");
const seo_service_1 = require("./seo.service");
const shop_entity_1 = require("../../entities/shop.entity");
const scan_history_entity_1 = require("../../entities/scan-history.entity");
const shopify_module_1 = require("../shopify/shopify.module");
const parallel_seo_analysis_service_1 = require("./parallel-seo-analysis.service");
const simplified_seo_analysis_service_1 = require("./simplified-seo-analysis.service");
const product_content_analysis_worker_1 = require("./workers/product-content-analysis.worker");
const seo_metadata_analysis_worker_1 = require("./workers/seo-metadata-analysis.worker");
const image_analysis_worker_1 = require("./workers/image-analysis.worker");
const metafields_analysis_worker_1 = require("./workers/metafields-analysis.worker");
const product_data_transformer_service_1 = require("./product-data-transformer.service");
let SeoModule = class SeoModule {
};
exports.SeoModule = SeoModule;
exports.SeoModule = SeoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([shop_entity_1.Shop, scan_history_entity_1.ScanHistory]),
            shopify_module_1.ShopifyModule,
        ],
        controllers: [seo_controller_1.SeoController],
        providers: [
            seo_service_1.SeoService,
            parallel_seo_analysis_service_1.ParallelSeoAnalysisService,
            simplified_seo_analysis_service_1.SimplifiedSeoAnalysisService,
            product_content_analysis_worker_1.ProductContentAnalysisWorker,
            seo_metadata_analysis_worker_1.SeoMetadataAnalysisWorker,
            image_analysis_worker_1.ImageAnalysisWorker,
            metafields_analysis_worker_1.MetafieldsAnalysisWorker,
            product_data_transformer_service_1.ProductDataTransformerService,
        ],
        exports: [
            seo_service_1.SeoService,
            parallel_seo_analysis_service_1.ParallelSeoAnalysisService,
            simplified_seo_analysis_service_1.SimplifiedSeoAnalysisService,
        ],
    })
], SeoModule);
//# sourceMappingURL=seo.module.js.map