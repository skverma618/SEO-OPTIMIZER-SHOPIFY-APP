import { ProductsService } from './products.service';
import { PaginationDto, ApiResponseDto } from '../../dto/common.dto';
export declare class ProductsController {
    private readonly productsService;
    private readonly logger;
    constructor(productsService: ProductsService);
    getProducts(paginationDto: PaginationDto, shop: string): Promise<ApiResponseDto<any>>;
    getProduct(id: string, shop: string): Promise<ApiResponseDto<any>>;
}
