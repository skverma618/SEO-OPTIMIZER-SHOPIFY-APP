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
const parallel_seo_analysis_service_1 = require("./parallel-seo-analysis.service");
const product_data_transformer_service_1 = require("./product-data-transformer.service");
const shopify_service_1 = require("../shopify/shopify.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("../../entities/shop.entity");
let SeoController = SeoController_1 = class SeoController {
    seoService;
    parallelSeoAnalysisService;
    productDataTransformerService;
    shopifyService;
    shopRepository;
    logger = new common_1.Logger(SeoController_1.name);
    constructor(seoService, parallelSeoAnalysisService, productDataTransformerService, shopifyService, shopRepository) {
        this.seoService = seoService;
        this.parallelSeoAnalysisService = parallelSeoAnalysisService;
        this.productDataTransformerService = productDataTransformerService;
        this.shopifyService = shopifyService;
        this.shopRepository = shopRepository;
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
    async analyzeSEO(scanProductsDto, shop) {
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
                data: {
                    ...result,
                    totalIssues: result.productsWithIssues,
                },
                message: 'SEO analysis completed successfully',
            };
        }
        catch (error) {
            this.logger.error('Error analyzing SEO', error);
            throw new common_1.HttpException('Failed to analyze SEO', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
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
            console.log("INSIDE APPLY BULK SUGGESTIONS CONTROLLER WITH SHOP AND DTO : ", shop, applyBulkDto);
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
    async applyBulkSuggestionsNew(applyBulkDto, shop) {
        try {
            if (!shop) {
                throw new common_1.HttpException('Shop parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!applyBulkDto.products || applyBulkDto.products.length === 0) {
                throw new common_1.HttpException('Products are required', common_1.HttpStatus.BAD_REQUEST);
            }
            console.log("INSIDE NEW BULK APPLY CONTROLLER WITH SHOP AND DTO: ", shop, applyBulkDto);
            const allSuggestions = applyBulkDto.products.flatMap(product => product.suggestions.map(suggestion => ({
                ...suggestion,
                productId: product.productId,
            })));
            const result = await this.seoService.applyBulkSuggestions(shop, allSuggestions);
            const totalSuggestions = allSuggestions.length;
            const totalProducts = applyBulkDto.products.length;
            return {
                success: true,
                data: result,
                message: `${totalSuggestions} suggestions applied successfully across ${totalProducts} products`,
            };
        }
        catch (error) {
            this.logger.error('Error applying bulk suggestions (new format)', error);
            throw new common_1.HttpException('Failed to apply suggestions', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeParallel(analysisInput, shop) {
        try {
            if (!shop) {
                throw new common_1.HttpException('Shop parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.parallelSeoAnalysisService.analyzeProductSeo(analysisInput);
            return {
                success: true,
                data: result,
                message: 'Parallel SEO analysis completed successfully',
            };
        }
        catch (error) {
            this.logger.error('Error in parallel SEO analysis', error);
            throw new common_1.HttpException('Failed to complete parallel SEO analysis', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeBatch(analysisInputs, shop) {
        try {
            if (!shop) {
                throw new common_1.HttpException('Shop parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!analysisInputs || analysisInputs.length === 0) {
                throw new common_1.HttpException('Analysis data is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const results = await this.parallelSeoAnalysisService.analyzeMultipleProducts(analysisInputs);
            const summary = this.parallelSeoAnalysisService.getAnalysisSummary(results);
            return {
                success: true,
                data: { results, summary },
                message: `Batch SEO analysis completed successfully for ${results.length} products`,
            };
        }
        catch (error) {
            this.logger.error('Error in batch SEO analysis', error);
            throw new common_1.HttpException('Failed to complete batch SEO analysis', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeShopifyProduct(productId, shop) {
        try {
            if (!shop) {
                throw new common_1.HttpException('Shop parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!productId) {
                throw new common_1.HttpException('Product ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const shopEntity = await this.shopRepository.findOne({
                where: { shopDomain: shop },
            });
            if (!shopEntity) {
                throw new common_1.HttpException('Shop not found or not authenticated', common_1.HttpStatus.NOT_FOUND);
            }
            const shopifyProductResult = await this.shopifyService.fetchProductById(shop, shopEntity.accessToken, productId);
            if (shopifyProductResult.errors) {
                throw new common_1.HttpException('Failed to fetch product from Shopify: ' + JSON.stringify(shopifyProductResult.errors), common_1.HttpStatus.BAD_REQUEST);
            }
            const shopifyProduct = shopifyProductResult.data?.product;
            if (!shopifyProduct) {
                throw new common_1.HttpException('Product not found', common_1.HttpStatus.NOT_FOUND);
            }
            const analysisInput = this.productDataTransformerService.transformShopifyProductToAnalysisInput(shopifyProduct);
            const validation = this.productDataTransformerService.validateAnalysisInput(analysisInput);
            if (!validation.isValid) {
                this.logger.warn('Analysis input validation failed:', validation.errors);
            }
            const result = await this.parallelSeoAnalysisService.analyzeProductSeo(analysisInput);
            return {
                success: true,
                data: result,
                message: 'Product SEO analysis completed successfully',
            };
        }
        catch (error) {
            this.logger.error('Error in Shopify product SEO analysis', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to complete product SEO analysis', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeShopifyProductsBatch(scanProductsDto, shop) {
        try {
            if (!shop) {
                throw new common_1.HttpException('Shop parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!scanProductsDto.productIds || scanProductsDto.productIds.length === 0) {
                throw new common_1.HttpException('Product IDs are required', common_1.HttpStatus.BAD_REQUEST);
            }
            const shopEntity = await this.shopRepository.findOne({
                where: { shopDomain: shop },
            });
            if (!shopEntity) {
                throw new common_1.HttpException('Shop not found or not authenticated', common_1.HttpStatus.NOT_FOUND);
            }
            const shopifyProducts = [];
            for (const productId of scanProductsDto.productIds) {
                try {
                    const result = await this.shopifyService.fetchProductById(shop, shopEntity.accessToken, productId);
                    if (result.data?.product) {
                        shopifyProducts.push(result.data.product);
                    }
                    else {
                        this.logger.warn(`Product ${productId} not found or has errors`);
                    }
                }
                catch (error) {
                    this.logger.warn(`Failed to fetch product ${productId}:`, error);
                }
            }
            if (shopifyProducts.length === 0) {
                throw new common_1.HttpException('No valid products found', common_1.HttpStatus.NOT_FOUND);
            }
            const analysisInputs = this.productDataTransformerService.transformMultipleProducts(shopifyProducts);
            const results = await this.parallelSeoAnalysisService.analyzeMultipleProducts(analysisInputs);
            const summary = this.parallelSeoAnalysisService.getAnalysisSummary(results);
            return {
                success: true,
                data: { results, summary },
                message: `Batch SEO analysis completed successfully for ${results.length} products`,
            };
        }
        catch (error) {
            this.logger.error('Error in batch Shopify product SEO analysis', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to complete batch product SEO analysis', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
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
    (0, common_1.Post)('analyze'),
    (0, swagger_1.ApiOperation)({
        summary: 'Analyze products for SEO issues',
        description: 'Analyzes specific products for SEO opportunities and returns suggestions',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiBody)({
        type: seo_dto_1.ScanProductsDto,
        description: 'Product IDs to analyze',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'SEO analysis completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'object' },
                message: {
                    type: 'string',
                    example: 'SEO analysis completed successfully',
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
], SeoController.prototype, "analyzeSEO", null);
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
__decorate([
    (0, common_1.Post)('apply/bulk-new'),
    (0, swagger_1.ApiOperation)({
        summary: 'Apply multiple SEO suggestions grouped by product',
        description: 'Applies multiple SEO improvement suggestions organized by product',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiBody)({
        type: seo_dto_1.ApplyBulkSuggestionsNewDto,
        description: 'Products with their selected suggestions',
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
                    example: 'X suggestions applied successfully across Y products',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Shop parameter or products are required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('shop')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.ApplyBulkSuggestionsNewDto, String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "applyBulkSuggestionsNew", null);
__decorate([
    (0, common_1.Post)('analyze/parallel'),
    (0, swagger_1.ApiOperation)({
        summary: 'Perform parallel SEO analysis using LangChain LLM',
        description: 'Analyzes product content, SEO metadata, images, and metafields concurrently using AI',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiBody)({
        type: seo_dto_1.ParallelAnalysisInputDto,
        description: 'Product data for parallel analysis',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Parallel SEO analysis completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        productId: { type: 'string', example: 'gid://shopify/Product/123456789' },
                        overallScore: { type: 'number', example: 78 },
                        productContentAnalysis: { type: 'object' },
                        seoMetadataAnalysis: { type: 'object' },
                        imageAnalysis: { type: 'object' },
                        metafieldsAnalysis: { type: 'object' },
                        allSuggestions: { type: 'array' },
                        executionTime: { type: 'number', example: 2500 },
                    },
                },
                message: {
                    type: 'string',
                    example: 'Parallel SEO analysis completed successfully',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Shop parameter or analysis data is required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('shop')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_dto_1.ParallelAnalysisInputDto, String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "analyzeParallel", null);
__decorate([
    (0, common_1.Post)('analyze/batch'),
    (0, swagger_1.ApiOperation)({
        summary: 'Perform batch parallel SEO analysis for multiple products',
        description: 'Analyzes multiple products concurrently using AI workers',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiBody)({
        type: [seo_dto_1.ParallelAnalysisInputDto],
        description: 'Array of product data for batch analysis',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Batch SEO analysis completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        results: { type: 'array' },
                        summary: {
                            type: 'object',
                            properties: {
                                averageScore: { type: 'number', example: 75 },
                                totalSuggestions: { type: 'number', example: 45 },
                                highPrioritySuggestions: { type: 'number', example: 12 },
                                analysisTime: { type: 'number', example: 8500 },
                            },
                        },
                    },
                },
                message: {
                    type: 'string',
                    example: 'Batch SEO analysis completed successfully',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Shop parameter or analysis data is required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('shop')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "analyzeBatch", null);
__decorate([
    (0, common_1.Post)('analyze/product/:productId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch Shopify product data and perform parallel SEO analysis',
        description: 'Automatically fetches product data from Shopify and performs comprehensive SEO analysis using AI',
    }),
    (0, swagger_1.ApiParam)({
        name: 'productId',
        description: 'Shopify product ID',
        example: 'gid://shopify/Product/123456789',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product SEO analysis completed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        productId: { type: 'string', example: 'gid://shopify/Product/123456789' },
                        overallScore: { type: 'number', example: 78 },
                        productContentAnalysis: { type: 'object' },
                        seoMetadataAnalysis: { type: 'object' },
                        imageAnalysis: { type: 'object' },
                        metafieldsAnalysis: { type: 'object' },
                        allSuggestions: { type: 'array' },
                        executionTime: { type: 'number', example: 2500 },
                    },
                },
                message: {
                    type: 'string',
                    example: 'Product SEO analysis completed successfully',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Shop parameter or product ID is required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Product not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
    }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('shop')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SeoController.prototype, "analyzeShopifyProduct", null);
__decorate([
    (0, common_1.Post)('analyze/products/batch'),
    (0, swagger_1.ApiOperation)({
        summary: 'Fetch multiple Shopify products and perform batch SEO analysis',
        description: 'Automatically fetches multiple products from Shopify and performs batch SEO analysis using AI',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiBody)({
        type: seo_dto_1.ScanProductsDto,
        description: 'Product IDs to analyze',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Batch product SEO analysis completed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Shop parameter or product IDs are required',
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
], SeoController.prototype, "analyzeShopifyProductsBatch", null);
exports.SeoController = SeoController = SeoController_1 = __decorate([
    (0, swagger_1.ApiTags)('seo'),
    (0, common_1.Controller)('seo'),
    __param(4, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __metadata("design:paramtypes", [seo_service_1.SeoService,
        parallel_seo_analysis_service_1.ParallelSeoAnalysisService,
        product_data_transformer_service_1.ProductDataTransformerService,
        shopify_service_1.ShopifyService,
        typeorm_2.Repository])
], SeoController);
//# sourceMappingURL=seo.controller.js.map