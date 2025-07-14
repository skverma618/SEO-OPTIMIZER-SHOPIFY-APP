import { IsArray, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SuggestionType {
  // Product Content Types
  PRODUCT_TITLE = 'product-title',
  PRODUCT_DESCRIPTION = 'product-description',
  
  // SEO/Meta Tags (these are the same thing)
  META_TITLE = 'meta-title', // Same as SEO title - the <title> tag
  META_DESCRIPTION = 'meta-description', // Same as SEO description - <meta name="description">
  
  // Image Types
  IMAGE_ALT_TEXT = 'image-alt-text',
  
  // Metafield Types
  METAFIELD_TITLE = 'metafield-title',
  METAFIELD_DESCRIPTION = 'metafield-description',
  METAFIELD_KEYWORDS = 'metafield-keywords',
  STRUCTURED_DATA = 'structured-data',
  SCHEMA_MARKUP = 'schema-markup',
  
  // Legacy types (for backward compatibility)
  TITLE = 'title',
  DESCRIPTION = 'description',
  SEO_TITLE = 'seo-title', // Alias for META_TITLE
  SEO_DESCRIPTION = 'seo-description', // Alias for META_DESCRIPTION
  ALT_TEXT = 'alt-text',
}

export enum SuggestionPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export class ScanProductsDto {
  @ApiProperty({
    description: 'Array of Shopify product IDs to scan for SEO issues',
    example: [
      'gid://shopify/Product/123456789',
      'gid://shopify/Product/987654321',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}

export class SuggestionDto {
  @ApiProperty({
    description: 'Unique identifier for the suggestion',
    example: 'title-123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Image ID for image-related suggestions (clean ID without prefixes)',
    example: 'gid://shopify/ProductImage/50092349358364',
    required: false,
  })
  imageId?: string;

  @ApiProperty({
    description: 'Type of SEO suggestion',
    enum: SuggestionType,
    example: SuggestionType.TITLE,
  })
  type: string;

  @ApiProperty({
    description: 'Priority level of the suggestion',
    enum: SuggestionPriority,
    example: SuggestionPriority.HIGH,
  })
  priority: SuggestionPriority;

  @ApiProperty({
    description: 'Field that the suggestion applies to',
    example: 'seo.title',
  })
  field: string;

  @ApiProperty({
    description: 'Current value of the field',
    example: 'Basic Product Title',
  })
  current: string;

  @ApiProperty({
    description: 'Suggested improved value',
    example: 'Premium Quality Product - Best Price | Brand Name',
  })
  suggested: string;

  @ApiProperty({
    description: 'Reason for the suggestion',
    example: 'SEO title should be 30-60 characters and include target keywords',
  })
  reason: string;

  @ApiProperty({
    description: 'Expected impact of implementing the suggestion',
    example: 'Could improve search ranking and click-through rates',
    required: false,
  })
  impact?: string;

  @ApiProperty({
    description: 'Image URL for image-related suggestions',
    example: 'https://cdn.shopify.com/s/files/1/0123/4567/products/product-image.jpg',
    required: false,
  })
  imageUrl?: string;
}

export class ProductScanResultDto {
  @ApiProperty({
    description: 'Shopify product ID',
    example: 'gid://shopify/Product/123456789',
  })
  productId: string;

  @ApiProperty({
    description: 'Product title',
    example: 'Premium Quality T-Shirt',
  })
  title: string;

  @ApiProperty({
    description: 'Product handle/slug',
    example: 'premium-quality-t-shirt',
  })
  handle: string;

  @ApiProperty({
    description: 'Array of SEO suggestions for this product',
    type: [SuggestionDto],
  })
  suggestions: SuggestionDto[];
}

export class ScanResultDto {
  @ApiProperty({
    description: 'Unique identifier for the scan',
    example: 'scan_1640995200000_abc123def456',
  })
  scanId: string;

  @ApiProperty({
    description: 'Total number of products scanned',
    example: 25,
  })
  totalProducts: number;

  @ApiProperty({
    description: 'Number of products with SEO issues found',
    example: 18,
  })
  productsWithIssues: number;

  @ApiProperty({
    description: 'Detailed scan results for each product',
    type: [ProductScanResultDto],
  })
  results: ProductScanResultDto[];
}

export class ApplySuggestionDto {
  @ApiProperty({
    description: 'ID of the suggestion to apply',
    example: 'title-123456789',
  })
  @IsString()
  suggestionId: string;

  @ApiProperty({
    description: 'Shopify product ID',
    example: 'gid://shopify/Product/123456789',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Field to update',
    example: 'seo.title',
  })
  @IsString()
  field: string;

  @ApiProperty({
    description: 'New value to apply',
    example: 'Premium Quality Product - Best Price | Brand Name',
  })
  @IsString()
  value: string;
}

export class ApplyBulkSuggestionsDto {
  @ApiProperty({
    description: 'Array of suggestions to apply in bulk',
    type: [ApplySuggestionDto],
  })
  @IsArray()
  suggestions: ApplySuggestionDto[];
}

export class ProductBulkSuggestionsDto {
  @ApiProperty({
    description: 'Shopify product ID',
    example: 'gid://shopify/Product/123456789',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Product title',
    example: 'Premium Quality T-Shirt',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Product handle/slug',
    example: 'premium-quality-t-shirt',
  })
  @IsString()
  handle: string;

  @ApiProperty({
    description: 'Array of selected suggestions for this product',
    type: [ApplySuggestionDto],
  })
  @IsArray()
  suggestions: ApplySuggestionDto[];
}

export class ApplyBulkSuggestionsNewDto {
  @ApiProperty({
    description: 'Array of products with their selected suggestions',
    type: [ProductBulkSuggestionsDto],
  })
  @IsArray()
  products: ProductBulkSuggestionsDto[];
}

// Content History Tracking DTOs
export class PreviousSuggestionDto {
  @ApiProperty({
    description: 'Field that was previously suggested for',
    example: 'Product Title',
  })
  field: string;

  @ApiProperty({
    description: 'Previously suggested content',
    example: 'Premium Quality Product - Best Price | Brand Name',
  })
  suggestedContent: string;

  @ApiProperty({
    description: 'When the suggestion was generated',
    example: '2024-01-15T10:30:00Z',
  })
  generatedAt: Date;

  @ApiProperty({
    description: 'When the suggestion was applied (if applied)',
    example: '2024-01-15T11:00:00Z',
    required: false,
  })
  appliedAt?: Date;

  @ApiProperty({
    description: 'Score given when this suggestion was generated',
    example: 45,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  originalScore?: number;
}

export class AnalysisHistoryDto {
  @ApiProperty({
    description: 'Score given during previous analysis',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  score: number;

  @ApiProperty({
    description: 'When the analysis was performed',
    example: '2024-01-15T10:30:00Z',
  })
  analyzedAt: Date;

  @ApiProperty({
    description: 'Hash of the content that was analyzed',
    example: 'abc123def456',
  })
  contentHash: string;

  @ApiProperty({
    description: 'Whether the content was AI-generated',
    example: true,
    required: false,
  })
  wasAiGenerated?: boolean;
}

// New DTOs for Parallel SEO Analysis Workers

// Input DTOs for each worker
export class ProductAnalysisInputDto {
  @ApiProperty({
    description: 'Shopify product ID',
    example: 'gid://shopify/Product/123456789',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Product title',
    example: 'RYZE Gums Frosty Mint Flavour - 2mg',
  })
  @IsString()
  productTitle: string;

  @ApiProperty({
    description: 'Product description',
    example: 'RYZE is a sugar free gum that helps manage your cravings...',
  })
  @IsString()
  productDescription: string;

  @ApiProperty({
    description: 'Previous suggestions for this product',
    type: [PreviousSuggestionDto],
    required: false,
  })
  @IsOptional()
  previousSuggestions?: PreviousSuggestionDto[];

  @ApiProperty({
    description: 'Analysis history for this product',
    type: [AnalysisHistoryDto],
    required: false,
  })
  @IsOptional()
  analysisHistory?: AnalysisHistoryDto[];
}

export class ProductSeoAnalysisInputDto {
  @ApiProperty({
    description: 'Shopify product ID',
    example: 'gid://shopify/Product/123456789',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Product SEO title',
    example: 'RYZE Sugar free Gums Frosty Mint Flavor - 2mg',
  })
  @IsString()
  productSeoTitle: string;

  @ApiProperty({
    description: 'Product SEO description',
    example: 'Buy RYZE Sugar Free Gums Frosty Mint Flavor- 2mg to help you stop smoking...',
  })
  @IsString()
  productSeoDescription: string;
}

export class ProductImageAnalysisInputDto {
  @ApiProperty({
    description: 'Shopify product ID',
    example: 'gid://shopify/Product/123456789',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Product image ID',
    example: 'gid://shopify/ProductImage/123456789',
  })
  @IsString()
  productImageId: string;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://cdn.shopify.com/s/files/1/0123/4567/products/product-image.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  productImageUrl?: string;

  @ApiProperty({
    description: 'Product image alt text',
    example: 'RYZE nicotine gum frosty mint flavor package',
  })
  @IsString()
  productImageAltText: string;
}

export class ProductMetaFieldAnalysisInputDto {
  @ApiProperty({
    description: 'Shopify product ID',
    example: 'gid://shopify/Product/123456789',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Product metafield ID',
    example: 'gid://shopify/Metafield/123456789',
  })
  @IsString()
  productMetaId: string;

  @ApiProperty({
    description: 'Product metafield value',
    example: 'RYZE Sugar free Gums Frosty Mint Flavor - 2mg',
  })
  @IsString()
  productMetaValue: string;
}

// Field Score DTO for individual field scoring
export class FieldScoreDto {
  @ApiProperty({
    description: 'Field name being scored',
    example: 'Product Title',
  })
  field: string;

  @ApiProperty({
    description: 'Score for this specific field out of 100',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  score: number;

  @ApiProperty({
    description: 'Description explaining the score for this field',
    example: 'Title length is optimal and includes relevant keywords',
  })
  description: string;
}

// Analysis Result DTOs
export class AnalysisResultDto {
  @ApiProperty({
    description: 'Analysis score out of 100',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  score: number;

  @ApiProperty({
    description: 'Array of suggestions from the analysis',
    type: [SuggestionDto],
  })
  suggestions: SuggestionDto[];

  @ApiProperty({
    description: 'Analysis type identifier',
    example: 'product-content',
  })
  analysisType: string;

  @ApiProperty({
    description: 'Detailed analysis feedback',
    example: 'The product title is well-optimized but could benefit from more specific keywords...',
  })
  feedback: string;

  @ApiProperty({
    description: 'Individual field scores breakdown',
    type: [FieldScoreDto],
    required: false,
  })
  fieldScores?: FieldScoreDto[];
}

export class ParallelAnalysisResultDto {
  @ApiProperty({
    description: 'Shopify product ID',
    example: 'gid://shopify/Product/123456789',
  })
  productId: string;

  @ApiProperty({
    description: 'Overall SEO score out of 100',
    example: 78,
    minimum: 0,
    maximum: 100,
  })
  overallScore: number;

  @ApiProperty({
    description: 'Product content analysis result',
    type: AnalysisResultDto,
  })
  productContentAnalysis: AnalysisResultDto;

  @ApiProperty({
    description: 'SEO metadata analysis result',
    type: AnalysisResultDto,
  })
  seoMetadataAnalysis: AnalysisResultDto;

  @ApiProperty({
    description: 'Image alt text analysis result',
    type: AnalysisResultDto,
  })
  imageAnalysis: AnalysisResultDto;

  @ApiProperty({
    description: 'Metafields analysis result',
    type: AnalysisResultDto,
  })
  metafieldsAnalysis: AnalysisResultDto;

  @ApiProperty({
    description: 'Combined suggestions from all analyses',
    type: [SuggestionDto],
  })
  allSuggestions: SuggestionDto[];

  @ApiProperty({
    description: 'Analysis execution time in milliseconds',
    example: 2500,
  })
  executionTime: number;
}

export class ParallelAnalysisInputDto {
  @ApiProperty({
    description: 'Product content analysis input',
    type: ProductAnalysisInputDto,
  })
  productContent: ProductAnalysisInputDto;

  @ApiProperty({
    description: 'SEO metadata analysis input',
    type: ProductSeoAnalysisInputDto,
  })
  seoMetadata: ProductSeoAnalysisInputDto;

  @ApiProperty({
    description: 'Image analysis inputs',
    type: [ProductImageAnalysisInputDto],
  })
  images: ProductImageAnalysisInputDto[];

  @ApiProperty({
    description: 'Metafields analysis inputs',
    type: [ProductMetaFieldAnalysisInputDto],
  })
  metafields: ProductMetaFieldAnalysisInputDto[];

  @ApiProperty({
    description: 'Brand mapping information for brand-aware suggestions',
    required: false,
  })
  brandMapping?: any;
}
