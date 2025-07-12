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
exports.ApplyBulkSuggestionsDto = exports.ApplySuggestionDto = exports.ScanResultDto = exports.ProductScanResultDto = exports.SuggestionDto = exports.ScanProductsDto = exports.SuggestionPriority = exports.SuggestionType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var SuggestionType;
(function (SuggestionType) {
    SuggestionType["TITLE"] = "title";
    SuggestionType["DESCRIPTION"] = "description";
    SuggestionType["META_DESCRIPTION"] = "meta-description";
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
//# sourceMappingURL=seo.dto.js.map