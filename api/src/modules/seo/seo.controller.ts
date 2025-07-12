import {
  Controller,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SeoService } from './seo.service';
import { ScanProductsDto, ApplySuggestionDto, ApplyBulkSuggestionsDto } from '../../dto/seo.dto';
import { ApiResponseDto } from '../../dto/common.dto';

@Controller('api/seo')
export class SeoController {
  private readonly logger = new Logger(SeoController.name);

  constructor(private readonly seoService: SeoService) {}

  @Post('scan/store')
  async scanStore(@Query('shop') shop: string): Promise<ApiResponseDto<any>> {
    try {
      if (!shop) {
        throw new HttpException('Shop parameter is required', HttpStatus.BAD_REQUEST);
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
  async scanProducts(
    @Body() scanProductsDto: ScanProductsDto,
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<any>> {
    try {
      if (!shop) {
        throw new HttpException('Shop parameter is required', HttpStatus.BAD_REQUEST);
      }

      if (!scanProductsDto.productIds || scanProductsDto.productIds.length === 0) {
        throw new HttpException('Product IDs are required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.seoService.scanSelectedProducts(shop, scanProductsDto.productIds);

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
  async applySuggestion(
    @Body() applySuggestionDto: ApplySuggestionDto,
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<any>> {
    try {
      if (!shop) {
        throw new HttpException('Shop parameter is required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.seoService.applySingleSuggestion(shop, applySuggestionDto);

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
  async applyBulkSuggestions(
    @Body() applyBulkDto: ApplyBulkSuggestionsDto,
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<any>> {
    try {
      if (!shop) {
        throw new HttpException('Shop parameter is required', HttpStatus.BAD_REQUEST);
      }

      if (!applyBulkDto.suggestions || applyBulkDto.suggestions.length === 0) {
        throw new HttpException('Suggestions are required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.seoService.applyBulkSuggestions(shop, applyBulkDto.suggestions);

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