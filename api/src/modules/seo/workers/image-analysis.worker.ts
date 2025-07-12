import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import {
  ProductImageAnalysisInputDto,
  AnalysisResultDto,
  SuggestionDto,
  SuggestionType,
  SuggestionPriority,
} from '../../../dto/seo.dto';
import { ImageAnalysisSchema } from '../prompts/schemas';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';
import { TASK_PROMPTS } from '../prompts/task-prompts';

@Injectable()
export class ImageAnalysisWorker {
  private readonly logger = new Logger(ImageAnalysisWorker.name);
  private readonly llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-3.5-turbo',
      temperature: 0.3,
    });
  }

  async analyzeImageAltText(inputs: ProductImageAnalysisInputDto[]): Promise<AnalysisResultDto> {
    try {
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', SYSTEM_PROMPTS.IMAGE_SPECIALIST],
        ['human', TASK_PROMPTS.IMAGE_ANALYSIS],
      ]);

      const imagesData = inputs.map((input, index) =>
        `Image ${index + 1}:
        - Product ID: ${input.productId}
        - Image ID: ${input.productImageId}
        - Alt Text: "${input.productImageAltText || 'MISSING'}"
        `
      ).join('\n');

      const structuredLlm = (this.llm as any).withStructuredOutput(ImageAnalysisSchema);
      
      const response = await structuredLlm.invoke(
        await prompt.format({
          imagesData,
        })
      );

      // Transform suggestions to include proper IDs and types
      const suggestions = response.suggestions.map((suggestion: any, index: number) => ({
        id: `alt-text-${suggestion.imageId || inputs[index]?.productImageId || index}`,
        type: SuggestionType.ALT_TEXT,
        priority: suggestion.priority as SuggestionPriority,
        field: 'images.altText',
        current: suggestion.current,
        suggested: suggestion.suggested,
        reason: suggestion.reason,
        impact: suggestion.impact,
      }));

      return {
        score: Math.min(100, Math.max(0, response.score)),
        suggestions,
        analysisType: 'image-analysis',
        feedback: response.feedback,
      };
    } catch (error) {
      this.logger.error('Error in image analysis', error);
      return this.getFallbackAnalysis(inputs);
    }
  }

  private getFallbackAnalysis(inputs: ProductImageAnalysisInputDto[]): any {
    const suggestions: SuggestionDto[] = [];
    let score = 80; // Base score
    let imagesWithIssues = 0;

    inputs.forEach((input, index) => {
      // Check for missing alt text
      if (!input.productImageAltText || input.productImageAltText.trim().length === 0) {
        suggestions.push({
          id: `alt-text-${input.productImageId}-missing`,
          type: SuggestionType.ALT_TEXT,
          priority: SuggestionPriority.HIGH,
          field: 'images.altText',
          current: '',
          suggested: `Product image showing main features and details`,
          reason: 'Missing alt text hurts accessibility and SEO',
          impact: 'Improves image search visibility and accessibility compliance',
        });
        imagesWithIssues++;
        score -= 20;
      } 
      // Check for poor quality alt text
      else if (input.productImageAltText.length < 10) {
        suggestions.push({
          id: `alt-text-${input.productImageId}-short`,
          type: SuggestionType.ALT_TEXT,
          priority: SuggestionPriority.MEDIUM,
          field: 'images.altText',
          current: input.productImageAltText,
          suggested: `${input.productImageAltText} - detailed product view showing quality and features`,
          reason: 'Alt text is too brief and not descriptive enough',
          impact: 'More descriptive alt text improves SEO and accessibility',
        });
        imagesWithIssues++;
        score -= 10;
      }
      // Check for overly long alt text
      else if (input.productImageAltText.length > 125) {
        suggestions.push({
          id: `alt-text-${input.productImageId}-long`,
          type: SuggestionType.ALT_TEXT,
          priority: SuggestionPriority.LOW,
          field: 'images.altText',
          current: input.productImageAltText,
          suggested: input.productImageAltText.substring(0, 120) + '...',
          reason: 'Alt text is too long and may be truncated by screen readers',
          impact: 'Optimal length improves accessibility and user experience',
        });
        imagesWithIssues++;
        score -= 5;
      }
    });

    // Adjust score based on percentage of images with issues
    if (inputs.length > 0) {
      const issuePercentage = (imagesWithIssues / inputs.length) * 100;
      if (issuePercentage > 50) {
        score -= 15;
      }
    }

    return {
      score: Math.max(0, score),
      suggestions,
      analysisType: 'image-analysis',
      feedback: `Fallback analysis: Analyzed ${inputs.length} images. ${imagesWithIssues} images need alt text improvements for better SEO and accessibility.`,
    };
  }
}