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
import { SYSTEM_PROMPTS, createBrandAwareSystemPrompt } from '../prompts/system-prompts';
import { TASK_PROMPTS } from '../prompts/task-prompts';
import { BrandMapping } from '../../../interfaces/brand.interface';

@Injectable()
export class SeoMetadataAnalysisWorker {
  private readonly logger = new Logger(SeoMetadataAnalysisWorker.name);
  private readonly llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-4o-mini',
      temperature: 0.3,
    });
  }

  async analyzeSeoMetadata(input: ProductSeoAnalysisInputDto, brandMapping?: BrandMapping): Promise<AnalysisResultDto> {
    try {
      // Create structured output chain
      const chain = (this.llm as any).withStructuredOutput(SeoMetadataSchema);

      // Create brand-aware system prompt
      const baseSystemPrompt = SYSTEM_PROMPTS.SEO_EXPERT + '\n\n' + SYSTEM_PROMPTS.METADATA_SPECIALIST;
      const brandAwareSystemPrompt = createBrandAwareSystemPrompt(baseSystemPrompt, brandMapping);

      // Create prompt template with brand-aware system and task prompts
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', brandAwareSystemPrompt],
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
        feedback = `SEO metadata analysis completed. Overall score: ${overallScore}/100. ${suggestions.length} suggestions provided.`;
      }

      return {
        score: Math.min(100, Math.max(0, overallScore)),
        suggestions,
        analysisType: 'seo-metadata',
        feedback,
        fieldScores,
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
    let seoTitleScore = 75;
    let metaDescriptionScore = 75;

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
      seoTitleScore = 25;
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
      seoTitleScore = 60;
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
      metaDescriptionScore = 30;
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
      metaDescriptionScore = 65;
    }

    const fieldScores = [
      {
        field: 'SEO Title',
        score: seoTitleScore,
        description: seoTitleScore < 60 ? 'SEO title needs optimization for length and content' : 'SEO title is well optimized',
      },
      {
        field: 'Meta Description',
        score: metaDescriptionScore,
        description: metaDescriptionScore < 60 ? 'Meta description needs optimization for length and content' : 'Meta description is well optimized',
      },
    ];

    const overallScore = Math.round((seoTitleScore + metaDescriptionScore) / 2);

    return {
      score: overallScore,
      suggestions,
      analysisType: 'seo-metadata',
      feedback: 'Fallback analysis: Basic SEO metadata checks completed. Focus on optimizing title and description lengths.',
      fieldScores,
    };
  }
}