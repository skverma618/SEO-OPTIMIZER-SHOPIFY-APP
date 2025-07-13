"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParallelAnalysisInputDto = exports.ParallelAnalysisResultDto = exports.AnalysisResultDto = exports.FieldScoreDto = exports.ProductMetaFieldAnalysisInputDto = exports.ProductImageAnalysisInputDto = exports.ProductSeoAnalysisInputDto = exports.ProductAnalysisInputDto = exports.AnalysisHistoryDto = exports.PreviousSuggestionDto = exports.ApplyBulkSuggestionsNewDto = exports.ProductBulkSuggestionsDto = exports.ApplyBulkSuggestionsDto = exports.ApplySuggestionDto = exports.ScanResultDto = exports.ProductScanResultDto = exports.SuggestionDto = exports.ScanProductsDto = exports.SuggestionPriority = exports.SuggestionType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var SuggestionType;
(function (SuggestionType) {
    SuggestionType["PRODUCT_TITLE"] = "product-title";
    SuggestionType["PRODUCT_DESCRIPTION"] = "product-description";
    SuggestionType["META_TITLE"] = "meta-title";
    SuggestionType["META_DESCRIPTION"] = "meta-description";
    SuggestionType["IMAGE_ALT_TEXT"] = "image-alt-text";
    SuggestionType["METAFIELD_TITLE"] = "metafield-title";
    SuggestionType["METAFIELD_DESCRIPTION"] = "metafield-description";
    SuggestionType["METAFIELD_KEYWORDS"] = "metafield-keywords";
    SuggestionType["STRUCTURED_DATA"] = "structured-data";
    SuggestionType["SCHEMA_MARKUP"] = "schema-markup";
    SuggestionType["TITLE"] = "title";
    SuggestionType["DESCRIPTION"] = "description";
    SuggestionType["SEO_TITLE"] = "seo-title";
    SuggestionType["SEO_DESCRIPTION"] = "seo-description";
    SuggestionType["ALT_TEXT"] = "alt-text";
})(SuggestionType || (exports.SuggestionType = SuggestionType = {}));
var SuggestionPriority;
(function (SuggestionPriority) {
    SuggestionPriority["HIGH"] = "high";
    SuggestionPriority["MEDIUM"] = "medium";
    SuggestionPriority["LOW"] = "low";
})(SuggestionPriority || (exports.SuggestionPriority = SuggestionPriority = {}));
class ScanProductsDto {
    productIds;
}
exports.ScanProductsDto = ScanProductsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of Shopify product IDs to scan for SEO issues',
        example: [
            'gid://shopify/Product/123456789',
            'gid://shopify/Product/987654321',
        ],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ScanProductsDto.prototype, "productIds", void 0);
