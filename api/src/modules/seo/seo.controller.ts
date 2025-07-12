import {
  Controller,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { SeoService } from './seo.service';
import {
  ScanProductsDto,
  ApplySuggestionDto,
  ApplyBulkSuggestionsDto,
} from '../../dto/seo.dto';
import { ApiResponseDto } from '../../dto/common.dto';

@ApiTags('seo')
@Controller('api/seo')
export class SeoController {
  private readonly logger = new Logger(SeoController.name);

  constructor(private readonly seoService: SeoService) {}

  @Post('scan/store')
  @ApiOperation({
    summary: 'Scan entire store for SEO issues',
    description:
      'Performs a comprehensive SEO analysis of all products in the Shopify store',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Store scan completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object' },
        message: {
          type: 'string',
          example: 'Store scan completed successfully',
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
  async scanStore(@Query('shop') shop: string): Promise<ApiResponseDto<any>> {
    try {
      if (!shop) {
        throw new HttpException(
          'Shop parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.seoService.scanEntireStore(shop);

      return {
        success: true,
        data: result,
        message: 'Store scan completed successfully',
      };
    } catch (error) {
      this.logger.error('Error scanning store', error);
      throw new HttpException(
        'Failed to scan store',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('scan/products')
  @ApiOperation({
    summary: 'Scan selected products for SEO issues',
    description:
      'Performs SEO analysis on specific products identified by their IDs',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiBody({
    type: ScanProductsDto,
    description: 'Product IDs to scan',
  })
  @ApiResponse({
    status: 200,
    description: 'Products scan completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object' },
        message: {
          type: 'string',
          example: 'Products scan completed successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Shop parameter or Product IDs are required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async scanProducts(
    @Body() scanProductsDto: ScanProductsDto,
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<any>> {
    try {
      if (!shop) {
        throw new HttpException(
          'Shop parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        !scanProductsDto.productIds ||
        scanProductsDto.productIds.length === 0
      ) {
        throw new HttpException(
          'Product IDs are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.seoService.scanSelectedProducts(
        shop,
        scanProductsDto.productIds,
      );

      return {
        success: true,
        data: result,
        message: 'Products scan completed successfully',
      };
    } catch (error) {
      this.logger.error('Error scanning products', error);
      throw new HttpException(
        'Failed to scan products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('apply/suggestion')
  @ApiOperation({
    summary: 'Apply a single SEO suggestion',
    description: 'Applies a specific SEO improvement suggestion to a product',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiBody({
    type: ApplySuggestionDto,
    description: 'SEO suggestion to apply',
  })
  @ApiResponse({
    status: 200,
    description: 'Suggestion applied successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object' },
        message: { type: 'string', example: 'Suggestion applied successfully' },
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
  async applySuggestion(
    @Body() applySuggestionDto: ApplySuggestionDto,
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<any>> {
    try {
      if (!shop) {
        throw new HttpException(
          'Shop parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.seoService.applySingleSuggestion(
        shop,
        applySuggestionDto,
      );

      return {
        success: true,
        data: result,
        message: 'Suggestion applied successfully',
      };
    } catch (error) {
      this.logger.error('Error applying suggestion', error);
      throw new HttpException(
        'Failed to apply suggestion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('apply/bulk')
  @ApiOperation({
    summary: 'Apply multiple SEO suggestions',
    description: 'Applies multiple SEO improvement suggestions in bulk',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiBody({
    type: ApplyBulkSuggestionsDto,
    description: 'Multiple SEO suggestions to apply',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk suggestions applied successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object' },
        message: {
          type: 'string',
          example: 'X suggestions applied successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Shop parameter or suggestions are required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async applyBulkSuggestions(
    @Body() applyBulkDto: ApplyBulkSuggestionsDto,
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<any>> {
    try {
      if (!shop) {
        throw new HttpException(
          'Shop parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!applyBulkDto.suggestions || applyBulkDto.suggestions.length === 0) {
        throw new HttpException(
          'Suggestions are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.seoService.applyBulkSuggestions(
        shop,
        applyBulkDto.suggestions,
      );

      return {
        success: true,
        data: result,
        message: `${applyBulkDto.suggestions.length} suggestions applied successfully`,
      };
    } catch (error) {
      this.logger.error('Error applying bulk suggestions', error);
      throw new HttpException(
        'Failed to apply suggestions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
