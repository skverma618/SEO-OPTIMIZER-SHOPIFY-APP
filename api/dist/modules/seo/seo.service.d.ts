import { Repository } from 'typeorm';
import { Shop } from '../../entities/shop.entity';
import { ScanHistory } from '../../entities/scan-history.entity';
import { ShopifyService } from '../shopify/shopify.service';
import { ApplySuggestionDto } from '../../dto/seo.dto';
import { SimplifiedSeoAnalysisService } from './simplified-seo-analysis.service';
export declare class SeoService {
    private shopRepository;
    private scanHistoryRepository;
    private shopifyService;
    private simplifiedSeoAnalysisService;
    private readonly logger;
    constructor(shopRepository: Repository<Shop>, scanHistoryRepository: Repository<ScanHistory>, shopifyService: ShopifyService, simplifiedSeoAnalysisService: SimplifiedSeoAnalysisService);
    scanEntireStore(shopDomain: string): Promise<{
        scanId: string;
        totalProducts: any;
        productsWithIssues: number;
        results: {
            productId: any;
            title: any;
            handle: any;
            suggestions: any[];
        }[];
    }>;
    scanSelectedProducts(shopDomain: string, productIds: string[]): Promise<{
        scanId: string;
        totalProducts: number;
        productsWithIssues: number;
        results: {
            productId: any;
            title: any;
            handle: any;
            suggestions: any[];
        }[];
    }>;
    applySingleSuggestion(shopDomain: string, suggestion: ApplySuggestionDto): Promise<{
        success: boolean;
        appliedSuggestion: ApplySuggestionDto;
        shopifyResponse: any;
    }>;
    applyBulkSuggestions(shopDomain: string, suggestions: ApplySuggestionDto[]): Promise<{
        totalSuggestions: number;
        successfulApplications: number;
        failedApplications: number;
        results: {
            suggestion: ApplySuggestionDto;
            result: any;
            success: boolean;
        }[];
        errors: {
            suggestion: ApplySuggestionDto;
            error: string;
            success: boolean;
        }[];
    }>;
    private fetchAllProducts;
    private fetchProductsByIds;
    private analyzeProductsForSEO;
    private generateMockSuggestions;
    private applySuggestionToShopify;
    private extractImageIdFromSuggestion;
    private saveScanHistory;
    private generateScanId;
}
