import { Injectable, Logger } from '@nestjs/common';
import {
  ParallelAnalysisInputDto,
  ParallelAnalysisResultDto,
  AnalysisResultDto,
  SuggestionDto,
} from '../../dto/seo.dto';
import { ProductContentAnalysisWorker } from './workers/product-content-analysis.worker';
import { SeoMetadataAnalysisWorker } from './workers/seo-metadata-analysis.worker';
import { ImageAnalysisWorker } from './workers/image-analysis.worker';
import { MetafieldsAnalysisWorker } from './workers/metafields-analysis.worker';

@Injectable()
export class ParallelSeoAnalysisService {
  private readonly logger = new Logger(ParallelSeoAnalysisService.name);

  constructor(
    private readonly productContentWorker: ProductContentAnalysisWorker,
    private readonly seoMetadataWorker: SeoMetadataAnalysisWorker,
    private readonly imageWorker: ImageAnalysisWorker,
    private readonly metafieldsWorker: MetafieldsAnalysisWorker,
  ) {}

  async analyzeProductSeo(input: ParallelAnalysisInputDto): Promise<ParallelAnalysisResultDto> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting parallel SEO analysis for product: ${input.productContent.productId}`);

      // Execute all analyses concurrently using Promise.allSettled for better error handling
      const [
        productContentResult,
        seoMetadataResult,
        imageResult,
        metafieldsResult,
      ] = await Promise.allSettled([
        this.productContentWorker.analyzeProductContent(input.productContent, input.brandMapping),
        this.seoMetadataWorker.analyzeSeoMetadata(input.seoMetadata, input.brandMapping),
        this.imageWorker.analyzeImageAltText(input.images, input.brandMapping),
        this.metafieldsWorker.analyzeMetafields(input.metafields, input.brandMapping),
      ]);

      // Extract results and handle any failures
      const productContentAnalysis = this.extractResult(productContentResult, 'product-content');
      const seoMetadataAnalysis = this.extractResult(seoMetadataResult, 'seo-metadata');
      const imageAnalysis = this.extractResult(imageResult, 'image-analysis');
      const metafieldsAnalysis = this.extractResult(metafieldsResult, 'metafields-analysis');

      // Calculate overall score (weighted average)
      const overallScore = this.calculateOverallScore({
        productContentAnalysis,
        seoMetadataAnalysis,
        imageAnalysis,
        metafieldsAnalysis,
      });

      // Combine all suggestions
      const allSuggestions = this.combineAllSuggestions({
        productContentAnalysis,
        seoMetadataAnalysis,
        imageAnalysis,
        metafieldsAnalysis,
      });

      const executionTime = Date.now() - startTime;

      this.logger.log(`Completed parallel SEO analysis for product: ${input.productContent.productId} in ${executionTime}ms`);

      return {
        productId: input.productContent.productId,
        overallScore,
        productContentAnalysis,
        seoMetadataAnalysis,
        imageAnalysis,
        metafieldsAnalysis,
        allSuggestions,
        executionTime,
      };

    } catch (error) {
      this.logger.error('Error in parallel SEO analysis', error);
      throw new Error(`Failed to complete SEO analysis: ${error.message}`);
    }
  }

  private extractResult(
    result: PromiseSettledResult<AnalysisResultDto>,
    analysisType: string,
  ): AnalysisResultDto {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      this.logger.warn(`${analysisType} analysis failed:`, result.reason);
      // Return fallback result
      return {
        score: 50, // Neutral score for failed analysis
        suggestions: [],
        analysisType,
        feedback: `${analysisType} analysis failed. Please try again or contact support.`,
      };
    }
  }

  private calculateOverallScore(analyses: {
    productContentAnalysis: AnalysisResultDto;
    seoMetadataAnalysis: AnalysisResultDto;
    imageAnalysis: AnalysisResultDto;
    metafieldsAnalysis: AnalysisResultDto;
  }): number {
    // Collect all individual field scores from all analyses
    const allFieldScores: number[] = [];

    // Extract field scores from each analysis
    if (analyses.productContentAnalysis.fieldScores) {
      allFieldScores.push(...analyses.productContentAnalysis.fieldScores.map(f => f.score));
    }
    if (analyses.seoMetadataAnalysis.fieldScores) {
      allFieldScores.push(...analyses.seoMetadataAnalysis.fieldScores.map(f => f.score));
    }
    if (analyses.imageAnalysis.fieldScores) {
      allFieldScores.push(...analyses.imageAnalysis.fieldScores.map(f => f.score));
    }
    if (analyses.metafieldsAnalysis.fieldScores) {
      allFieldScores.push(...analyses.metafieldsAnalysis.fieldScores.map(f => f.score));
    }

    // If we have individual field scores, calculate weighted average based on field importance
    if (allFieldScores.length > 0) {
      // Define field weights based on SEO importance
      const fieldWeights = {
        'Product Title': 0.15,
        'Product Description': 0.10,
        'SEO Title': 0.20,
        'Meta Description': 0.15,
        'Image 1 Alt Text': 0.08,
        'Image 2 Alt Text': 0.05,
        'Image 3 Alt Text': 0.03,
        'Overall Image Quality': 0.09,
        'SEO Metafields': 0.08,
        'Structured Data': 0.04,
        'Schema Markup': 0.03,
      };

      let weightedSum = 0;
      let totalWeight = 0;

      // Calculate weighted score based on field names
      analyses.productContentAnalysis.fieldScores?.forEach(field => {
        const weight = fieldWeights[field.field] || 0.05; // Default weight for unknown fields
        weightedSum += field.score * weight;
        totalWeight += weight;
      });

      analyses.seoMetadataAnalysis.fieldScores?.forEach(field => {
        const weight = fieldWeights[field.field] || 0.05;
        weightedSum += field.score * weight;
        totalWeight += weight;
      });

      analyses.imageAnalysis.fieldScores?.forEach(field => {
        const weight = fieldWeights[field.field] || 0.02; // Lower weight for additional images
        weightedSum += field.score * weight;
        totalWeight += weight;
      });

      analyses.metafieldsAnalysis.fieldScores?.forEach(field => {
        const weight = fieldWeights[field.field] || 0.03;
        weightedSum += field.score * weight;
        totalWeight += weight;
      });

      return Math.round(weightedSum / totalWeight);
    }

    // Fallback to original weighted scoring system if no field scores available
    const weights = {
      productContent: 0.3,    // 30% - Product title and description are crucial
      seoMetadata: 0.35,      // 35% - SEO title and meta description are most important
      images: 0.2,            // 20% - Image alt text for accessibility and SEO
      metafields: 0.15,       // 15% - Additional SEO enhancements
    };

    const weightedScore =
      (analyses.productContentAnalysis.score * weights.productContent) +
      (analyses.seoMetadataAnalysis.score * weights.seoMetadata) +
      (analyses.imageAnalysis.score * weights.images) +
      (analyses.metafieldsAnalysis.score * weights.metafields);

    return Math.round(weightedScore);
  }

  private combineAllSuggestions(analyses: {
    productContentAnalysis: AnalysisResultDto;
    seoMetadataAnalysis: AnalysisResultDto;
    imageAnalysis: AnalysisResultDto;
    metafieldsAnalysis: AnalysisResultDto;
  }): SuggestionDto[] {
    const allSuggestions: SuggestionDto[] = [
      ...analyses.productContentAnalysis.suggestions,
      ...analyses.seoMetadataAnalysis.suggestions,
      ...analyses.imageAnalysis.suggestions,
      ...analyses.metafieldsAnalysis.suggestions,
    ];

    // Sort suggestions by priority (high -> medium -> low)
    const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
    
    return allSuggestions.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by type for consistency
      return a.type.localeCompare(b.type);
    });
  }

  async analyzeMultipleProducts(inputs: ParallelAnalysisInputDto[]): Promise<ParallelAnalysisResultDto[]> {
    this.logger.log(`Starting batch analysis for ${inputs.length} products`);
    
    try {
      // Process products in parallel (but limit concurrency to avoid overwhelming the system)
      const batchSize = 3; // Process 3 products at a time
      const results: ParallelAnalysisResultDto[] = [];
      
      for (let i = 0; i < inputs.length; i += batchSize) {
        const batch = inputs.slice(i, i + batchSize);
        const batchPromises = batch.map(input => this.analyzeProductSeo(input));
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            this.logger.error(`Failed to analyze product ${batch[index].productContent.productId}:`, result.reason);
            // Add a fallback result for failed analysis
            results.push(this.createFallbackResult(batch[index].productContent.productId));
          }
        });
      }
      
      this.logger.log(`Completed batch analysis for ${results.length} products`);
      return results;
      
    } catch (error) {
      this.logger.error('Error in batch SEO analysis', error);
      throw new Error(`Failed to complete batch SEO analysis: ${error.message}`);
    }
  }

  private createFallbackResult(productId: string): ParallelAnalysisResultDto {
    const fallbackAnalysis: AnalysisResultDto = {
      score: 50,
      suggestions: [],
      analysisType: 'fallback',
      feedback: 'Analysis failed. Please try again.',
    };

    return {
      productId,
      overallScore: 50,
      productContentAnalysis: fallbackAnalysis,
      seoMetadataAnalysis: fallbackAnalysis,
      imageAnalysis: fallbackAnalysis,
      metafieldsAnalysis: fallbackAnalysis,
      allSuggestions: [],
      executionTime: 0,
    };
  }

  // Utility method to get analysis summary
  getAnalysisSummary(results: ParallelAnalysisResultDto[]): {
    averageScore: number;
    totalSuggestions: number;
    highPrioritySuggestions: number;
    analysisTime: number;
  } {
    const totalScore = results.reduce((sum, result) => sum + result.overallScore, 0);
    const totalSuggestions = results.reduce((sum, result) => sum + result.allSuggestions.length, 0);
    const highPrioritySuggestions = results.reduce(
      (sum, result) => sum + result.allSuggestions.filter(s => s.priority === 'high').length,
      0
    );
    const totalTime = results.reduce((sum, result) => sum + result.executionTime, 0);

    return {
      averageScore: Math.round(totalScore / results.length),
      totalSuggestions,
      highPrioritySuggestions,
      analysisTime: totalTime,
    };
  }
}