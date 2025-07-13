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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("../../entities/shop.entity");
const axios_1 = require("axios");
let AuthService = AuthService_1 = class AuthService {
    configService;
    shopRepository;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(configService, shopRepository) {
        this.configService = configService;
        this.shopRepository = shopRepository;
    }
    async generateAuthUrl(shop) {
        const apiKey = this.configService.get('SHOPIFY_API_KEY');
        const scopes = this.configService.get('SHOPIFY_SCOPES');
        const redirectUri = `${this.configService.get('APP_URL')}/api/auth/callback`;
        const state = this.generateRandomState();
        const authUrl = `https://${shop}/admin/oauth/authorize?` +
            `client_id=${apiKey}&` +
            `scope=${scopes}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `state=${state}`;
        return authUrl;
    }
    async handleCallback(code, shop, hmac, state) {
        try {
            const accessToken = await this.exchangeCodeForToken(code, shop);
            if (!accessToken) {
                return { success: false, message: 'Failed to get access token' };
            }
            const shopInfo = await this.getShopInfo(shop, accessToken);
            await this.saveShop(shop, accessToken, shopInfo);
            return { success: true, message: 'Installation successful' };
        }
        catch (error) {
            this.logger.error('Error handling OAuth callback', error);
            return { success: false, message: 'Installation failed' };
        }
    }
    async verifyShopSession(shop) {
        try {
            const shopEntity = await this.shopRepository.findOne({
                where: { shopDomain: shop },
            });
            if (!shopEntity || !shopEntity.isActive) {
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error('Error verifying shop session', error);
            return false;
        }
    }
    async exchangeCodeForToken(code, shop) {
        try {
            const apiKey = this.configService.get('SHOPIFY_API_KEY');
            const apiSecret = this.configService.get('SHOPIFY_API_SECRET');
            const response = await axios_1.default.post(`https://${shop}/admin/oauth/access_token`, {
                client_id: apiKey,
                client_secret: apiSecret,
                code,
            });
            return response.data.access_token;
        }
        catch (error) {
            this.logger.error('Error exchanging code for token', error);
            return null;
        }
    }
    async getShopInfo(shop, accessToken) {
        try {
            const response = await axios_1.default.get(`https://${shop}/admin/api/2023-10/shop.json`, {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                },
            });
            return response.data.shop;
        }
        catch (error) {
            this.logger.error('Error getting shop info', error);
            return {};
        }
    }
    async saveShop(shop, accessToken, shopInfo) {
        try {
            const existingShop = await this.shopRepository.findOne({
                where: { shopDomain: shop },
            });
            if (existingShop) {
                existingShop.accessToken = accessToken;
                existingShop.email = shopInfo.email || existingShop.email;
                existingShop.shopName = shopInfo.name || existingShop.shopName;
                existingShop.planName = shopInfo.plan_name || existingShop.planName;
                existingShop.isActive = true;
                existingShop.updatedAt = new Date();
                await this.shopRepository.save(existingShop);
            }
            else {
                const newShop = this.shopRepository.create({
                    shopDomain: shop,
                    accessToken,
                    scope: this.configService.get('SHOPIFY_SCOPES'),
                    email: shopInfo.email,
                    shopName: shopInfo.name,
                    planName: shopInfo.plan_name,
                    isActive: true,
                });
                await this.shopRepository.save(newShop);
            }
        }
        catch (error) {
            this.logger.error('Error saving shop', error);
            throw error;
        }
    }
    generateRandomState() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    async getBrandStory(shop) {
        try {
            const shopEntity = await this.shopRepository.findOne({
                where: { shopDomain: shop },
            });
            if (!shopEntity) {
                throw new Error('Shop not found');
            }
            const brandMapping = shopEntity.brandMapping || {};
            if (!brandMapping.brandName && shopEntity.shopName) {
                brandMapping.brandName = shopEntity.shopName;
            }
            return brandMapping;
        }
        catch (error) {
            this.logger.error('Error getting brand story', error);
            throw error;
        }
    }
    async saveBrandStory(shop, brandStoryDto) {
        try {
            const shopEntity = await this.shopRepository.findOne({
                where: { shopDomain: shop },
            });
            if (!shopEntity) {
                throw new Error('Shop not found');
            }
            shopEntity.brandMapping = {
                ...shopEntity.brandMapping,
                ...brandStoryDto,
            };
            await this.shopRepository.save(shopEntity);
            return { success: true };
        }
        catch (error) {
            this.logger.error('Error saving brand story', error);
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map