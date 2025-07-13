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
var SeoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("../../entities/shop.entity");
const scan_history_entity_1 = require("../../entities/scan-history.entity");
const shopify_service_1 = require("../shopify/shopify.service");
const simplified_seo_analysis_service_1 = require("./simplified-seo-analysis.service");
let SeoService = SeoService_1 = class SeoService {
    shopRepository;
    scanHistoryRepository;
    shopifyService;
    simplifiedSeoAnalysisService;
    logger = new common_1.Logger(SeoService_1.name);
    constructor(shopRepository, scanHistoryRepository, shopifyService, simplifiedSeoAnalysisService) {
        this.shopRepository = shopRepository;
        this.scanHistoryRepository = scanHistoryRepository;
        this.shopifyService = shopifyService;
        this.simplifiedSeoAnalysisService = simplifiedSeoAnalysisService;
    }
    async scanEntireStore(shopDomain) {
        try {
            const shop = await this.shopRepository.findOne({
                where: { shopDomain },
            });
            if (!shop) {
                throw new Error('Shop not found');
            }
            const allProducts = await this.fetchAllProducts(shopDomain, shop.accessToken);
            const scanResults = await this.analyzeProductsForSEO(allProducts, shopDomain);
            await this.saveScanHistory(shopDomain, 'store', scanResults);
            return {
                scanId: this.generateScanId(),
                totalProducts: allProducts.length,
                productsWithIssues: scanResults.filter(result => result.suggestions.length > 0).length,
                results: scanResults,
            };
        }
        catch (error) {
            this.logger.error('Error scanning entire store', error);
            throw error;
        }
    }
    async scanSelectedProducts(shopDomain, productIds) {
        try {
            const shop = await this.shopRepository.findOne({
                where: { shopDomain },
            });
            if (!shop) {
                throw new Error('Shop not found');
            }
            const products = await this.fetchProductsByIds(shopDomain, shop.accessToken, productIds);
            const scanResults = await this.analyzeProductsForSEO(products, shopDomain);
            await this.saveScanHistory(shopDomain, 'products', scanResults);
            return {
                scanId: this.generateScanId(),
                totalProducts: products.length,
                productsWithIssues: scanResults.filter(result => result.suggestions.length > 0).length,
                results: scanResults,
            };
        }
        catch (error) {
            this.logger.error('Error scanning selected products', error);
            throw error;
        }
    }
    async applySingleSuggestion(shopDomain, suggestion) {
        try {
            const shop = await this.shopRepository.findOne({
                where: { shopDomain },
            });
            if (!shop) {
                throw new Error('Shop not found');
            }
            const result = await this.applySuggestionToShopify(shopDomain, shop.accessToken, suggestion);
            return {
                success: true,
                appliedSuggestion: suggestion,
                shopifyResponse: result,
            };
        }
        catch (error) {
            this.logger.error('Error applying single suggestion', error);
            throw error;
        }
    }
    async applyBulkSuggestions(shopDomain, suggestions) {
        try {
            const shop = await this.shopRepository.findOne({
                where: { shopDomain },
            });
            if (!shop) {
                throw new Error('Shop not found');
            }
            const results = [];
            const errors = [];
            for (const suggestion of suggestions) {
                try {
                    console.log("TRYING TO UPDATE THE SUGGESTION: ", suggestion);
                    const result = await this.applySuggestionToShopify(shopDomain, shop.accessToken, suggestion);
                    results.push({ suggestion, result, success: true });
                }
                catch (error) {
                    errors.push({ suggestion, error: error.message, success: false });
                }
            }
            return {
                totalSuggestions: suggestions.length,
                successfulApplications: results.length,
                failedApplications: errors.length,
                results,
                errors,
            };
        }
        catch (error) {
            this.logger.error('Error applying bulk suggestions', error);
            throw error;
        }
    }
    async fetchAllProducts(shopDomain, accessToken) {
        const result = await this.shopifyService.fetchProducts(shopDomain, accessToken, 250);
        return result.data?.products?.edges?.map((edge) => edge.node) || [];
    }
    async fetchProductsByIds(shopDomain, accessToken, productIds) {
        const products = [];
        for (const productId of productIds) {
            try {
                const result = await this.shopifyService.fetchProductById(shopDomain, accessToken, productId);
                if (result.data?.product) {
                    products.push(result.data.product);
                }
            }
            catch (error) {
                this.logger.warn(`Failed to fetch product ${productId}`, error);
            }
        }
        return products;
    }
    async analyzeProductsForSEO(products, shopDomain) {
        try {
            this.logger.log(`Starting SEO analysis for ${products.length} products`);
            const analysisResults = await this.simplifiedSeoAnalysisService.analyzeProductsSimplified(products, shopDomain);
            this.logger.log(`Completed SEO analysis for ${products.length} products`);
            return analysisResults;
        }
        catch (error) {
            this.logger.error('Error in SEO analysis, falling back to mock suggestions', error);
            return products.map(product => ({
                productId: product.id,
                title: product.title,
                handle: product.handle,
                suggestions: this.generateMockSuggestions(product),
            }));
        }
    }
    generateMockSuggestions(product) {
        const suggestions = [];
        if (!product.seo?.title || product.seo.title.length < 30) {
            suggestions.push({
                id: `title-${product.id}`,
                type: 'title',
                priority: 'high',
                field: 'seo.title',
                current: product.seo?.title || product.title,
                suggested: `${product.title} - Premium Quality | Best Price`,
                reason: 'SEO title should be 30-60 characters and include target keywords',
                impact: 'Could improve search ranking and click-through rates',
            });
        }
        if (!product.seo?.description) {
            suggestions.push({
                id: `meta-desc-${product.id}`,
                type: 'meta-description',
                priority: 'high',
                field: 'seo.description',
                current: '',
                suggested: `Discover ${product.title} with premium features and quality. Shop now for the best deals and fast shipping.`,
                reason: 'Missing meta description reduces search engine visibility',
                impact: 'Meta descriptions can improve click-through rates by up to 30%',
            });
        }
        if (product.images?.edges?.some((edge) => !edge.node.altText)) {
            suggestions.push({
                id: `alt-text-${product.id}`,
                type: 'alt-text',
                priority: 'medium',
                field: 'images.altText',
                current: '',
                suggested: `${product.title} product image showing main features`,
                reason: 'Missing alt text hurts accessibility and SEO',
                impact: 'Improves image search visibility and accessibility compliance',
            });
        }
        return suggestions;
    }
    async applySuggestionToShopify(shopDomain, accessToken, suggestion) {
        try {
            this.logger.log(`Applying suggestion for field: ${suggestion.field}, productId: ${suggestion.productId}`);
            const currentProductResult = await this.shopifyService.fetchProductById(shopDomain, accessToken, suggestion.productId);
            if (currentProductResult.errors || !currentProductResult.data?.product) {
                throw new Error(`Failed to fetch current product: ${JSON.stringify(currentProductResult.errors)}`);
            }
            const currentProduct = currentProductResult.data.product;
            switch (suggestion.field) {
                case 'SEO Title':
                case 'seo.title':
                    this.logger.log(`Updating SEO title for product ${suggestion.productId} with value: ${suggestion.value}`);
                    const seoTitleResult = await this.shopifyService.updateProduct(shopDomain, accessToken, suggestion.productId, {
                        seo: {
                            title: suggestion.value,
                            description: currentProduct.seo?.description || '',
                        },
                    });
                    this.logger.log(`SEO title update result:`, JSON.stringify(seoTitleResult, null, 2));
                    return seoTitleResult;
                case 'SEO Description':
                case 'seo.description':
                    return await this.shopifyService.updateProduct(shopDomain, accessToken, suggestion.productId, {
                        seo: {
                            title: currentProduct.seo?.title || '',
                            description: suggestion.value,
                        },
                    });
                case 'Title':
                case 'Title Tag':
                case 'Product Title':
                    this.logger.log(`Updating product title for product ${suggestion.productId} with value: ${suggestion.value}`);
                    return await this.shopifyService.updateProduct(shopDomain, accessToken, suggestion.productId, {
                        title: suggestion.value,
                    });
                case 'Description':
                case 'description':
                    console.log("INSIDE SWITCH CASE DESCRIPTION : ", suggestion);
                    console.log("OTHER INFO : ", accessToken, shopDomain);
                    return await this.shopifyService.updateProduct(shopDomain, accessToken, suggestion.productId, {
                        descriptionHtml: suggestion.value,
                    });
                case 'images.altText':
                    const imageId = this.extractImageIdFromSuggestion(suggestion);
                    if (!imageId) {
                        throw new Error(`Image ID not found in suggestion ID: ${suggestion.suggestionId}. Alt text updates require image ID.`);
                    }
                    return await this.shopifyService.updateProductImage(shopDomain, accessToken, imageId, suggestion.value);
                case 'Meta Description':
                    return await this.shopifyService.updateProductMetafield(shopDomain, accessToken, suggestion.productId, 'seo', 'meta_description', suggestion.value, 'single_line_text_field');
                case 'Structured Data':
                    return await this.shopifyService.updateProductMetafield(shopDomain, accessToken, suggestion.productId, 'seo', 'structured_data', suggestion.value, 'json');
                case 'Product Details':
                    return await this.shopifyService.updateProductMetafield(shopDomain, accessToken, suggestion.productId, 'seo', 'product_details', suggestion.value, 'multi_line_text_field');
                default:
                    throw new Error(`Unsupported suggestion field: ${suggestion.field}`);
            }
        }
        catch (error) {
            this.logger.error(`Error applying suggestion for field ${suggestion.field}:`, error);
            throw error;
        }
    }
    extractImageIdFromSuggestion(suggestion) {
        if (suggestion.suggestionId.includes('gid://shopify/ProductImage/')) {
            const match = suggestion.suggestionId.match(/gid:\/\/shopify\/ProductImage\/(\d+)/);
            return match ? `gid://shopify/ProductImage/${match[1]}` : null;
        }
        if (suggestion.suggestionId.match(/^alt-text-\d+$/)) {
            this.logger.warn(`Cannot extract image ID from suggestion ID: ${suggestion.suggestionId}. Consider including image ID in suggestion ID.`);
            return null;
        }
        return null;
    }
    async saveScanHistory(shopDomain, scanType, results) {
        try {
            const scanHistory = this.scanHistoryRepository.create({
                shopDomain,
                scanType,
                scanResults: results,
                totalProducts: results.length,
                productsWithIssues: results.filter((r) => r.suggestions.length > 0).length,
            });
            await this.scanHistoryRepository.save(scanHistory);
        }
        catch (error) {
            this.logger.error('Error saving scan history', error);
        }
    }
    generateScanId() {
        return `scan_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
};
exports.SeoService = SeoService;
exports.SeoService = SeoService = SeoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(1, (0, typeorm_1.InjectRepository)(scan_history_entity_1.ScanHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        shopify_service_1.ShopifyService,
        simplified_seo_analysis_service_1.SimplifiedSeoAnalysisService])
], SeoService);
//# sourceMappingURL=seo.service.js.map