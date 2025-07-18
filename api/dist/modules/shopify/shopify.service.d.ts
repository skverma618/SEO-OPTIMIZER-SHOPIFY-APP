import { ConfigService } from '@nestjs/config';
export declare class ShopifyService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    private createGraphQLClient;
    fetchProducts(shopDomain: string, accessToken: string, first?: number, after?: string, query?: string): Promise<any>;
    fetchProductById(shopDomain: string, accessToken: string, productId: string): Promise<any>;
    updateProduct(shopDomain: string, accessToken: string, productId: string, updates: any): Promise<{
        success: boolean;
        errors: any;
        product?: undefined;
    } | {
        success: boolean;
        product: any;
        errors?: undefined;
    }>;
    updateProductImage(shopDomain: string, accessToken: string, imageId: string, altText: string): Promise<any>;
    updateProductMetafield(shopDomain: string, accessToken: string, productId: string, namespace: string, key: string, value: string, type?: string): Promise<any>;
    verifyWebhook(data: string, hmacHeader: string): Promise<boolean>;
    private buildProductUpdateInput;
}
