import { IsOptional, IsString, IsArray } from 'class-validator';

export class BrandStoryDto {
  @IsOptional()
  @IsString()
  brandName?: string;

  @IsOptional()
  @IsString()
  brandTone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brandKeys?: string[];

  @IsOptional()
  @IsString()
  brandStory?: string;

  @IsOptional()
  @IsString()
  brandGuidelines?: string;
}
