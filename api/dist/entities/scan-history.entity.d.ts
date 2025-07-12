import { Shop } from './shop.entity';
export declare class ScanHistory {
    id: string;
    shopDomain: string;
    shop: Shop;
    scanResults: any;
    totalProducts: number;
    productsWithIssues: number;
    scanType: string;
    createdAt: Date;
}
