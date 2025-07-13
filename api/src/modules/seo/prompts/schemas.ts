import { z } from 'zod';

// Individual field score schema
export const FieldScoreSchema = z.object({
  field: z.string(),
  score: z.number().min(0).max(100),
  description: z.string(),
});

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
  imageUrl: z.string().nullable(),
});

// Product Content Analysis Schema with individual field scores
export const ProductContentSchema = z.object({
  overallScore: z.number().min(0).max(100),
  fieldScores: z.array(FieldScoreSchema),
  feedback: z.string(),
  suggestions: z.array(SuggestionSchema),
});

// SEO Metadata Analysis Schema with individual field scores
export const SeoMetadataSchema = z.object({
  overallScore: z.number().min(0).max(100),
  fieldScores: z.array(FieldScoreSchema),
  feedback: z.string(),
  suggestions: z.array(SuggestionSchema),
});

// Image Analysis Schema with individual field scores
export const ImageAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  fieldScores: z.array(FieldScoreSchema),
  feedback: z.string(),
  suggestions: z.array(SuggestionSchema.extend({
    imageId: z.string().nullable(),
  })),
});

// Metafields Analysis Schema with individual field scores
export const MetafieldsAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  fieldScores: z.array(FieldScoreSchema),
  feedback: z.string(),
  suggestions: z.array(SuggestionSchema.extend({
    metaId: z.string().nullable(),
  })),
});

export type FieldScore = z.infer<typeof FieldScoreSchema>;
export type ProductContentAnalysis = z.infer<typeof ProductContentSchema>;
export type SeoMetadataAnalysis = z.infer<typeof SeoMetadataSchema>;
export type ImageAnalysis = z.infer<typeof ImageAnalysisSchema>;
export type MetafieldsAnalysis = z.infer<typeof MetafieldsAnalysisSchema>;