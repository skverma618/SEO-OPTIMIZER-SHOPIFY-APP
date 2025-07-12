import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SuggestionType {
  TITLE = 'title',
  DESCRIPTION = 'description',
  META_DESCRIPTION = 'meta-description',
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
    description: 'Type of SEO suggestion',
    enum: SuggestionType,
    example: SuggestionType.TITLE,
  })
  type: SuggestionType;

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
