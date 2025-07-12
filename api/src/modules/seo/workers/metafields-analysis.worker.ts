import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import {
  ProductMetaFieldAnalysisInputDto,
  AnalysisResultDto,
  SuggestionDto,
  SuggestionType,
  SuggestionPriority,
} from '../../../dto/seo.dto';
import { MetafieldsAnalysisSchema } from '../prompts/schemas';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';
import { TASK_PROMPTS } from '../prompts/task-prompts';

@Injectable()
export class MetafieldsAnalysisWorker {
  private readonly logger = new Logger(MetafieldsAnalysisWorker.name);
  private readonly llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-3.5-turbo',
      temperature: 0.3,
    });
  }

  async analyzeMetafields(inputs: ProductMetaFieldAnalysisInputDto[]): Promise<AnalysisResultDto> {
    try {
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', SYSTEM_PROMPTS.METADATA_SPECIALIST],
        ['human', TASK_PROMPTS.METAFIELDS_ANALYSIS],
      ]);

      const metafieldsData = inputs.map((input, index) =>
        `Metafield ${index + 1}:
        - Product ID: ${input.productId}
        - Meta ID: ${input.productMetaId}
        - Meta Value: "${input.productMetaValue}"
        `
      ).join('\n');

      const structuredLlm = (this.llm as any).withStructuredOutput(MetafieldsAnalysisSchema);
      
      const response = await structuredLlm.invoke(
        await prompt.format({
          metafieldsData,
        })
      );

      // Transform suggestions to include proper IDs and types
      const suggestions = response.suggestions.map((suggestion: any, index: number) => ({
        id: `metafield-${suggestion.metaId || inputs[index]?.productMetaId || index}`,
        type: this.mapSuggestionType(suggestion.type),
        priority: suggestion.priority as SuggestionPriority,
        field: suggestion.field,
        current: suggestion.current,
        suggested: suggestion.suggested,
        reason: suggestion.reason,
        impact: suggestion.impact,
      }));

      return {
        score: Math.min(100, Math.max(0, response.score)),
        suggestions,
        analysisType: 'metafields-analysis',
        feedback: response.feedback,
      };
    } catch (error) {
      this.logger.error('Error in metafields analysis', error);
      return this.getFallbackAnalysis(inputs);
    }
  }

  private mapSuggestionType(type: string): SuggestionType {
    switch (type.toLowerCase()) {
      case 'title':
        return SuggestionType.TITLE;
      case 'description':
        return SuggestionType.DESCRIPTION;
      case 'meta-description':
        return SuggestionType.META_DESCRIPTION;
      default:
        return SuggestionType.META_DESCRIPTION;
    }
  }

  private getFallbackAnalysis(inputs: ProductMetaFieldAnalysisInputDto[]): any {
    const suggestions: SuggestionDto[] = [];
    let score = 85; // Base score for metafields
    let optimizationOpportunities = 0;

    // Group metafields by product for analysis
    const productMetafields = this.groupMetafieldsByProduct(inputs);

    Object.entries(productMetafields).forEach(([productId, metafields]) => {
      const hasGlobalTitleTag = metafields.some(m => 
        m.productMetaValue.includes('title_tag') || 
        this.isLikelyTitleTag(m.productMetaValue)
      );
      
      const hasGlobalDescriptionTag = metafields.some(m => 
        m.productMetaValue.includes('description_tag') || 
        this.isLikelyDescriptionTag(m.productMetaValue)
      );

      // Check for missing essential metafields
      if (!hasGlobalTitleTag) {
        suggestions.push({
          id: `metafield-title-${productId}-missing`,
          type: SuggestionType.TITLE,
          priority: SuggestionPriority.HIGH,
          field: 'global.title_tag',
          current: '',
          suggested: 'Premium Product Title - Brand Name | Category',
          reason: 'Missing title_tag metafield reduces SEO potential',
          impact: 'Title tag metafields can improve search visibility and CTR',
        });
        optimizationOpportunities++;
        score -= 15;
      }

      if (!hasGlobalDescriptionTag) {
        suggestions.push({
          id: `metafield-desc-${productId}-missing`,
          type: SuggestionType.META_DESCRIPTION,
          priority: SuggestionPriority.HIGH,
          field: 'global.description_tag',
          current: '',
          suggested: 'Discover premium quality products with excellent features. Perfect for your needs with fast shipping and great customer service.',
          reason: 'Missing description_tag metafield reduces SEO potential',
          impact: 'Description tag metafields can improve search snippets and CTR',
        });
        optimizationOpportunities++;
        score -= 15;
      }

      // Analyze existing metafields for optimization
      metafields.forEach((metafield) => {
        if (this.isLikelyTitleTag(metafield.productMetaValue)) {
          if (metafield.productMetaValue.length < 30) {
            suggestions.push({
              id: `metafield-title-${metafield.productMetaId}-short`,
              type: SuggestionType.TITLE,
              priority: SuggestionPriority.MEDIUM,
              field: 'global.title_tag',
              current: metafield.productMetaValue,
              suggested: `${metafield.productMetaValue} - Premium Quality | Best Price`,
              reason: 'Title tag metafield is too short for optimal SEO',
              impact: 'Longer, descriptive title tags improve search visibility',
            });
            optimizationOpportunities++;
            score -= 8;
          }
        }

        if (this.isLikelyDescriptionTag(metafield.productMetaValue)) {
          if (metafield.productMetaValue.length < 100) {
            suggestions.push({
              id: `metafield-desc-${metafield.productMetaId}-short`,
              type: SuggestionType.META_DESCRIPTION,
              priority: SuggestionPriority.MEDIUM,
              field: 'global.description_tag',
              current: metafield.productMetaValue,
              suggested: `${metafield.productMetaValue} Shop now for premium quality and fast delivery.`,
              reason: 'Description tag metafield is too brief',
              impact: 'Detailed description tags improve search snippets',
            });
            optimizationOpportunities++;
            score -= 8;
          }
        }
      });
    });

    return {
      score: Math.max(0, score),
      suggestions,
      analysisType: 'metafields-analysis',
      feedback: `Fallback analysis: Analyzed ${inputs.length} metafields across ${Object.keys(productMetafields).length} products. Found ${optimizationOpportunities} optimization opportunities for better SEO performance.`,
    };
  }

  private groupMetafieldsByProduct(inputs: ProductMetaFieldAnalysisInputDto[]): Record<string, ProductMetaFieldAnalysisInputDto[]> {
    return inputs.reduce((acc, metafield) => {
      if (!acc[metafield.productId]) {
        acc[metafield.productId] = [];
      }
      acc[metafield.productId].push(metafield);
      return acc;
    }, {} as Record<string, ProductMetaFieldAnalysisInputDto[]>);
  }

  private isLikelyTitleTag(value: string): boolean {
    return value.length > 10 && value.length < 100 && 
           !value.includes('<') && !value.includes('{') &&
           (value.includes('title') || value.split(' ').length < 15);
  }

  private isLikelyDescriptionTag(value: string): boolean {
    return value.length > 50 && 
           !value.includes('<script') && !value.includes('<style') &&
           (value.includes('description') || value.split(' ').length > 10);
  }
}