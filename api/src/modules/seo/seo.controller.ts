import {
  Controller,
  Post,
  Body,
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
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { SeoService } from './seo.service';
import {
  ScanProductsDto,
  ApplySuggestionDto,
  ApplyBulkSuggestionsDto,
  ParallelAnalysisInputDto,
  ParallelAnalysisResultDto,
} from '../../dto/seo.dto';
import { ApiResponseDto } from '../../dto/common.dto';
import { ParallelSeoAnalysisService } from './parallel-seo-analysis.service';
import { ProductDataTransformerService } from './product-data-transformer.service';
import { ShopifyService } from '../shopify/shopify.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../../entities/shop.entity';

@ApiTags('seo')
@Controller('seo')
export class SeoController {
  private readonly logger = new Logger(SeoController.name);

  constructor(
    private readonly seoService: SeoService,
    private readonly parallelSeoAnalysisService: ParallelSeoAnalysisService,
    private readonly productDataTransformerService: ProductDataTransformerService,
    private readonly shopifyService: ShopifyService,
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
  ) {}

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

  @Post('analyze')
  @ApiOperation({
    summary: 'Analyze products for SEO issues',
    description:
      'Analyzes specific products for SEO opportunities and returns suggestions',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiBody({
    type: ScanProductsDto,
    description: 'Product IDs to analyze',
  })
  @ApiResponse({
    status: 200,
    description: 'SEO analysis completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object' },
        message: {
          type: 'string',
          example: 'SEO analysis completed successfully',
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
  async analyzeSEO(
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
        data: {
          ...result,
          totalIssues: result.productsWithIssues,
        },
        message: 'SEO analysis completed successfully',
      };
    } catch (error) {
      this.logger.error('Error analyzing SEO', error);
      throw new HttpException(
        'Failed to analyze SEO',
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

  @Post('analyze/parallel')
  @ApiOperation({
    summary: 'Perform parallel SEO analysis using LangChain LLM',
    description: 'Analyzes product content, SEO metadata, images, and metafields concurrently using AI',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiBody({
    type: ParallelAnalysisInputDto,
    description: 'Product data for parallel analysis',
  })
  @ApiResponse({
    status: 200,
    description: 'Parallel SEO analysis completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            productId: { type: 'string', example: 'gid://shopify/Product/123456789' },
            overallScore: { type: 'number', example: 78 },
            productContentAnalysis: { type: 'object' },
            seoMetadataAnalysis: { type: 'object' },
            imageAnalysis: { type: 'object' },
            metafieldsAnalysis: { type: 'object' },
            allSuggestions: { type: 'array' },
            executionTime: { type: 'number', example: 2500 },
          },
        },
        message: {
          type: 'string',
          example: 'Parallel SEO analysis completed successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Shop parameter or analysis data is required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async analyzeParallel(
    @Body() analysisInput: ParallelAnalysisInputDto,
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<ParallelAnalysisResultDto>> {
    try {
      if (!shop) {
        throw new HttpException(
          'Shop parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.parallelSeoAnalysisService.analyzeProductSeo(analysisInput);

      return {
        success: true,
        data: result,
        message: 'Parallel SEO analysis completed successfully',
      };
    } catch (error) {
      this.logger.error('Error in parallel SEO analysis', error);
      throw new HttpException(
        'Failed to complete parallel SEO analysis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('analyze/batch')
  @ApiOperation({
    summary: 'Perform batch parallel SEO analysis for multiple products',
    description: 'Analyzes multiple products concurrently using AI workers',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiBody({
    type: [ParallelAnalysisInputDto],
    description: 'Array of product data for batch analysis',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch SEO analysis completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            results: { type: 'array' },
            summary: {
              type: 'object',
              properties: {
                averageScore: { type: 'number', example: 75 },
                totalSuggestions: { type: 'number', example: 45 },
                highPrioritySuggestions: { type: 'number', example: 12 },
                analysisTime: { type: 'number', example: 8500 },
              },
            },
          },
        },
        message: {
          type: 'string',
          example: 'Batch SEO analysis completed successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Shop parameter or analysis data is required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async analyzeBatch(
    @Body() analysisInputs: ParallelAnalysisInputDto[],
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<{ results: ParallelAnalysisResultDto[]; summary: any }>> {
    try {
      if (!shop) {
        throw new HttpException(
          'Shop parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!analysisInputs || analysisInputs.length === 0) {
        throw new HttpException(
          'Analysis data is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const results = await this.parallelSeoAnalysisService.analyzeMultipleProducts(analysisInputs);
      const summary = this.parallelSeoAnalysisService.getAnalysisSummary(results);

      return {
        success: true,
        data: { results, summary },
        message: `Batch SEO analysis completed successfully for ${results.length} products`,
      };
    } catch (error) {
      this.logger.error('Error in batch SEO analysis', error);
      throw new HttpException(
        'Failed to complete batch SEO analysis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('analyze/product/:productId')
  @ApiOperation({
    summary: 'Fetch Shopify product data and perform parallel SEO analysis',
    description: 'Automatically fetches product data from Shopify and performs comprehensive SEO analysis using AI',
  })
  @ApiParam({
    name: 'productId',
    description: 'Shopify product ID',
    example: 'gid://shopify/Product/123456789',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Product SEO analysis completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            productId: { type: 'string', example: 'gid://shopify/Product/123456789' },
            overallScore: { type: 'number', example: 78 },
            productContentAnalysis: { type: 'object' },
            seoMetadataAnalysis: { type: 'object' },
            imageAnalysis: { type: 'object' },
            metafieldsAnalysis: { type: 'object' },
            allSuggestions: { type: 'array' },
            executionTime: { type: 'number', example: 2500 },
          },
        },
        message: {
          type: 'string',
          example: 'Product SEO analysis completed successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Shop parameter or product ID is required',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async analyzeShopifyProduct(
    @Param('productId') productId: string,
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<ParallelAnalysisResultDto>> {
    try {
      if (!shop) {
        throw new HttpException(
          'Shop parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!productId) {
        throw new HttpException(
          'Product ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get shop authentication
      const shopEntity = await this.shopRepository.findOne({
        where: { shopDomain: shop },
      });

      if (!shopEntity) {
        throw new HttpException(
          'Shop not found or not authenticated',
          HttpStatus.NOT_FOUND,
        );
      }

      // Fetch product data from Shopify
      const shopifyProductResult = await this.shopifyService.fetchProductById(
        shop,
        shopEntity.accessToken,
        productId,
      );

      if (shopifyProductResult.errors) {
        throw new HttpException(
          'Failed to fetch product from Shopify: ' + JSON.stringify(shopifyProductResult.errors),
          HttpStatus.BAD_REQUEST,
        );
      }

      const shopifyProduct = shopifyProductResult.data?.product;
      if (!shopifyProduct) {
        throw new HttpException(
          'Product not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Transform Shopify data to analysis input format
      const analysisInput = this.productDataTransformerService.transformShopifyProductToAnalysisInput(shopifyProduct);

      // Validate the transformed data
      const validation = this.productDataTransformerService.validateAnalysisInput(analysisInput);
      if (!validation.isValid) {
        this.logger.warn('Analysis input validation failed:', validation.errors);
        // Continue with analysis even if validation has minor issues
      }

      // Perform parallel SEO analysis
      const result = await this.parallelSeoAnalysisService.analyzeProductSeo(analysisInput);

      return {
        success: true,
        data: result,
        message: 'Product SEO analysis completed successfully',
      };
    } catch (error) {
      this.logger.error('Error in Shopify product SEO analysis', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to complete product SEO analysis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('analyze/products/batch')
  @ApiOperation({
    summary: 'Fetch multiple Shopify products and perform batch SEO analysis',
    description: 'Automatically fetches multiple products from Shopify and performs batch SEO analysis using AI',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiBody({
    type: ScanProductsDto,
    description: 'Product IDs to analyze',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch product SEO analysis completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Shop parameter or product IDs are required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async analyzeShopifyProductsBatch(
    @Body() scanProductsDto: ScanProductsDto,
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<{ results: ParallelAnalysisResultDto[]; summary: any }>> {
    try {
      if (!shop) {
        throw new HttpException(
          'Shop parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!scanProductsDto.productIds || scanProductsDto.productIds.length === 0) {
        throw new HttpException(
          'Product IDs are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get shop authentication
      const shopEntity = await this.shopRepository.findOne({
        where: { shopDomain: shop },
      });

      if (!shopEntity) {
        throw new HttpException(
          'Shop not found or not authenticated',
          HttpStatus.NOT_FOUND,
        );
      }

      // Fetch products from Shopify
      const shopifyProducts: any[] = [];
      for (const productId of scanProductsDto.productIds) {
        try {
          const result = await this.shopifyService.fetchProductById(
            shop,
            shopEntity.accessToken,
            productId,
          );
          
          if (result.data?.product) {
            shopifyProducts.push(result.data.product);
          } else {
            this.logger.warn(`Product ${productId} not found or has errors`);
          }
        } catch (error) {
          this.logger.warn(`Failed to fetch product ${productId}:`, error);
        }
      }

      if (shopifyProducts.length === 0) {
        throw new HttpException(
          'No valid products found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Transform products to analysis input format
      const analysisInputs = this.productDataTransformerService.transformMultipleProducts(shopifyProducts);

      // Perform batch parallel SEO analysis
      const results = await this.parallelSeoAnalysisService.analyzeMultipleProducts(analysisInputs);
      const summary = this.parallelSeoAnalysisService.getAnalysisSummary(results);

      return {
        success: true,
        data: { results, summary },
        message: `Batch SEO analysis completed successfully for ${results.length} products`,
      };
    } catch (error) {
      this.logger.error('Error in batch Shopify product SEO analysis', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to complete batch product SEO analysis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
