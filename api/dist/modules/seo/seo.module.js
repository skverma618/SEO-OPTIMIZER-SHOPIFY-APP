"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const seo_controller_1 = require("./seo.controller");
const seo_service_1 = require("./seo.service");
const shop_entity_1 = require("../../entities/shop.entity");
const scan_history_entity_1 = require("../../entities/scan-history.entity");
const shopify_module_1 = require("../shopify/shopify.module");
let SeoModule = class SeoModule {
};
exports.SeoModule = SeoModule;
exports.SeoModule = SeoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([shop_entity_1.Shop, scan_history_entity_1.ScanHistory]),
            shopify_module_1.ShopifyModule,
        ],
        controllers: [seo_controller_1.SeoController],
        providers: [seo_service_1.SeoService],
        exports: [seo_service_1.SeoService],
    })
], SeoModule);
//# sourceMappingURL=seo.module.js.map