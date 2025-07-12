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
exports.ScanHistory = void 0;
const typeorm_1 = require("typeorm");
const shop_entity_1 = require("./shop.entity");
let ScanHistory = class ScanHistory {
    id;
    shopDomain;
    shop;
    scanResults;
    totalProducts;
    productsWithIssues;
    scanType;
    createdAt;
};
exports.ScanHistory = ScanHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ScanHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ScanHistory.prototype, "shopDomain", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop),
    (0, typeorm_1.JoinColumn)({ name: 'shopDomain', referencedColumnName: 'shopDomain' }),
    __metadata("design:type", shop_entity_1.Shop)
], ScanHistory.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    __metadata("design:type", Object)
], ScanHistory.prototype, "scanResults", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ScanHistory.prototype, "totalProducts", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ScanHistory.prototype, "productsWithIssues", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ScanHistory.prototype, "scanType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ScanHistory.prototype, "createdAt", void 0);
exports.ScanHistory = ScanHistory = __decorate([
    (0, typeorm_1.Entity)('scan_history')
], ScanHistory);
//# sourceMappingURL=scan-history.entity.js.map