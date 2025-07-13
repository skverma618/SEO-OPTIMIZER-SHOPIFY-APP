import { SeoService } from './seo.service';
import { ScanProductsDto, ApplySuggestionDto, ApplyBulkSuggestionsDto, ApplyBulkSuggestionsNewDto, ParallelAnalysisInputDto, ParallelAnalysisResultDto } from '../../dto/seo.dto';
import { ApiResponseDto } from '../../dto/common.dto';
import { ParallelSeoAnalysisService } from './parallel-seo-analysis.service';
import { ProductDataTransformerService } from './product-data-transformer.service';
import { ShopifyService } from '../shopify/shopify.service';
import { Repository } from 'typeorm';
import { Shop } from '../../entities/shop.entity';
export declare class SeoController {
    private readonly seoService;
    private readonly parallelSeoAnalysisService;
    private readonly productDataTransformerService;
    private readonly shopifyService;
    private shopRepository;
    private readonly logger;
    constructor(seoService: SeoService, parallelSeoAnalysisService: ParallelSeoAnalysisService, productDataTransformerService: ProductDataTransformerService, shopifyService: ShopifyService, shopRepository: Repository<Shop>);
    scanStore(shop: string): Promise<ApiResponseDto<any>>;
    scanProducts(scanProductsDto: ScanProductsDto, shop: string): Promise<ApiResponseDto<any>>;
    analyzeSEO(scanProductsDto: ScanProductsDto, shop: string): Promise<ApiResponseDto<any>>;
    applySuggestion(applySuggestionDto: ApplySuggestionDto, shop: string): Promise<ApiResponseDto<any>>;
    applyBulkSuggestions(applyBulkDto: ApplyBulkSuggestionsDto, shop: string): Promise<ApiResponseDto<any>>;
    applyBulkSuggestionsNew(applyBulkDto: ApplyBulkSuggestionsNewDto, shop: string): Promise<ApiResponseDto<any>>;
    analyzeParallel(analysisInput: ParallelAnalysisInputDto, shop: string): Promise<ApiResponseDto<ParallelAnalysisResultDto>>;
    analyzeBatch(analysisInputs: ParallelAnalysisInputDto[], shop: string): Promise<ApiResponseDto<{
        results: ParallelAnalysisResultDto[];
        summary: any;
    }>>;
    analyzeShopifyProduct(productId: string, shop: string): Promise<ApiResponseDto<ParallelAnalysisResultDto>>;
    analyzeShopifyProductsBatch(scanProductsDto: ScanProductsDto, shop: string): Promise<ApiResponseDto<{
        results: ParallelAnalysisResultDto[];
        summary: any;
    }>>;
}
