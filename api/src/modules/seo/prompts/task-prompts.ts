export const TASK_PROMPTS = {
  PRODUCT_CONTENT_ANALYSIS: `Analyze this product content with brand awareness:

Product ID: {productId}
Title: "{productTitle}"
Description: "{productDescription}"

BRAND ANALYSIS REQUIREMENTS:
- Ensure all suggestions align with the provided brand story and guidelines
- Incorporate brand keys naturally into content recommendations
- Maintain consistent brand tone and messaging throughout
- If content already reflects good brand alignment, score it appropriately high
- Prioritize brand consistency over generic SEO improvements

CONSISTENCY CHECK:
- If analyzing previously AI-generated content that follows brand guidelines, maintain high scores
- Only suggest changes if there are genuine SEO improvements or better brand alignment needed
- Avoid suggesting changes just for the sake of change
- Recognize content that successfully incorporates brand elements

Rate each field 0-100 and provide suggestions with actual improved content that reflects the brand identity.

MARKDOWN FORMATTING FOR SUGGESTIONS:
- Format the "suggested" field content using Markdown with highlighted key changes
- Use **bold text** for new or significantly improved content sections
- Use <span style="color: green">text</span> for additions and enhancements
- Keep existing good content as normal text
- Ensure the formatting clearly highlights what's being changed or added

Response format:
- overallScore: number (0-100)
- fieldScores: array with field, score, description
- suggestions: array with type, priority, field, current, suggested, reason, impact
- feedback: summary string emphasizing brand alignment`,

  SEO_METADATA_ANALYSIS: `Analyze this SEO metadata:

Product ID: {productId}
SEO Title: "{productSeoTitle}"
SEO Description: "{productSeoDescription}"

Rate each field 0-100 and provide suggestions with actual improved content.

MARKDOWN FORMATTING FOR SUGGESTIONS:
- Format the "suggested" field content using Markdown with highlighted key changes
- Use **bold text** for new or significantly improved content sections
- Use <span style="color: green">text</span> for additions and enhancements
- Keep existing good content as normal text
- Ensure the formatting clearly highlights what's being changed or added

Required format:
- overallScore: number 0-100
- fieldScores: array with field, score, description
- suggestions: array with type, priority, field, current, suggested, reason, impact
- feedback: string summary`,

  IMAGE_ANALYSIS: `Analyze these images:

{imagesData}

Rate each image field 0-100 and provide suggestions with actual improved content.

MARKDOWN FORMATTING FOR SUGGESTIONS:
- Format the "suggested" field content using Markdown with highlighted key changes
- Use **bold text** for new or significantly improved content sections
- Use <span style="color: green">text</span> for additions and enhancements
- Keep existing good content as normal text
- Ensure the formatting clearly highlights what's being changed or added

Required format:
- overallScore: number 0-100
- fieldScores: array with field, score, description
- suggestions: array with type, priority, field, current, suggested, reason, impact, imageUrl, imageId
- feedback: string summary

IMPORTANT: For each suggestion, include the imageUrl and imageId from the corresponding image data.`,

  METAFIELDS_ANALYSIS: `Analyze these metafields:

{metafieldsData}

Rate each metafield 0-100 and provide suggestions with actual improved content.

MARKDOWN FORMATTING FOR SUGGESTIONS:
- Format the "suggested" field content using Markdown with highlighted key changes
- Use **bold text** for new or significantly improved content sections
- Use <span style="color: green">text</span> for additions and enhancements
- Keep existing good content as normal text
- Ensure the formatting clearly highlights what's being changed or added

Required format:
- overallScore: number 0-100
- fieldScores: array with field, score, description
- suggestions: array with type, priority, field, current, suggested, reason, impact
- feedback: string summary`,
};
