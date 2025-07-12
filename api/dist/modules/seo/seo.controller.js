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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SeoController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const seo_service_1 = require("./seo.service");
const seo_dto_1 = require("../../dto/seo.dto");
let SeoController = SeoController_1 = class SeoController {
    seoService;
    logger = new common_1.Logger(SeoController_1.name);
    constructor(seoService) {
        this.seoService = seoService;
    }
    async scanStore(shop) {
        try {
            if (!shop) {
                throw new common_1.HttpException('Shop parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.seoService.scanEntireStore(shop);
            return {
                success: true,
                data: result,
                message: 'Store scan completed successfully',
            };
        }
        catch (error) {
            this.logger.error('Error scanning store', error);
            throw new common_1.HttpException('Failed to scan store', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async scanProducts(scanProductsDto, shop) {
        try {
            if (!shop) {
                throw new common_1.HttpException('Shop parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!scanProductsDto.productIds ||
                scanProductsDto.productIds.length === 0) {
                throw new common_1.HttpException('Product IDs are required', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.seoService.scanSelectedProducts(shop, scanProductsDto.productIds);
            return {
                success: true,
                data: result,
                message: 'Products scan completed successfully',
            };
        }
        catch (error) {
            this.logger.error('Error scanning products', error);
            throw new common_1.HttpException('Failed to scan products', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async applySuggestion(applySuggestionDto, shop) {
        try {
            if (!shop) {
                throw new common_1.HttpException('Shop parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.seoService.applySingleSuggestion(shop, applySuggestionDto);
            return {
                success: true,
                data: result,
                message: 'Suggestion applied successfully',
            };
        }
        catch (error) {
            this.logger.error('Error applying suggestion', error);
            throw new common_1.HttpException('Failed to apply suggestion', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async applyBulkSuggestions(applyBulkDto, shop) {
        try {
            if (!shop) {
                throw new common_1.HttpException('Shop parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!applyBulkDto.suggestions || applyBulkDto.suggestions.length === 0) {
                throw new common_1.HttpException('Suggestions are required', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.seoService.applyBulkSuggestions(shop, applyBulkDto.suggestions);
            return {
                success: true,
                data: result,
                message: `${applyBulkDto.suggestions.length} suggestions applied successfully`,
            };
        }
        catch (error) {
            this.logger.error('Error applying bulk suggestions', error);
            throw new common_1.HttpException('Failed to apply suggestions', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SeoController = SeoController;
__decorate([
    (0, common_1.Post)('scan/store'),
    (0, swagger_1.ApiOperation)({
        summary: 'Scan entire store for SEO issues',
        description: 'Performs a comprehensive SEO analysis of all products in the Shopify store',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Store scan completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'object' },
                message: {
                    type: 'string',
                    example: 'Store scan completed successfully',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Shop parameter is required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
    }),
    __param(0, (0, common_1.Query)('shop')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "scanStore", null);
__decorate([
    (0, common_1.Post)('scan/products'),
    (0, swagger_1.ApiOperation)({
        summary: 'Scan selected products for SEO issues',
        description: 'Performs SEO analysis on specific products identified by their IDs',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiBody)({
        type: seo_dto_1.ScanProductsDto,
        description: 'Product IDs to scan',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Products scan completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'object' },
                message: {
                    type: 'string',
                    example: 'Products scan completed successfully',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Shop parameter or Product IDs are required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('shop')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.ScanProductsDto, String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "scanProducts", null);
__decorate([
    (0, common_1.Post)('apply/suggestion'),
    (0, swagger_1.ApiOperation)({
        summary: 'Apply a single SEO suggestion',
        description: 'Applies a specific SEO improvement suggestion to a product',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiBody)({
        type: seo_dto_1.ApplySuggestionDto,
        description: 'SEO suggestion to apply',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Suggestion applied successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'object' },
                message: { type: 'string', example: 'Suggestion applied successfully' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Shop parameter is required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('shop')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.ApplySuggestionDto, String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "applySuggestion", null);
__decorate([
    (0, common_1.Post)('apply/bulk'),
    (0, swagger_1.ApiOperation)({
        summary: 'Apply multiple SEO suggestions',
        description: 'Applies multiple SEO improvement suggestions in bulk',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiBody)({
        type: seo_dto_1.ApplyBulkSuggestionsDto,
        description: 'Multiple SEO suggestions to apply',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bulk suggestions applied successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'object' },
                message: {
                    type: 'string',
                    example: 'X suggestions applied successfully',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Shop parameter or suggestions are required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('shop')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.ApplyBulkSuggestionsDto, String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "applyBulkSuggestions", null);
exports.SeoController = SeoController = SeoController_1 = __decorate([
    (0, swagger_1.ApiTags)('seo'),
    (0, common_1.Controller)('api/seo'),
    __metadata("design:paramtypes", [seo_service_1.SeoService])
], SeoController);
//# sourceMappingURL=seo.controller.js.map