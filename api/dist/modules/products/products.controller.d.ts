import { ProductsService } from './products.service';
import { ApiResponseDto, ProductsQueryDto } from '../../dto/common.dto';
export declare class ProductsController {
    private readonly productsService;
    private readonly logger;
    constructor(productsService: ProductsService);
    getProducts(queryDto: ProductsQueryDto): Promise<ApiResponseDto<any>>;
    getProduct(id: string, shop: string): Promise<ApiResponseDto<any>>;
}
