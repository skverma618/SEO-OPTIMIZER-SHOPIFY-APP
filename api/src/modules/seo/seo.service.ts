import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../../entities/shop.entity';
import { ScanHistory } from '../../entities/scan-history.entity';
import { ShopifyService } from '../shopify/shopify.service';
import { ApplySuggestionDto } from '../../dto/seo.dto';
import { SimplifiedSeoAnalysisService } from './simplified-seo-analysis.service';

@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);

  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    @InjectRepository(ScanHistory)
    private scanHistoryRepository: Repository<ScanHistory>,
    private shopifyService: ShopifyService,
    private simplifiedSeoAnalysisService: SimplifiedSeoAnalysisService,
  ) {}

  async scanEntireStore(shopDomain: string) {
    try {
      const shop = await this.shopRepository.findOne({
        where: { shopDomain },
      });

      if (!shop) {
        throw new Error('Shop not found');
      }

      // Fetch all products from Shopify
      const allProducts = await this.fetchAllProducts(shopDomain, shop.accessToken);

      // Analyze products for SEO issues
      const scanResults = await this.analyzeProductsForSEO(allProducts, shopDomain);

      // Save scan history
      await this.saveScanHistory(shopDomain, 'store', scanResults);

      return {
        scanId: this.generateScanId(),
        totalProducts: allProducts.length,
        productsWithIssues: scanResults.filter(result => result.suggestions.length > 0).length,
        results: scanResults,
      };
    } catch (error) {
      this.logger.error('Error scanning entire store', error);
      throw error;
    }
  }

  async scanSelectedProducts(shopDomain: string, productIds: string[]) {
    try {
      const shop = await this.shopRepository.findOne({
        where: { shopDomain },
      });

      if (!shop) {
        throw new Error('Shop not found');
      }

      // Fetch selected products from Shopify
      const products = await this.fetchProductsByIds(shopDomain, shop.accessToken, productIds);

      // Analyze products for SEO issues
      const scanResults = await this.analyzeProductsForSEO(products, shopDomain);

      // Save scan history
      await this.saveScanHistory(shopDomain, 'products', scanResults);

      return {
        scanId: this.generateScanId(),
        totalProducts: products.length,
        productsWithIssues: scanResults.filter(result => result.suggestions.length > 0).length,
        results: scanResults,
      };
    } catch (error) {
      this.logger.error('Error scanning selected products', error);
      throw error;
    }
  }

  async applySingleSuggestion(shopDomain: string, suggestion: ApplySuggestionDto) {
    try {
      const shop = await this.shopRepository.findOne({
        where: { shopDomain },
      });

      if (!shop) {
        throw new Error('Shop not found');
      }

      // Apply the suggestion based on field type
      const result = await this.applySuggestionToShopify(
        shopDomain,
        shop.accessToken,
        suggestion,
      );

      return {
        success: true,
        appliedSuggestion: suggestion,
        shopifyResponse: result,
      };
    } catch (error) {
      this.logger.error('Error applying single suggestion', error);
      throw error;
    }
  }

  async applyBulkSuggestions(shopDomain: string, suggestions: ApplySuggestionDto[]) {
    try {
      const shop = await this.shopRepository.findOne({
        where: { shopDomain },
      });

      if (!shop) {
        throw new Error('Shop not found');
      }

      const results: Array<{ suggestion: ApplySuggestionDto; result: any; success: boolean }> = [];
      const errors: Array<{ suggestion: ApplySuggestionDto; error: string; success: boolean }> = [];

      // Apply suggestions one by one (could be optimized with batch operations)
      for (const suggestion of suggestions) {
        try {
          const result = await this.applySuggestionToShopify(
            shopDomain,
            shop.accessToken,
            suggestion,
          );
          results.push({ suggestion, result, success: true });
        } catch (error) {
          errors.push({ suggestion, error: error.message, success: false });
        }
      }

      return {
        totalSuggestions: suggestions.length,
        successfulApplications: results.length,
        failedApplications: errors.length,
        results,
        errors,
      };
    } catch (error) {
      this.logger.error('Error applying bulk suggestions', error);
      throw error;
    }
  }

  private async fetchAllProducts(shopDomain: string, accessToken: string) {
    // TODO: Implement pagination to fetch all products
    // This is a simplified version - in production, implement proper pagination
    const result = await this.shopifyService.fetchProducts(shopDomain, accessToken, 250);
    return result.data?.products?.edges?.map((edge: any) => edge.node) || [];
  }

  private async fetchProductsByIds(shopDomain: string, accessToken: string, productIds: string[]) {
    const products: any[] = [];
    
    // Fetch each product individually
    for (const productId of productIds) {
      try {
        const result = await this.shopifyService.fetchProductById(shopDomain, accessToken, productId);
        if (result.data?.product) {
          products.push(result.data.product);
        }
      } catch (error) {
        this.logger.warn(`Failed to fetch product ${productId}`, error);
      }
    }

    return products;
  }

  private async analyzeProductsForSEO(products: any[], shopDomain?: string) {
    try {
      this.logger.log(`Starting SEO analysis for ${products.length} products`);
      
      // Use the SimplifiedSeoAnalysisService to analyze products with LLM
      const analysisResults = await this.simplifiedSeoAnalysisService.analyzeProductsSimplified(products, shopDomain);
      
      this.logger.log(`Completed SEO analysis for ${products.length} products`);
      return analysisResults;
    } catch (error) {
      this.logger.error('Error in SEO analysis, falling back to mock suggestions', error);
      
      // Fallback to mock suggestions if LLM analysis fails
      return products.map(product => ({
        productId: product.id,
        title: product.title,
        handle: product.handle,
        suggestions: this.generateMockSuggestions(product),
      }));
    }
  }

  private generateMockSuggestions(product: any) {
    const suggestions: any[] = [];

    // Mock title optimization
    if (!product.seo?.title || product.seo.title.length < 30) {
      suggestions.push({
        id: `title-${product.id}`,
        type: 'title',
        priority: 'high',
        field: 'seo.title',
        current: product.seo?.title || product.title,
        suggested: `${product.title} - Premium Quality | Best Price`,
        reason: 'SEO title should be 30-60 characters and include target keywords',
        impact: 'Could improve search ranking and click-through rates',
      });
    }

    // Mock meta description
    if (!product.seo?.description) {
      suggestions.push({
        id: `meta-desc-${product.id}`,
        type: 'meta-description',
        priority: 'high',
        field: 'seo.description',
        current: '',
        suggested: `Discover ${product.title} with premium features and quality. Shop now for the best deals and fast shipping.`,
        reason: 'Missing meta description reduces search engine visibility',
        impact: 'Meta descriptions can improve click-through rates by up to 30%',
      });
    }

    // Mock image alt text
    if (product.images?.edges?.some((edge: any) => !edge.node.altText)) {
      suggestions.push({
        id: `alt-text-${product.id}`,
        type: 'alt-text',
        priority: 'medium',
        field: 'images.altText',
        current: '',
        suggested: `${product.title} product image showing main features`,
        reason: 'Missing alt text hurts accessibility and SEO',
        impact: 'Improves image search visibility and accessibility compliance',
      });
    }

    return suggestions;
  }

  private async applySuggestionToShopify(
    shopDomain: string,
    accessToken: string,
    suggestion: ApplySuggestionDto,
  ) {
    // TODO: Implement actual Shopify API calls based on suggestion type
    switch (suggestion.field) {
      case 'seo.title':
      case 'seo.description':
        return await this.shopifyService.updateProduct(
          shopDomain,
          accessToken,
          suggestion.productId,
          {
            seo: {
              [suggestion.field.split('.')[1]]: suggestion.value,
            },
          },
        );

      case 'images.altText':
        // TODO: Implement image alt text update
        // This would require the image ID and use updateProductImage
        return { success: true, message: 'Alt text update not implemented yet' };

      default:
        throw new Error(`Unsupported suggestion field: ${suggestion.field}`);
    }
  }

  private async saveScanHistory(shopDomain: string, scanType: string, results: any) {
    try {
      const scanHistory = this.scanHistoryRepository.create({
        shopDomain,
        scanType,
        scanResults: results,
        totalProducts: results.length,
        productsWithIssues: results.filter((r: any) => r.suggestions.length > 0).length,
      });

      await this.scanHistoryRepository.save(scanHistory);
    } catch (error) {
      this.logger.error('Error saving scan history', error);
      // Don't throw error here as it's not critical for the main operation
    }
  }

  private generateScanId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
