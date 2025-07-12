import { Repository } from 'typeorm';
import { Shop } from '../../entities/shop.entity';
import { ShopifyService } from '../shopify/shopify.service';
import { PaginationDto } from '../../dto/common.dto';
export declare class ProductsService {
    private shopRepository;
    private shopifyService;
    private readonly logger;
    constructor(shopRepository: Repository<Shop>, shopifyService: ShopifyService);
    getProducts(shopDomain: string, paginationDto: PaginationDto): Promise<{
        products: any;
        pagination: {
            page: number;
            limit: number;
            hasNextPage: any;
            hasPreviousPage: any;
            total: any;
        };
    }>;
    getProductById(shopDomain: string, productId: string): Promise<{
        id: any;
        title: any;
        handle: any;
        status: any;
        vendor: any;
        productType: any;
        description: any;
        seo: any;
        images: any;
        metafields: any;
    } | null>;
    private generateCursor;
}
