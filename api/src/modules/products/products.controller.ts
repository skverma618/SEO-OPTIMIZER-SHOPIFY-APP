import {
  Controller,
  Get,
  Query,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ApiResponseDto, ProductsQueryDto } from '../../dto/common.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get products from Shopify store',
    description:
      'Retrieves a paginated list of products from the specified Shopify store',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of products per page',
    required: false,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Products fetched successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            products: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 100 },
                totalPages: { type: 'number', example: 10 },
              },
            },
          },
        },
        message: {
          type: 'string',
          example: 'Products fetched successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Shop parameter is required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getProducts(
    @Query() queryDto: ProductsQueryDto,
  ): Promise<ApiResponseDto<any>> {
    try {
      const { shop, ...paginationDto } = queryDto;

      const result = await this.productsService.getProducts(
        shop,
        paginationDto,
      );

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
  @ApiOperation({
    summary: 'Get a specific product by ID',
    description:
      'Retrieves detailed information about a specific product from the Shopify store',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'gid://shopify/Product/123456789',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Product fetched successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'gid://shopify/Product/123456789' },
            title: { type: 'string', example: 'Sample Product' },
            handle: { type: 'string', example: 'sample-product' },
            description: { type: 'string', example: 'Product description' },
            images: { type: 'array', items: { type: 'object' } },
            variants: { type: 'array', items: { type: 'object' } },
          },
        },
        message: {
          type: 'string',
          example: 'Product fetched successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Shop parameter or Product ID is required',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getProduct(
    @Param('id') id: string,
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<any>> {
    try {
      if (!shop) {
        throw new HttpException(
          'Shop parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!id) {
        throw new HttpException(
          'Product ID is required',
          HttpStatus.BAD_REQUEST,
        );
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
