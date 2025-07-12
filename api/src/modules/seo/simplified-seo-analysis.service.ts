import { Injectable, Logger } from '@nestjs/common';
import { ParallelSeoAnalysisService } from './parallel-seo-analysis.service';
import { ProductDataTransformerService } from './product-data-transformer.service';
import { ParallelAnalysisInputDto } from '../../dto/seo.dto';

export interface SimplifiedSuggestion {
  id: string;
  type: string;
  priority: string;
  score: number;
  field: string;
  current: string;
  suggested: string;
  reason: string;
  impact: string;
}

export interface SimplifiedProductAnalysis {
  productId: string;
  title: string;
  handle: string;
  suggestions: SimplifiedSuggestion[];
}

@Injectable()
export class SimplifiedSeoAnalysisService {
  private readonly logger = new Logger(SimplifiedSeoAnalysisService.name);

  constructor(
    private readonly parallelSeoService: ParallelSeoAnalysisService,
    private readonly transformerService: ProductDataTransformerService,
  ) {}

  async analyzeProductsSimplified(shopifyProducts: any[]): Promise<SimplifiedProductAnalysis[]> {
    this.logger.log(`Starting simplified analysis for ${shopifyProducts.length} products`);

    // Transform products for analysis
    const transformedProducts = shopifyProducts.map(product => 
      this.transformerService.transformShopifyProductToAnalysisInput(product)
    );

    // Run parallel analysis
    const analysisResults = await this.parallelSeoService.analyzeMultipleProducts(transformedProducts);

    // Transform to simplified format
    const simplifiedResults = analysisResults.map((result, index) => {
      const originalProduct = shopifyProducts[index];
      
      // Add score to each suggestion and filter/transform them
      const suggestions: SimplifiedSuggestion[] = result.allSuggestions.map(suggestion => ({
        id: suggestion.id,
        type: suggestion.type,
        priority: suggestion.priority,
        score: this.calculateSuggestionScore(suggestion.priority, suggestion.type),
        field: suggestion.field,
        current: suggestion.current,
        suggested: suggestion.suggested,
        reason: suggestion.reason,
        impact: suggestion.impact || 'Improves SEO performance',
      }));

      return {
        productId: result.productId,
        title: originalProduct.title,
        handle: this.generateHandle(originalProduct.title),
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

  async analyzeSingleProductSimplified(shopifyProduct: any): Promise<SimplifiedProductAnalysis> {
    const results = await this.analyzeProductsSimplified([shopifyProduct]);
    return results[0];
  }
}