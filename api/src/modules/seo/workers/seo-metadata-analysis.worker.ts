import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import {
  ProductSeoAnalysisInputDto,
  AnalysisResultDto,
  SuggestionDto,
  SuggestionType,
  SuggestionPriority,
} from '../../../dto/seo.dto';
import { SeoMetadataSchema, type SeoMetadataAnalysis } from '../prompts/schemas';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';
import { TASK_PROMPTS } from '../prompts/task-prompts';

@Injectable()
export class SeoMetadataAnalysisWorker {
  private readonly logger = new Logger(SeoMetadataAnalysisWorker.name);
  private readonly llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-3.5-turbo',
      temperature: 0.3,
    });
  }

  async analyzeSeoMetadata(input: ProductSeoAnalysisInputDto): Promise<AnalysisResultDto> {
    try {
      // Create structured output chain
      const chain = (this.llm as any).withStructuredOutput(SeoMetadataSchema);

      // Create prompt template with system and task prompts
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', SYSTEM_PROMPTS.SEO_EXPERT + '\n\n' + SYSTEM_PROMPTS.METADATA_SPECIALIST],
        ['human', TASK_PROMPTS.SEO_METADATA_ANALYSIS],
      ]);

      // Format the prompt with input data
      const formattedPrompt = await prompt.format({
        productId: input.productId,
        productSeoTitle: input.productSeoTitle,
        productSeoDescription: input.productSeoDescription,
      });

      // Get structured response from LLM
      const analysisResult: SeoMetadataAnalysis = await chain.invoke(formattedPrompt);

      // Transform suggestions to include proper IDs
      const suggestions = analysisResult.suggestions.map((suggestion, index) => ({
        id: `${suggestion.type}-${input.productId}-${index}`,
        type: this.mapSuggestionType(suggestion.type),
        priority: suggestion.priority as SuggestionPriority,
        field: suggestion.field,
        current: suggestion.current,
        suggested: suggestion.suggested,
        reason: suggestion.reason,
        impact: suggestion.impact,
      }));

      return {
        score: Math.min(100, Math.max(0, analysisResult.score)),
        suggestions,
        analysisType: 'seo-metadata',
        feedback: analysisResult.feedback,
      };
    } catch (error) {
      this.logger.error('Error in SEO metadata analysis', error);
      return this.getFallbackAnalysis(input);
    }
  }


  private mapSuggestionType(type: string): SuggestionType {
    switch (type.toLowerCase()) {
      case 'title':
        return SuggestionType.TITLE;
      case 'meta-description':
        return SuggestionType.META_DESCRIPTION;
      default:
        return SuggestionType.META_DESCRIPTION;
    }
  }

  private getFallbackAnalysis(input: ProductSeoAnalysisInputDto): AnalysisResultDto {
    const suggestions: SuggestionDto[] = [];
    let score = 75; // Base score

    // SEO Title analysis
    if (!input.productSeoTitle || input.productSeoTitle.length === 0) {
      suggestions.push({
        id: `seo-title-${input.productId}-missing`,
        type: SuggestionType.TITLE,
        priority: SuggestionPriority.HIGH,
        field: 'seo.title',
        current: input.productSeoTitle || '',
        suggested: 'Premium Quality Product - Best Price | Brand Name',
        reason: 'Missing SEO title reduces search engine visibility',
        impact: 'SEO titles are crucial for search rankings and click-through rates',
      });
      score -= 25;
    } else if (input.productSeoTitle.length < 30 || input.productSeoTitle.length > 60) {
      suggestions.push({
        id: `seo-title-${input.productId}-length`,
        type: SuggestionType.TITLE,
        priority: SuggestionPriority.HIGH,
        field: 'seo.title',
        current: input.productSeoTitle,
        suggested: input.productSeoTitle.length < 30 
          ? `${input.productSeoTitle} - Premium Quality | Best Price`
          : input.productSeoTitle.substring(0, 57) + '...',
        reason: 'SEO title length should be between 30-60 characters for optimal display',
        impact: 'Proper title length improves search result appearance and CTR',
      });
      score -= 15;
    }

    // Meta Description analysis
    if (!input.productSeoDescription || input.productSeoDescription.length === 0) {
      suggestions.push({
        id: `meta-desc-${input.productId}-missing`,
        type: SuggestionType.META_DESCRIPTION,
        priority: SuggestionPriority.HIGH,
        field: 'seo.description',
        current: input.productSeoDescription || '',
        suggested: 'Discover premium quality products with excellent features. Shop now for the best deals and fast shipping. Perfect for your needs.',
        reason: 'Missing meta description reduces search engine visibility',
        impact: 'Meta descriptions can improve click-through rates by up to 30%',
      });
      score -= 20;
    } else if (input.productSeoDescription.length < 120 || input.productSeoDescription.length > 160) {
      suggestions.push({
        id: `meta-desc-${input.productId}-length`,
        type: SuggestionType.META_DESCRIPTION,
        priority: SuggestionPriority.MEDIUM,
        field: 'seo.description',
        current: input.productSeoDescription,
        suggested: input.productSeoDescription.length < 120
          ? `${input.productSeoDescription} Shop now for the best deals and fast shipping.`
          : input.productSeoDescription.substring(0, 157) + '...',
        reason: 'Meta description should be 120-160 characters for optimal display',
        impact: 'Proper meta description length improves search result appearance',
      });
      score -= 10;
    }

    return {
      score,
      suggestions,
      analysisType: 'seo-metadata',
      feedback: 'Fallback analysis: Basic SEO metadata checks completed. Focus on optimizing title and description lengths.',
    };
  }
}