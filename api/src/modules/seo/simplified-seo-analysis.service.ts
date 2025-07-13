import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParallelSeoAnalysisService } from './parallel-seo-analysis.service';
import { ProductDataTransformerService } from './product-data-transformer.service';
import { ParallelAnalysisInputDto } from '../../dto/seo.dto';
import { Shop } from '../../entities/shop.entity';
import { BrandMapping, DEFAULT_BRAND_MAPPING } from '../../interfaces/brand.interface';

export interface SimplifiedSuggestion {
  id: string;
  type: string;
  priority: string;
  score: number; // This will be calculated based on priority/type for suggestion ranking
  field: string;
  current: string;
  suggested: string;
  reason: string;
  impact: string;
  imageUrl?: string;
}

export interface SimplifiedProductAnalysis {
  productId: string;
  title: string;
  handle: string;
  overallScore?: number;
  fieldScores?: Array<{ field: string; score: number; description: string }>;
  suggestions: SimplifiedSuggestion[];
}

@Injectable()
export class SimplifiedSeoAnalysisService {
  private readonly logger = new Logger(SimplifiedSeoAnalysisService.name);

  constructor(
    private readonly parallelSeoService: ParallelSeoAnalysisService,
    private readonly transformerService: ProductDataTransformerService,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  async analyzeProductsSimplified(shopifyProducts: any[], shopDomain?: string): Promise<SimplifiedProductAnalysis[]> {
    this.logger.log(`Starting simplified analysis for ${shopifyProducts.length} products`);

    // Get brand mapping for the shop
    const brandMapping = await this.getBrandMapping(shopDomain);

    // Transform products for analysis
    const transformedProducts = shopifyProducts.map(product => {
      const transformed = this.transformerService.transformShopifyProductToAnalysisInput(product);
      // Add brand mapping to the transformed input
      return {
        ...transformed,
        brandMapping,
      };
    });

    // Run parallel analysis
    const analysisResults = await this.parallelSeoService.analyzeMultipleProducts(transformedProducts);

    // Transform to simplified format
    const simplifiedResults = analysisResults.map((result, index) => {
      const originalProduct = shopifyProducts[index];
      
      // Collect all individual field scores from all analyses
      const allFieldScores: Array<{ field: string; score: number; description: string }> = [];
      
      // Extract field scores from each analysis type
      if (result.productContentAnalysis.fieldScores) {
        allFieldScores.push(...result.productContentAnalysis.fieldScores);
      }
      if (result.seoMetadataAnalysis.fieldScores) {
        allFieldScores.push(...result.seoMetadataAnalysis.fieldScores);
      }
      if (result.imageAnalysis.fieldScores) {
        allFieldScores.push(...result.imageAnalysis.fieldScores);
      }
      if (result.metafieldsAnalysis.fieldScores) {
        allFieldScores.push(...result.metafieldsAnalysis.fieldScores);
      }
      
      // Map suggestion scores to actual LLM field scores
      const suggestions: SimplifiedSuggestion[] = result.allSuggestions.map((suggestion, index) => {
        // Find the corresponding field score for this suggestion
        const fieldScore = this.findFieldScoreForSuggestion(suggestion, allFieldScores);
        
        console.log("FIELD SCORE COMING IN : ", fieldScore)
        
        // Generate unique ID by combining productId, type, field, and index
        const uniqueId = `${result.productId}-${suggestion.type}-${suggestion.field.replace(/\s+/g, '-').toLowerCase()}-${index}`;
        
        return {
          id: uniqueId,
          type: suggestion.type,
          priority: suggestion.priority,
          score: fieldScore || this.calculateSuggestionScore(suggestion.priority, suggestion.type), // Use LLM field score or fallback
          field: suggestion.field,
          current: suggestion.current,
          suggested: suggestion.suggested,
          reason: suggestion.reason,
          impact: suggestion.impact || 'Improves SEO performance',
          imageUrl: suggestion.imageUrl,
        };
      });

      return {
        productId: result.productId,
        title: originalProduct.title,
        handle: this.generateHandle(originalProduct.title),
        overallScore: result.overallScore,
        fieldScores: allFieldScores,
        suggestions,
      };
    });

    this.logger.log(`Completed simplified analysis for ${simplifiedResults.length} products`);
    return simplifiedResults;
  }

  private calculateSuggestionScore(priority: string, type: string): number {
    // Base scores by priority
    const priorityScores = {
      'high': 20,
      'medium': 15,
      'low': 10,
    };

    // Type multipliers
    const typeMultipliers = {
      'title': 1.0,
      'meta-description': 0.9,
      'description': 0.8,
      'alt-text': 0.7,
      'structured-data': 0.8,
      'missing-metafields': 0.9,
      'duplicate-content': 0.6,
      'schema-markup': 0.8,
      'rich-snippets': 0.7,
      'brand-category-info': 0.6,
      'technical-seo': 0.9,
      'e-commerce-optimizations': 0.8,
      'keywords': 0.8,
      'metafield': 0.7,
      'call-to-action': 0.8,
    };

    const baseScore = priorityScores[priority] || 10;
    const multiplier = typeMultipliers[type] || 0.8;
    
    return Math.round(baseScore * multiplier);
  }

  private generateHandle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  async analyzeSingleProductSimplified(shopifyProduct: any, shopDomain?: string): Promise<SimplifiedProductAnalysis> {
    const results = await this.analyzeProductsSimplified([shopifyProduct], shopDomain);
    return results[0];
  }

  private async getBrandMapping(shopDomain?: string): Promise<BrandMapping> {
    if (!shopDomain) {
      this.logger.warn('No shop domain provided, using default brand mapping');
      return DEFAULT_BRAND_MAPPING;
    }

    try {
      const shop = await this.shopRepository.findOne({
        where: { shopDomain },
      });

      if (shop?.brandMapping) {
        this.logger.log(`Using brand mapping for shop: ${shopDomain}`);
        return shop.brandMapping as BrandMapping;
      } else {
        this.logger.log(`No brand mapping found for shop: ${shopDomain}, using default`);
        return DEFAULT_BRAND_MAPPING;
      }
    } catch (error) {
      this.logger.error(`Error fetching brand mapping for shop: ${shopDomain}`, error);
      return DEFAULT_BRAND_MAPPING;
    }
  }

  private findFieldScoreForSuggestion(
    suggestion: any,
    allFieldScores: Array<{ field: string; score: number; description: string }>
  ): number | null {
    // Map suggestion fields to field score names
    const fieldMapping: { [key: string]: string[] } = {
      'title': ['title', 'Product Title'],
      'description': ['description', 'Product Description'],
      'SEO Title': ['SEO Title', 'seo.title'],
      'SEO Description': ['SEO Description', 'seo.description'],
      'images.altText': ['alt text', 'Image Alt Text', 'accessibility compliance'],
      'Meta Value': ['Meta Value', 'metafield'],
    };

    // Get possible field names for this suggestion
    const possibleFieldNames = fieldMapping[suggestion.field] || [suggestion.field];
    
    // Find matching field score
    for (const fieldName of possibleFieldNames) {
      const fieldScore = allFieldScores.find(fs =>
        fs.field.toLowerCase().includes(fieldName.toLowerCase()) ||
        fieldName.toLowerCase().includes(fs.field.toLowerCase())
      );
      
      if (fieldScore) {
        return fieldScore.score;
      }
    }

    // If no exact match, try to match by suggestion type
    const typeMapping: { [key: string]: string[] } = {
      'title': ['title'],
      'description': ['description'],
      'meta-description': ['SEO Description', 'Meta Value'],
      'alt-text': ['alt text', 'accessibility compliance', 'image SEO'],
    };

    const possibleTypeFields = typeMapping[suggestion.type] || [];
    for (const fieldName of possibleTypeFields) {
      const fieldScore = allFieldScores.find(fs =>
        fs.field.toLowerCase().includes(fieldName.toLowerCase())
      );
      
      if (fieldScore) {
        return fieldScore.score;
      }
    }

    return null; // No matching field score found
  }
}