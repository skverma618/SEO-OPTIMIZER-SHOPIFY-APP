export interface BrandMapping {
  brandName?: string;
  brandTone?: string;
  brandKeys?: string[];
  brandStory?: string;
  brandGuidelines?: string;
}

export const DEFAULT_BRAND_MAPPING: BrandMapping = {
  brandName: 'Generic Brand',
  brandTone: 'professional and friendly',
  brandKeys: ['quality', 'value', 'customer satisfaction'],
  brandStory: 'A trusted brand committed to delivering exceptional products and services.',
  brandGuidelines: 'Focus on clear, concise, and customer-focused messaging that highlights product benefits and value proposition.',
};