class SuggestionDto {
    id;
    type;
    priority;
    field;
    current;
    suggested;
    reason;
    impact;
    imageUrl;
}
exports.SuggestionDto = SuggestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the suggestion',
        example: 'title-123456789',
    }),
    __metadata("design:type", String)
], SuggestionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of SEO suggestion',
        enum: SuggestionType,
        example: SuggestionType.TITLE,
    }),
    __metadata("design:type", String)
], SuggestionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Priority level of the suggestion',
        enum: SuggestionPriority,
        example: SuggestionPriority.HIGH,
    }),
    __metadata("design:type", String)
], SuggestionDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Field that the suggestion applies to',
        example: 'seo.title',
    }),
    __metadata("design:type", String)
], SuggestionDto.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current value of the field',
        example: 'Basic Product Title',
    }),
    __metadata("design:type", String)
], SuggestionDto.prototype, "current", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Suggested improved value',
        example: 'Premium Quality Product - Best Price | Brand Name',
    }),
    __metadata("design:type", String)
], SuggestionDto.prototype, "suggested", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for the suggestion',
        example: 'SEO title should be 30-60 characters and include target keywords',
    }),
    __metadata("design:type", String)
], SuggestionDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Expected impact of implementing the suggestion',
        example: 'Could improve search ranking and click-through rates',
        required: false,
    }),
    __metadata("design:type", String)
], SuggestionDto.prototype, "impact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Image URL for image-related suggestions',
        example: 'https://cdn.shopify.com/s/files/1/0123/4567/products/product-image.jpg',
        required: false,
    }),
    __metadata("design:type", String)
], SuggestionDto.prototype, "imageUrl", void 0);
class ProductScanResultDto {
    productId;
    title;
    handle;
    suggestions;
}
exports.ProductScanResultDto = ProductScanResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Shopify product ID',
        example: 'gid://shopify/Product/123456789',
    }),
    __metadata("design:type", String)
], ProductScanResultDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product title',
        example: 'Premium Quality T-Shirt',
    }),
    __metadata("design:type", String)
], ProductScanResultDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product handle/slug',
        example: 'premium-quality-t-shirt',
    }),
    __metadata("design:type", String)
], ProductScanResultDto.prototype, "handle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of SEO suggestions for this product',
        type: [SuggestionDto],
    }),
    __metadata("design:type", Array)
], ProductScanResultDto.prototype, "suggestions", void 0);
class ScanResultDto {
    scanId;
    totalProducts;
    productsWithIssues;
    results;
}
exports.ScanResultDto = ScanResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the scan',
        example: 'scan_1640995200000_abc123def456',
    }),
    __metadata("design:type", String)
], ScanResultDto.prototype, "scanId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of products scanned',
        example: 25,
    }),
    __metadata("design:type", Number)
], ScanResultDto.prototype, "totalProducts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of products with SEO issues found',
        example: 18,
    }),
    __metadata("design:type", Number)
], ScanResultDto.prototype, "productsWithIssues", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed scan results for each product',
        type: [ProductScanResultDto],
    }),
    __metadata("design:type", Array)
], ScanResultDto.prototype, "results", void 0);
class ApplySuggestionDto {
    suggestionId;
    productId;
    field;
    value;
}
exports.ApplySuggestionDto = ApplySuggestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the suggestion to apply',
        example: 'title-123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplySuggestionDto.prototype, "suggestionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Shopify product ID',
        example: 'gid://shopify/Product/123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplySuggestionDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Field to update',
        example: 'seo.title',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplySuggestionDto.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New value to apply',
        example: 'Premium Quality Product - Best Price | Brand Name',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplySuggestionDto.prototype, "value", void 0);
class ApplyBulkSuggestionsDto {
    suggestions;
}
exports.ApplyBulkSuggestionsDto = ApplyBulkSuggestionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of suggestions to apply in bulk',
        type: [ApplySuggestionDto],
    }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ApplyBulkSuggestionsDto.prototype, "suggestions", void 0);
class ProductBulkSuggestionsDto {
    productId;
    title;
    handle;
    suggestions;
}
exports.ProductBulkSuggestionsDto = ProductBulkSuggestionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Shopify product ID',
        example: 'gid://shopify/Product/123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductBulkSuggestionsDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product title',
        example: 'Premium Quality T-Shirt',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductBulkSuggestionsDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product handle/slug',
        example: 'premium-quality-t-shirt',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductBulkSuggestionsDto.prototype, "handle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of selected suggestions for this product',
        type: [ApplySuggestionDto],
    }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ProductBulkSuggestionsDto.prototype, "suggestions", void 0);
class ApplyBulkSuggestionsNewDto {
    products;
}
exports.ApplyBulkSuggestionsNewDto = ApplyBulkSuggestionsNewDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of products with their selected suggestions',
        type: [ProductBulkSuggestionsDto],
    }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ApplyBulkSuggestionsNewDto.prototype, "products", void 0);
