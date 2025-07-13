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
import { SYSTEM_PROMPTS, createBrandAwareSystemPrompt } from '../prompts/system-prompts';
import { TASK_PROMPTS } from '../prompts/task-prompts';
import { BrandMapping } from '../../../interfaces/brand.interface';

@Injectable()
export class ImageAnalysisWorker {
  private readonly logger = new Logger(ImageAnalysisWorker.name);
  private readonly llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.llm = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: this.configService.get<string>('OPENAI_MODEL_NAME') || 'gpt-4o-mini',
      temperature: parseFloat(this.configService.get<string>('OPENAI_TEMPERATURE') || '0.3'),
    });
  }

  async analyzeImageAltText(inputs: ProductImageAnalysisInputDto[], brandMapping?: BrandMapping): Promise<AnalysisResultDto> {
    try {
      // Create brand-aware system prompt
      const brandAwareSystemPrompt = createBrandAwareSystemPrompt(SYSTEM_PROMPTS.IMAGE_SPECIALIST, brandMapping);

      const prompt = ChatPromptTemplate.fromMessages([
        ['system', brandAwareSystemPrompt],
        ['human', TASK_PROMPTS.IMAGE_ANALYSIS],
      ]);

      const imagesData = inputs.map((input, index) =>
        `Image ${index + 1}:
        - Product ID: ${input.productId}
        - Image ID: ${input.productImageId}
        - Image URL: ${input.productImageUrl}
        - Alt Text: "${input.productImageAltText || 'MISSING'}"
        `
      ).join('\n');

      const structuredLlm = (this.llm as any).withStructuredOutput(ImageAnalysisSchema);
      
      const response = await structuredLlm.invoke(
        await prompt.format({
          imagesData,
        })
      );

      // Check if response has the expected structure and actual data
      if (!response || typeof response !== 'object' ||
          typeof response.overallScore !== 'number' ||
          response.overallScore === 0 ||
          !Array.isArray(response.fieldScores) ||
          response.fieldScores.length === 0 ||
          !Array.isArray(response.suggestions) ||
          !response.feedback ||
          response.feedback.includes('in progress') ||
          response.feedback.includes('Please wait')) {
        this.logger.warn('LLM returned incomplete or malformed response, using fallback analysis');
        this.logger.warn('Response received:', JSON.stringify(response, null, 2));
        throw new Error('Incomplete LLM response');
      }

      // Transform suggestions to include proper IDs and types
      const suggestions = response.suggestions.map((suggestion: any, index: number) => ({
        id: suggestion.imageId || inputs[index]?.productImageId || `${index + 1}`,
        type: SuggestionType.ALT_TEXT,
        priority: suggestion.priority as SuggestionPriority,
        field: 'images.altText',
        current: suggestion.current,
        suggested: suggestion.suggested,
        reason: suggestion.reason,
        impact: suggestion.impact,
        imageUrl: inputs[index]?.productImageUrl,
      }));

      // Handle case where LLM returns 0 scores or empty descriptions
      let overallScore = response.overallScore;
      let fieldScores = response.fieldScores;
      let feedback = response.feedback;

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
        feedback = `Image analysis completed. Overall score: ${overallScore}/100. ${suggestions.length} suggestions provided.`;
      }

      return {
        score: Math.min(100, Math.max(0, overallScore)),
        suggestions,
        analysisType: 'image-analysis',
        feedback,
        fieldScores,
      };
    } catch (error) {
      this.logger.error('Error in image analysis', error);
      return this.getFallbackAnalysis(inputs);
    }
  }

  private getFallbackAnalysis(inputs: ProductImageAnalysisInputDto[]): any {
    const suggestions: SuggestionDto[] = [];
    let overallImageScore = 80; // Base score
    let imagesWithIssues = 0;
    const fieldScores: Array<{field: string; score: number; description: string}> = [];

    inputs.forEach((input, index) => {
      let imageScore = 80; // Default good score
      let urlScore = 70; // Default URL score
      
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
          imageUrl: input.productImageUrl,
        });
        imagesWithIssues++;
        imageScore = 20;
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
          imageUrl: input.productImageUrl,
        });
        imagesWithIssues++;
        imageScore = 60;
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
          imageUrl: input.productImageUrl,
        });
        imagesWithIssues++;
        imageScore = 75;
      }
      // Alt text is good length, check quality
      else {
        // Check if alt text contains descriptive keywords
        const hasDescriptiveWords = /\b(shows?|displays?|features?|contains?|depicts?|illustrates?)\b/i.test(input.productImageAltText);
        if (hasDescriptiveWords) {
          imageScore = 85; // Good descriptive alt text
        } else {
          imageScore = 70; // Adequate but could be more descriptive
          suggestions.push({
            id: `alt-text-${input.productImageId}-enhance`,
            type: SuggestionType.ALT_TEXT,
            priority: SuggestionPriority.LOW,
            field: 'images.altText',
            current: input.productImageAltText,
            suggested: `${input.productImageAltText} showing product details and features`,
            reason: 'Alt text could be more descriptive for better SEO',
            impact: 'More descriptive alt text improves search visibility',
            imageUrl: input.productImageUrl,
          });
          imagesWithIssues++;
        }
      }

      // Check URL structure for SEO-friendliness
      if (input.productImageUrl) {
        const url = input.productImageUrl.toLowerCase();
        if (url.includes('product') || url.includes(input.productId.split('/').pop()?.toLowerCase() || '')) {
          urlScore = 85; // Good URL structure
        } else if (url.includes('files') && url.includes('.png') || url.includes('.jpg')) {
          urlScore = 60; // Generic file URL
        } else {
          urlScore = 40; // Poor URL structure
        }
      }

      // Add field scores for this image
      fieldScores.push({
        field: `Image ${index + 1} Alt Text`,
        score: imageScore,
        description: imageScore < 60 ? 'Alt text needs significant improvement' : imageScore < 80 ? 'Alt text needs minor optimization' : 'Alt text is well optimized',
      });

      fieldScores.push({
        field: `Image ${index + 1} URL Structure`,
        score: urlScore,
        description: urlScore < 60 ? 'URL structure needs improvement for SEO' : urlScore < 80 ? 'URL structure is adequate' : 'URL structure is SEO-friendly',
      });
    });

    // Calculate overall image quality score
    if (fieldScores.length > 0) {
      overallImageScore = Math.round(fieldScores.reduce((sum, field) => sum + field.score, 0) / fieldScores.length);
    }

    // Add overall image quality field score
    fieldScores.push({
      field: 'Overall Image Quality',
      score: overallImageScore,
      description: overallImageScore < 60 ? 'Images need significant SEO improvements' : overallImageScore < 80 ? 'Images need minor SEO optimizations' : 'Images are well optimized for SEO',
    });

    return {
      score: Math.max(0, overallImageScore),
      suggestions,
      analysisType: 'image-analysis',
      feedback: `Fallback analysis: Analyzed ${inputs.length} images. ${imagesWithIssues} images need alt text improvements for better SEO and accessibility.`,
      fieldScores,
    };
  }
}