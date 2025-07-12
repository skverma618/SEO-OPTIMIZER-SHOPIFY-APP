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
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('shop')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_dto_1.PaginationDto, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('shop')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProduct", null);
exports.ProductsController = ProductsController = ProductsController_1 = __decorate([
    (0, common_1.Controller)('api/products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map