class PreviousSuggestionDto {
    field;
    suggestedContent;
    generatedAt;
    appliedAt;
    originalScore;
}
exports.PreviousSuggestionDto = PreviousSuggestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Field that was previously suggested for',
        example: 'Product Title',
    }),
    __metadata("design:type", String)
], PreviousSuggestionDto.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Previously suggested content',
        example: 'Premium Quality Product - Best Price | Brand Name',
    }),
    __metadata("design:type", String)
], PreviousSuggestionDto.prototype, "suggestedContent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'When the suggestion was generated',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], PreviousSuggestionDto.prototype, "generatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'When the suggestion was applied (if applied)',
        example: '2024-01-15T11:00:00Z',
        required: false,
    }),
    __metadata("design:type", Date)
], PreviousSuggestionDto.prototype, "appliedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Score given when this suggestion was generated',
        example: 45,
        minimum: 0,
        maximum: 100,
        required: false,
    }),
    __metadata("design:type", Number)
], PreviousSuggestionDto.prototype, "originalScore", void 0);
class AnalysisHistoryDto {
    score;
    analyzedAt;
    contentHash;
    wasAiGenerated;
}
exports.AnalysisHistoryDto = AnalysisHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Score given during previous analysis',
        example: 75,
        minimum: 0,
        maximum: 100,
    }),
    __metadata("design:type", Number)
], AnalysisHistoryDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'When the analysis was performed',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], AnalysisHistoryDto.prototype, "analyzedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hash of the content that was analyzed',
        example: 'abc123def456',
    }),
    __metadata("design:type", String)
], AnalysisHistoryDto.prototype, "contentHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the content was AI-generated',
        example: true,
        required: false,
    }),
    __metadata("design:type", Boolean)
], AnalysisHistoryDto.prototype, "wasAiGenerated", void 0);
class ProductAnalysisInputDto {
    productId;
    productTitle;
    productDescription;
    previousSuggestions;
    analysisHistory;
}
exports.ProductAnalysisInputDto = ProductAnalysisInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Shopify product ID',
        example: 'gid://shopify/Product/123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductAnalysisInputDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product title',
        example: 'RYZE Gums Frosty Mint Flavour - 2mg',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductAnalysisInputDto.prototype, "productTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product description',
        example: 'RYZE is a sugar free gum that helps manage your cravings...',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductAnalysisInputDto.prototype, "productDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Previous suggestions for this product',
        type: [PreviousSuggestionDto],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ProductAnalysisInputDto.prototype, "previousSuggestions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Analysis history for this product',
        type: [AnalysisHistoryDto],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ProductAnalysisInputDto.prototype, "analysisHistory", void 0);
class ProductSeoAnalysisInputDto {
    productId;
    productSeoTitle;
    productSeoDescription;
}
exports.ProductSeoAnalysisInputDto = ProductSeoAnalysisInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Shopify product ID',
        example: 'gid://shopify/Product/123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductSeoAnalysisInputDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product SEO title',
        example: 'RYZE Sugar free Gums Frosty Mint Flavor - 2mg',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductSeoAnalysisInputDto.prototype, "productSeoTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product SEO description',
        example: 'Buy RYZE Sugar Free Gums Frosty Mint Flavor- 2mg to help you stop smoking...',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductSeoAnalysisInputDto.prototype, "productSeoDescription", void 0);
class ProductImageAnalysisInputDto {
    productId;
    productImageId;
    productImageUrl;
    productImageAltText;
}
exports.ProductImageAnalysisInputDto = ProductImageAnalysisInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Shopify product ID',
        example: 'gid://shopify/Product/123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductImageAnalysisInputDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product image ID',
        example: 'gid://shopify/ProductImage/123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductImageAnalysisInputDto.prototype, "productImageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product image URL',
        example: 'https://cdn.shopify.com/s/files/1/0123/4567/products/product-image.jpg',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProductImageAnalysisInputDto.prototype, "productImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product image alt text',
        example: 'RYZE nicotine gum frosty mint flavor package',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductImageAnalysisInputDto.prototype, "productImageAltText", void 0);
class ProductMetaFieldAnalysisInputDto {
    productId;
    productMetaId;
    productMetaValue;
}
exports.ProductMetaFieldAnalysisInputDto = ProductMetaFieldAnalysisInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Shopify product ID',
        example: 'gid://shopify/Product/123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductMetaFieldAnalysisInputDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product metafield ID',
        example: 'gid://shopify/Metafield/123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductMetaFieldAnalysisInputDto.prototype, "productMetaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product metafield value',
        example: 'RYZE Sugar free Gums Frosty Mint Flavor - 2mg',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductMetaFieldAnalysisInputDto.prototype, "productMetaValue", void 0);
