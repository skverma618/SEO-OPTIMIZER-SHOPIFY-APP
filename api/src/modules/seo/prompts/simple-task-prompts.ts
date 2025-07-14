export const SIMPLE_TASK_PROMPTS = {
  PRODUCT_CONTENT_ANALYSIS: `
Analyze this product content:

Product ID: {productId}
Title: "{productTitle}"
Description: "{productDescription}"

Rate each field 0-100:
- Product Title: Consider length (30-60 chars), keywords, clarity
- Product Description: Consider detail, keywords, engagement

IMPORTANT: Format all suggested content using Markdown with:
- **Bold text** for new/improved content and key changes
- <span style="color: green">Green colored text</span> for additions and enhancements
- Keep existing good content as normal text

Provide actual improved content in suggestions (not instructions).
`,

  SEO_METADATA_ANALYSIS: `
Analyze this SEO metadata:

Product ID: {productId}
SEO Title: "{productSeoTitle}"
SEO Description: "{productSeoDescription}"

Rate each field 0-100:
- SEO Title: Consider length (30-60 chars), keywords, CTR
- Meta Description: Consider length (120-160 chars), compelling copy

IMPORTANT: Format all suggested content using Markdown with:
- **Bold text** for new/improved content and key changes
- <span style="color: green">Green colored text</span> for additions and enhancements
- Keep existing good content as normal text

Provide actual improved content in suggestions (not instructions).
`,

  IMAGE_ANALYSIS: `
Analyze these images:

{imagesData}

Rate each image field 0-100:
- Alt text quality: Consider descriptiveness, keywords, accessibility
- URL structure: Consider SEO-friendly naming

IMPORTANT: Format all suggested alt text using Markdown with:
- **Bold text** for new/improved content and key changes
- <span style="color: green">Green colored text</span> for additions and enhancements
- Keep existing good content as normal text

Provide actual improved alt text in suggestions (not instructions).
`,

  METAFIELDS_ANALYSIS: `
Analyze these metafields:

{metafieldsData}

Rate each metafield 0-100:
- Title tag quality
- Description tag quality

IMPORTANT: Format all suggested content using Markdown with:
- **Bold text** for new/improved content and key changes
- <span style="color: green">Green colored text</span> for additions and enhancements
- Keep existing good content as normal text

Provide actual improved content in suggestions (not instructions).
`,
};