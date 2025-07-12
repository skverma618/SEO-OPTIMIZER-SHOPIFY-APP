import { SeoService } from './seo.service';
import { ScanProductsDto, ApplySuggestionDto, ApplyBulkSuggestionsDto } from '../../dto/seo.dto';
import { ApiResponseDto } from '../../dto/common.dto';
export declare class SeoController {
    private readonly seoService;
    private readonly logger;
    constructor(seoService: SeoService);
    scanStore(shop: string): Promise<ApiResponseDto<any>>;
    scanProducts(scanProductsDto: ScanProductsDto, shop: string): Promise<ApiResponseDto<any>>;
    analyzeSEO(scanProductsDto: ScanProductsDto, shop: string): Promise<ApiResponseDto<any>>;
    applySuggestion(applySuggestionDto: ApplySuggestionDto, shop: string): Promise<ApiResponseDto<any>>;
    applyBulkSuggestions(applyBulkDto: ApplyBulkSuggestionsDto, shop: string): Promise<ApiResponseDto<any>>;
}
