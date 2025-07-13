import { z } from 'zod';

// Base suggestion schema
export const SuggestionSchema = z.object({
  type: z.enum([
    'title',
    'description',
    'meta-description',
    'alt-text',
    'structured-data',
    'missing-metafields',
    'duplicate-content',
    'schema-markup',
    'rich-snippets',
    'brand-category-info',
    'technical-seo',
    'e-commerce-optimizations',
    'keywords',
    'metafield',
    'call-to-action'
  ]),
  priority: z.enum(['high', 'medium', 'low']),
  field: z.string(),
  current: z.string(),
  suggested: z.string(),
  reason: z.string(),
  impact: z.string(),
});

// Product Content Analysis Schema
export const ProductContentSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  suggestions: z.array(SuggestionSchema),
});

// SEO Metadata Analysis Schema
export const SeoMetadataSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  suggestions: z.array(SuggestionSchema),
});

// Image Analysis Schema
export const ImageAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  suggestions: z.array(SuggestionSchema.extend({
    imageId: z.string().optional(),
  })),
});

// Metafields Analysis Schema
export const MetafieldsAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  suggestions: z.array(SuggestionSchema.extend({
    metaId: z.string().optional(),
  })),
});

export type ProductContentAnalysis = z.infer<typeof ProductContentSchema>;
export type SeoMetadataAnalysis = z.infer<typeof SeoMetadataSchema>;
export type ImageAnalysis = z.infer<typeof ImageAnalysisSchema>;
export type MetafieldsAnalysis = z.infer<typeof MetafieldsAnalysisSchema>;