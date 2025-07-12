import {
  Controller,
  Get,
  Query,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { PaginationDto, ApiResponseDto } from '../../dto/common.dto';

@Controller('api/products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(
    @Query() paginationDto: PaginationDto,
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<any>> {
    try {
      if (!shop) {
        throw new HttpException('Shop parameter is required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.productsService.getProducts(shop, paginationDto);

      return {
        success: true,
        data: result,
        message: 'Products fetched successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching products', error);
      throw new HttpException(
        'Failed to fetch products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getProduct(
    @Param('id') id: string,
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<any>> {
    try {
      if (!shop) {
        throw new HttpException('Shop parameter is required', HttpStatus.BAD_REQUEST);
      }

      if (!id) {
        throw new HttpException('Product ID is required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.productsService.getProductById(shop, id);

      if (!result) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: result,
        message: 'Product fetched successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching product', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to fetch product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}