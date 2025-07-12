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
