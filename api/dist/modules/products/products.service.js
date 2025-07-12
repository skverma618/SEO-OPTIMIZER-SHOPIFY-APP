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
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("../../entities/shop.entity");
const shopify_service_1 = require("../shopify/shopify.service");
let ProductsService = ProductsService_1 = class ProductsService {
    shopRepository;
    shopifyService;
    logger = new common_1.Logger(ProductsService_1.name);
    constructor(shopRepository, shopifyService) {
        this.shopRepository = shopRepository;
        this.shopifyService = shopifyService;
    }
    async getProducts(shopDomain, paginationDto) {
        try {
            const shop = await this.shopRepository.findOne({
                where: { shopDomain },
            });
            if (!shop) {
                throw new Error('Shop not found');
            }
            const { page = 1, limit = 10, search } = paginationDto;
            const first = limit;
            const after = page > 1 ? this.generateCursor(page, limit) : undefined;
            const result = await this.shopifyService.fetchProducts(shopDomain, shop.accessToken, first, after, search);
            if (result.errors) {
                throw new Error('Shopify API error: ' + JSON.stringify(result.errors));
            }
            const products = result.data?.products?.edges?.map((edge) => ({
                id: edge.node.id,
                title: edge.node.title,
                handle: edge.node.handle,
                status: edge.node.status,
                vendor: edge.node.vendor,
                productType: edge.node.productType,
                createdAt: edge.node.createdAt,
                updatedAt: edge.node.updatedAt,
                seo: edge.node.seo,
                description: edge.node.description,
                images: edge.node.images?.edges?.map((imgEdge) => ({
                    id: imgEdge.node.id,
                    url: imgEdge.node.url,
                    altText: imgEdge.node.altText,
                })) || [],
                totalInventory: edge.node.variants?.edges?.[0]?.node?.inventoryQuantity || 0,
            })) || [];
            const pageInfo = result.data?.products?.pageInfo || {};
            return {
                products,
                pagination: {
                    page,
                    limit,
                    hasNextPage: pageInfo.hasNextPage,
                    hasPreviousPage: pageInfo.hasPreviousPage,
                    total: products.length,
                },
            };
        }
        catch (error) {
            this.logger.error('Error fetching products', error);
            throw error;
        }
    }
    async getProductById(shopDomain, productId) {
        try {
            const shop = await this.shopRepository.findOne({
                where: { shopDomain },
            });
            if (!shop) {
                throw new Error('Shop not found');
            }
            const result = await this.shopifyService.fetchProductById(shopDomain, shop.accessToken, productId);
            if (result.errors) {
                throw new Error('Shopify API error: ' + JSON.stringify(result.errors));
            }
            const product = result.data?.product;
            if (!product) {
                return null;
            }
            return {
                id: product.id,
                title: product.title,
                handle: product.handle,
                status: product.status,
                vendor: product.vendor,
                productType: product.productType,
                description: product.description,
                seo: product.seo,
                images: product.images?.edges?.map((edge) => ({
                    id: edge.node.id,
                    url: edge.node.url,
                    altText: edge.node.altText,
                })) || [],
                metafields: product.metafields?.edges?.map((edge) => ({
                    id: edge.node.id,
                    namespace: edge.node.namespace,
                    key: edge.node.key,
                    value: edge.node.value,
                })) || [],
            };
        }
        catch (error) {
            this.logger.error('Error fetching product by ID', error);
            throw error;
        }
    }
    generateCursor(page, limit) {
        const offset = (page - 1) * limit;
        return Buffer.from(offset.toString()).toString('base64');
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        shopify_service_1.ShopifyService])
], ProductsService);
//# sourceMappingURL=products.service.js.map