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
var ProductsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const products_service_1 = require("./products.service");
const common_dto_1 = require("../../dto/common.dto");
let ProductsController = ProductsController_1 = class ProductsController {
    productsService;
    logger = new common_1.Logger(ProductsController_1.name);
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getProducts(paginationDto, shop) {
        try {
            if (!shop) {
                throw new common_1.HttpException('Shop parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.productsService.getProducts(shop, paginationDto);
            return {
                success: true,
                data: result,
                message: 'Products fetched successfully',
            };
        }
        catch (error) {
            this.logger.error('Error fetching products', error);
            throw new common_1.HttpException('Failed to fetch products', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getProduct(id, shop) {
        try {
            if (!shop) {
                throw new common_1.HttpException('Shop parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            if (!id) {
                throw new common_1.HttpException('Product ID is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.productsService.getProductById(shop, id);
            if (!result) {
                throw new common_1.HttpException('Product not found', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: result,
                message: 'Product fetched successfully',
            };
        }
        catch (error) {
            this.logger.error('Error fetching product', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to fetch product', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get products from Shopify store',
        description: 'Retrieves a paginated list of products from the specified Shopify store',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        description: 'Page number for pagination',
        required: false,
        example: 1,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: 'Number of products per page',
        required: false,
        example: 10,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Products fetched successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        products: { type: 'array', items: { type: 'object' } },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'number', example: 1 },
                                limit: { type: 'number', example: 10 },
                                total: { type: 'number', example: 100 },
                                totalPages: { type: 'number', example: 10 },
                            },
                        },
                    },
                },
                message: {
                    type: 'string',
                    example: 'Products fetched successfully',
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
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('shop')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_dto_1.PaginationDto, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a specific product by ID',
        description: 'Retrieves detailed information about a specific product from the Shopify store',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Product ID',
        example: 'gid://shopify/Product/123456789',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Product fetched successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: 'gid://shopify/Product/123456789' },
                        title: { type: 'string', example: 'Sample Product' },
                        handle: { type: 'string', example: 'sample-product' },
                        description: { type: 'string', example: 'Product description' },
                        images: { type: 'array', items: { type: 'object' } },
                        variants: { type: 'array', items: { type: 'object' } },
                    },
                },
                message: {
                    type: 'string',
                    example: 'Product fetched successfully',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Shop parameter or Product ID is required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Product not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('shop')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProduct", null);
exports.ProductsController = ProductsController = ProductsController_1 = __decorate([
    (0, swagger_1.ApiTags)('products'),
    (0, common_1.Controller)('api/products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map