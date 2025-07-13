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
import { SYSTEM_PROMPTS, createBrandAwareSystemPrompt } from '../prompts/system-prompts';
import { TASK_PROMPTS } from '../prompts/task-prompts';
import { BrandMapping } from '../../../interfaces/brand.interface';

@Injectable()
export class ProductContentAnalysisWorker {
  private readonly logger = new Logger(ProductContentAnalysisWorker.name);
  private readonly llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: this.configService.get<string>('OPENAI_MODEL_NAME') || 'gpt-4o-mini',
      temperature: parseFloat(this.configService.get<string>('OPENAI_TEMPERATURE') || '0.3'),
    });
  }

  async analyzeProductContent(input: ProductAnalysisInputDto, brandMapping?: BrandMapping): Promise<AnalysisResultDto> {
    try {
      // Create structured output chain
      const chain = (this.llm as any).withStructuredOutput(ProductContentSchema);

      // Create brand-aware system prompt
      const baseSystemPrompt = SYSTEM_PROMPTS.SEO_EXPERT + '\n\n' + SYSTEM_PROMPTS.CONTENT_ANALYST;
      const brandAwareSystemPrompt = createBrandAwareSystemPrompt(baseSystemPrompt, brandMapping);

      // Create prompt template with brand-aware system and task prompts
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', brandAwareSystemPrompt],
        ['human', TASK_PROMPTS.PRODUCT_CONTENT_ANALYSIS],
      ]);

      // Format the prompt with input data
      const formattedPrompt = await prompt.format({
        productId: input.productId,
        productTitle: input.productTitle,
        productDescription: input.productDescription,
      });

      // Get structured response from LLM
      this.logger.debug('Sending prompt to LLM:', formattedPrompt.substring(0, 500) + '...');
      const analysisResult = await chain.invoke(formattedPrompt);
      this.logger.debug('LLM Response:', JSON.stringify(analysisResult, null, 2));

      // Transform suggestions to include proper IDs
      const suggestions = analysisResult.suggestions.map((suggestion, index) => ({
        id: input.productId,
        type: this.mapSuggestionType(suggestion.type),
        priority: suggestion.priority as SuggestionPriority,
        field: suggestion.field,
        current: suggestion.current,
        suggested: suggestion.suggested,
        reason: suggestion.reason,
        impact: suggestion.impact,
      }));

      // Handle case where LLM returns 0 scores or empty descriptions
      let overallScore = analysisResult.overallScore;
      let fieldScores = analysisResult.fieldScores;
      let feedback = analysisResult.feedback;

      // If field scores have 0 values or empty descriptions, calculate proper scores
      if (fieldScores.some(fs => fs.score === 0 || !fs.description)) {
        fieldScores = fieldScores.map(fs => {
          if (fs.score === 0 || !fs.description) {
            // Calculate score based on suggestions for this field
            const fieldSuggestions = suggestions.filter(s => s.field === fs.field);
            let calculatedScore = 70; // Default score
            
            if (fieldSuggestions.length > 0) {
              // Lower score if there are high priority suggestions
              const hasHighPriority = fieldSuggestions.some(s => s.priority === SuggestionPriority.HIGH);
              const hasMediumPriority = fieldSuggestions.some(s => s.priority === SuggestionPriority.MEDIUM);
              
              if (hasHighPriority) {
                calculatedScore = 45;
              } else if (hasMediumPriority) {
                calculatedScore = 65;
              } else {
                calculatedScore = 75;
              }
            }

            return {
              field: fs.field,
              score: calculatedScore,
              description: calculatedScore < 60 ? `${fs.field} needs significant improvement` :
                          calculatedScore < 80 ? `${fs.field} needs minor optimization` :
                          `${fs.field} is well optimized`
            };
          }
          return fs;
        });
      }

      // Calculate overall score if it's 0
      if (overallScore === 0) {
        overallScore = Math.round(fieldScores.reduce((sum, fs) => sum + fs.score, 0) / fieldScores.length);
      }

      // Ensure feedback is not empty
      if (!feedback) {
        feedback = `Product content analysis completed. Overall score: ${overallScore}/100. ${suggestions.length} suggestions provided.`;
      }

      return {
        score: Math.min(100, Math.max(0, overallScore)),
        suggestions,
        analysisType: 'product-content',
        feedback,
        fieldScores,
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
    let titleScore = 70;
    let descriptionScore = 70;

    // Analyze title
    if (input.productTitle.length < 30) {
      titleScore = 45;
      suggestions.push({
        id: `title-${input.productId}-short`,
        type: SuggestionType.TITLE,
        priority: SuggestionPriority.HIGH,
        field: 'Product Title',
        current: input.productTitle,
        suggested: `${input.productTitle} - Premium Quality | Best Price`,
        reason: 'Title is too short for optimal SEO performance',
        impact: 'Longer, descriptive titles can improve search visibility',
      });
    } else if (input.productTitle.length > 60) {
      titleScore = 65;
    } else {
      titleScore = 80;
    }

    // Analyze description
    if (!input.productDescription || input.productDescription.trim() === '' || input.productDescription === 'No description available') {
      descriptionScore = 20;
      suggestions.push({
        id: `description-${input.productId}-missing`,
        type: SuggestionType.DESCRIPTION,
        priority: SuggestionPriority.HIGH,
        field: 'Product Description',
        current: input.productDescription || 'No description available',
        suggested: `Discover the premium quality and exceptional value of ${input.productTitle}. Perfect for those seeking reliable performance and outstanding results. Order now for fast delivery and excellent customer service.`,
        reason: 'Product description is missing or too brief',
        impact: 'Detailed descriptions improve conversion rates and SEO',
      });
    } else if (input.productDescription.length < 100) {
      descriptionScore = 50;
      suggestions.push({
        id: `description-${input.productId}-short`,
        type: SuggestionType.DESCRIPTION,
        priority: SuggestionPriority.MEDIUM,
        field: 'Product Description',
        current: input.productDescription,
        suggested: `${input.productDescription} Perfect for those seeking quality and value. Order now for fast delivery and excellent customer service.`,
        reason: 'Product description is too brief and lacks compelling details',
        impact: 'Detailed descriptions can improve conversion rates and SEO',
      });
    } else {
      descriptionScore = 75;
    }

    const fieldScores = [
      {
        field: 'Product Title',
        score: titleScore,
        description: titleScore < 60 ? 'Title needs significant optimization' : titleScore < 80 ? 'Title needs minor optimization' : 'Title is well optimized',
      },
      {
        field: 'Product Description',
        score: descriptionScore,
        description: descriptionScore < 40 ? 'Description is missing or inadequate' : descriptionScore < 70 ? 'Description needs improvement' : 'Description is adequate',
      },
    ];

    const overallScore = Math.round((titleScore + descriptionScore) / 2);

    return {
      score: overallScore,
      suggestions,
      analysisType: 'product-content',
      feedback: `Fallback analysis: Title score ${titleScore}/100, Description score ${descriptionScore}/100. ${suggestions.length} improvements suggested.`,
      fieldScores,
    };
  }
}