class FieldScoreDto {
    field;
    score;
    description;
}
exports.FieldScoreDto = FieldScoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Field name being scored',
        example: 'Product Title',
    }),
    __metadata("design:type", String)
], FieldScoreDto.prototype, "field", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Score for this specific field out of 100',
        example: 85,
        minimum: 0,
        maximum: 100,
    }),
    __metadata("design:type", Number)
], FieldScoreDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description explaining the score for this field',
        example: 'Title length is optimal and includes relevant keywords',
    }),
    __metadata("design:type", String)
], FieldScoreDto.prototype, "description", void 0);
class AnalysisResultDto {
    score;
    suggestions;
    analysisType;
    feedback;
    fieldScores;
}
exports.AnalysisResultDto = AnalysisResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Analysis score out of 100',
        example: 85,
        minimum: 0,
        maximum: 100,
    }),
    __metadata("design:type", Number)
], AnalysisResultDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of suggestions from the analysis',
        type: [SuggestionDto],
    }),
    __metadata("design:type", Array)
], AnalysisResultDto.prototype, "suggestions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Analysis type identifier',
        example: 'product-content',
    }),
    __metadata("design:type", String)
], AnalysisResultDto.prototype, "analysisType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed analysis feedback',
        example: 'The product title is well-optimized but could benefit from more specific keywords...',
    }),
    __metadata("design:type", String)
], AnalysisResultDto.prototype, "feedback", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Individual field scores breakdown',
        type: [FieldScoreDto],
        required: false,
    }),
    __metadata("design:type", Array)
], AnalysisResultDto.prototype, "fieldScores", void 0);
class ParallelAnalysisResultDto {
    productId;
    overallScore;
    productContentAnalysis;
    seoMetadataAnalysis;
    imageAnalysis;
    metafieldsAnalysis;
    allSuggestions;
    executionTime;
}
exports.ParallelAnalysisResultDto = ParallelAnalysisResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Shopify product ID',
        example: 'gid://shopify/Product/123456789',
    }),
    __metadata("design:type", String)
], ParallelAnalysisResultDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Overall SEO score out of 100',
        example: 78,
        minimum: 0,
        maximum: 100,
    }),
    __metadata("design:type", Number)
], ParallelAnalysisResultDto.prototype, "overallScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product content analysis result',
        type: AnalysisResultDto,
    }),
    __metadata("design:type", AnalysisResultDto)
], ParallelAnalysisResultDto.prototype, "productContentAnalysis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'SEO metadata analysis result',
        type: AnalysisResultDto,
    }),
    __metadata("design:type", AnalysisResultDto)
], ParallelAnalysisResultDto.prototype, "seoMetadataAnalysis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Image alt text analysis result',
        type: AnalysisResultDto,
    }),
    __metadata("design:type", AnalysisResultDto)
], ParallelAnalysisResultDto.prototype, "imageAnalysis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Metafields analysis result',
        type: AnalysisResultDto,
    }),
    __metadata("design:type", AnalysisResultDto)
], ParallelAnalysisResultDto.prototype, "metafieldsAnalysis", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Combined suggestions from all analyses',
        type: [SuggestionDto],
    }),
    __metadata("design:type", Array)
], ParallelAnalysisResultDto.prototype, "allSuggestions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Analysis execution time in milliseconds',
        example: 2500,
    }),
    __metadata("design:type", Number)
], ParallelAnalysisResultDto.prototype, "executionTime", void 0);
class ParallelAnalysisInputDto {
    productContent;
    seoMetadata;
    images;
    metafields;
    brandMapping;
}
exports.ParallelAnalysisInputDto = ParallelAnalysisInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product content analysis input',
        type: ProductAnalysisInputDto,
    }),
    __metadata("design:type", ProductAnalysisInputDto)
], ParallelAnalysisInputDto.prototype, "productContent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'SEO metadata analysis input',
        type: ProductSeoAnalysisInputDto,
    }),
    __metadata("design:type", ProductSeoAnalysisInputDto)
], ParallelAnalysisInputDto.prototype, "seoMetadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Image analysis inputs',
        type: [ProductImageAnalysisInputDto],
    }),
    __metadata("design:type", Array)
], ParallelAnalysisInputDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Metafields analysis inputs',
        type: [ProductMetaFieldAnalysisInputDto],
    }),
    __metadata("design:type", Array)
], ParallelAnalysisInputDto.prototype, "metafields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Brand mapping information for brand-aware suggestions',
        required: false,
    }),
    __metadata("design:type", Object)
], ParallelAnalysisInputDto.prototype, "brandMapping", void 0);
//# sourceMappingURL=seo.dto.js.map