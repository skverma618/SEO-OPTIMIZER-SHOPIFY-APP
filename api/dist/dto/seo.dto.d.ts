export declare enum SuggestionType {
    TITLE = "title",
    DESCRIPTION = "description",
    META_DESCRIPTION = "meta-description",
    ALT_TEXT = "alt-text"
}
export declare enum SuggestionPriority {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare class ScanProductsDto {
    productIds: string[];
}
export declare class SuggestionDto {
    id: string;
    type: SuggestionType;
    priority: SuggestionPriority;
    field: string;
    current: string;
    suggested: string;
    reason: string;
    impact?: string;
    imageUrl?: string;
}
export declare class ProductScanResultDto {
    productId: string;
    title: string;
    handle: string;
    suggestions: SuggestionDto[];
}
export declare class ScanResultDto {
    scanId: string;
    totalProducts: number;
    productsWithIssues: number;
    results: ProductScanResultDto[];
}
export declare class ApplySuggestionDto {
    suggestionId: string;
    productId: string;
    field: string;
    value: string;
}
export declare class ApplyBulkSuggestionsDto {
    suggestions: ApplySuggestionDto[];
}
export declare class ProductBulkSuggestionsDto {
    productId: string;
    title: string;
    handle: string;
    suggestions: ApplySuggestionDto[];
}
export declare class ApplyBulkSuggestionsNewDto {
    products: ProductBulkSuggestionsDto[];
}
export declare class ProductAnalysisInputDto {
    productId: string;
    productTitle: string;
    productDescription: string;
}
export declare class ProductSeoAnalysisInputDto {
    productId: string;
    productSeoTitle: string;
    productSeoDescription: string;
}
export declare class ProductImageAnalysisInputDto {
    productId: string;
    productImageId: string;
    productImageUrl?: string;
    productImageAltText: string;
}
export declare class ProductMetaFieldAnalysisInputDto {
    productId: string;
    productMetaId: string;
    productMetaValue: string;
}
export declare class FieldScoreDto {
    field: string;
    score: number;
    description: string;
}
export declare class AnalysisResultDto {
    score: number;
    suggestions: SuggestionDto[];
    analysisType: string;
    feedback: string;
    fieldScores?: FieldScoreDto[];
}
export declare class ParallelAnalysisResultDto {
    productId: string;
    overallScore: number;
    productContentAnalysis: AnalysisResultDto;
    seoMetadataAnalysis: AnalysisResultDto;
    imageAnalysis: AnalysisResultDto;
    metafieldsAnalysis: AnalysisResultDto;
    allSuggestions: SuggestionDto[];
    executionTime: number;
}
export declare class ParallelAnalysisInputDto {
    productContent: ProductAnalysisInputDto;
    seoMetadata: ProductSeoAnalysisInputDto;
    images: ProductImageAnalysisInputDto[];
    metafields: ProductMetaFieldAnalysisInputDto[];
    brandMapping?: any;
}
