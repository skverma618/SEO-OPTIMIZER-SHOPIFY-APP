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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
let AuthController = AuthController_1 = class AuthController {
    authService;
    logger = new common_1.Logger(AuthController_1.name);
    constructor(authService) {
        this.authService = authService;
    }
    async install(shop) {
        try {
            if (!shop) {
                throw new common_1.HttpException('Shop parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const authUrl = await this.authService.generateAuthUrl(shop);
            return {
                success: true,
                data: { authUrl },
                message: 'Auth URL generated successfully',
            };
        }
        catch (error) {
            this.logger.error('Error generating auth URL', error);
            throw new common_1.HttpException('Failed to generate auth URL', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async callback(code, hmac, shop, state) {
        try {
            if (!code || !shop) {
                throw new common_1.HttpException('Missing required parameters', common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.authService.handleCallback(code, shop, hmac, state);
            if (result.success) {
                return {
                    url: `${process.env.FRONTEND_URL}?installation=success`,
                    statusCode: 302,
                };
            }
            else {
                return {
                    url: `${process.env.FRONTEND_URL}?installation=error`,
                    statusCode: 302,
                };
            }
        }
        catch (error) {
            this.logger.error('Error handling OAuth callback', error);
            return {
                url: `${process.env.FRONTEND_URL}?installation=error`,
                statusCode: 302,
            };
        }
    }
    async verify(shop) {
        try {
            if (!shop) {
                throw new common_1.HttpException('Shop parameter is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const isValid = await this.authService.verifyShopSession(shop);
            return {
                success: true,
                data: { isValid },
                message: isValid ? 'Session is valid' : 'Session is invalid',
            };
        }
        catch (error) {
            this.logger.error('Error verifying shop session', error);
            throw new common_1.HttpException('Failed to verify session', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('install'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate Shopify OAuth URL',
        description: 'Generates the OAuth authorization URL for Shopify app installation',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Auth URL generated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        authUrl: {
                            type: 'string',
                            example: 'https://my-shop.myshopify.com/admin/oauth/authorize?...',
                        },
                    },
                },
                message: {
                    type: 'string',
                    example: 'Auth URL generated successfully',
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
], AuthController.prototype, "install", null);
__decorate([
    (0, common_1.Get)('callback'),
    (0, common_1.Redirect)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Handle Shopify OAuth callback',
        description: 'Processes the OAuth callback from Shopify and completes the installation',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'code',
        description: 'Authorization code from Shopify',
        example: 'abc123def456',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hmac',
        description: 'HMAC signature for verification',
        example: 'sha256=...',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'state',
        description: 'State parameter for security',
        example: 'random-state-string',
    }),
    (0, swagger_1.ApiResponse)({
        status: 302,
        description: 'Redirects to frontend with installation result',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Missing required parameters',
    }),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('hmac')),
    __param(2, (0, common_1.Query)('shop')),
    __param(3, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "callback", null);
__decorate([
    (0, common_1.Get)('verify'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify shop session',
        description: 'Verifies if the shop has a valid session and is properly authenticated',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'shop',
        description: 'Shopify shop domain',
        example: 'my-shop.myshopify.com',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Shop session verification result',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        isValid: { type: 'boolean', example: true },
                    },
                },
                message: {
                    type: 'string',
                    example: 'Session is valid',
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
], AuthController.prototype, "verify", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map