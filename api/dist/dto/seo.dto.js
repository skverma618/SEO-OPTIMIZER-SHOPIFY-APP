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
class ProductScanResultDto {
    productId;
    title;
    handle;
    suggestions;
}
exports.ProductScanResultDto = ProductScanResultDto;
class ScanResultDto {
    scanId;
    totalProducts;
    productsWithIssues;
    results;
}
exports.ScanResultDto = ScanResultDto;
class ApplySuggestionDto {
    suggestionId;
    productId;
    field;
    value;
}
exports.ApplySuggestionDto = ApplySuggestionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplySuggestionDto.prototype, "suggestionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplySuggestionDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplySuggestionDto.prototype, "field", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplySuggestionDto.prototype, "value", void 0);
class ApplyBulkSuggestionsDto {
    suggestions;
}
exports.ApplyBulkSuggestionsDto = ApplyBulkSuggestionsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ApplyBulkSuggestionsDto.prototype, "suggestions", void 0);
//# sourceMappingURL=seo.dto.js.map