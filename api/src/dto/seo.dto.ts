import { IsArray, IsString } from 'class-validator';

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
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}

export class SuggestionDto {
  id: string;
  type: SuggestionType;
  priority: SuggestionPriority;
  field: string;
  current: string;
  suggested: string;
  reason: string;
  impact?: string;
}

export class ProductScanResultDto {
  productId: string;
  title: string;
  handle: string;
  suggestions: SuggestionDto[];
}

export class ScanResultDto {
  scanId: string;
  totalProducts: number;
  productsWithIssues: number;
  results: ProductScanResultDto[];
}

export class ApplySuggestionDto {
  @IsString()
  suggestionId: string;

  @IsString()
  productId: string;

  @IsString()
  field: string;

  @IsString()
  value: string;
}

export class ApplyBulkSuggestionsDto {
  @IsArray()
  suggestions: ApplySuggestionDto[];
}
