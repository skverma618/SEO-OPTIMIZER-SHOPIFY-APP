export const TASK_PROMPTS = {
  PRODUCT_CONTENT_ANALYSIS: `Analyze this product content:

Product ID: {productId}
Title: "{productTitle}"
Description: "{productDescription}"

Rate each field 0-100 and provide suggestions with actual improved content.

Example response format:
- overallScore: 75
- fieldScores: array with field, score, description
- suggestions: array with type, priority, field, current, suggested, reason, impact
- feedback: summary string`,

  SEO_METADATA_ANALYSIS: `Analyze this SEO metadata:

Product ID: {productId}
SEO Title: "{productSeoTitle}"
SEO Description: "{productSeoDescription}"

Rate each field 0-100 and provide suggestions with actual improved content.

Required format:
- overallScore: number 0-100
- fieldScores: array with field, score, description
- suggestions: array with type, priority, field, current, suggested, reason, impact
- feedback: string summary`,

  IMAGE_ANALYSIS: `Analyze these images:

{imagesData}

Rate each image field 0-100 and provide suggestions with actual improved content.

Required format:
- overallScore: number 0-100
- fieldScores: array with field, score, description
- suggestions: array with type, priority, field, current, suggested, reason, impact
- feedback: string summary`,

  METAFIELDS_ANALYSIS: `Analyze these metafields:

{metafieldsData}

Rate each metafield 0-100 and provide suggestions with actual improved content.

Required format:
- overallScore: number 0-100
- fieldScores: array with field, score, description
- suggestions: array with type, priority, field, current, suggested, reason, impact
- feedback: string summary`
};