import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import {
  ProductAnalysisInputDto,
  AnalysisResultDto,
  SuggestionDto,
  SuggestionType,
  SuggestionPriority,
} from '../../../dto/seo.dto';
import { ProductContentSchema, type ProductContentAnalysis } from '../prompts/schemas';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';
import { TASK_PROMPTS } from '../prompts/task-prompts';

@Injectable()
export class ProductContentAnalysisWorker {
  private readonly logger = new Logger(ProductContentAnalysisWorker.name);
  private readonly llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-3.5-turbo',
      temperature: 0.3,
    });
  }

  async analyzeProductContent(input: ProductAnalysisInputDto): Promise<AnalysisResultDto> {
    try {
      // Create structured output chain
      const chain = (this.llm as any).withStructuredOutput(ProductContentSchema);

      // Create prompt template with system and task prompts
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', SYSTEM_PROMPTS.SEO_EXPERT + '\n\n' + SYSTEM_PROMPTS.CONTENT_ANALYST],
        ['human', TASK_PROMPTS.PRODUCT_CONTENT_ANALYSIS],
      ]);

      // Format the prompt with input data
      const formattedPrompt = await prompt.format({
        productId: input.productId,
        productTitle: input.productTitle,
        productDescription: input.productDescription,
      });

      // Get structured response from LLM
      const analysisResult = await chain.invoke(formattedPrompt);

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
        analysisType: 'product-content',
        feedback: analysisResult.feedback,
      };
    } catch (error) {
      this.logger.error('Error in product content analysis', error);
      return this.getFallbackAnalysis(input);
    }
  }


  private mapSuggestionType(type: string): SuggestionType {
    switch (type.toLowerCase()) {
      case 'title':
        return SuggestionType.TITLE;
      case 'description':
        return SuggestionType.DESCRIPTION;
      default:
        return SuggestionType.DESCRIPTION;
    }
  }

  private getFallbackAnalysis(input: ProductAnalysisInputDto): AnalysisResultDto {
    const suggestions: SuggestionDto[] = [];
    let score = 70; // Base score

    // Basic title analysis
    if (input.productTitle.length < 30) {
      suggestions.push({
        id: `title-${input.productId}-short`,
        type: SuggestionType.TITLE,
        priority: SuggestionPriority.HIGH,
        field: 'title',
        current: input.productTitle,
        suggested: `${input.productTitle} - Premium Quality | Best Price`,
        reason: 'Title is too short for optimal SEO performance',
        impact: 'Longer, descriptive titles can improve search visibility',
      });
      score -= 15;
    }

    // Basic description analysis
    if (input.productDescription.length < 100) {
      suggestions.push({
        id: `description-${input.productId}-short`,
        type: SuggestionType.DESCRIPTION,
        priority: SuggestionPriority.MEDIUM,
        field: 'description',
        current: input.productDescription,
        suggested: `${input.productDescription} Perfect for those seeking quality and value. Order now for fast delivery and excellent customer service.`,
        reason: 'Product description is too brief and lacks compelling details',
        impact: 'Detailed descriptions can improve conversion rates and SEO',
      });
      score -= 10;
    }

    return {
      score,
      suggestions,
      analysisType: 'product-content',
      feedback: 'Fallback analysis: Basic SEO checks completed. Consider optimizing title length and description detail.',
    };
  }
}