export const TASK_PROMPTS = {
  PRODUCT_CONTENT_ANALYSIS: `Analyze the following product content for SEO optimization:

Product ID: {productId}
Product Title: {productTitle}
Product Description: {productDescription}

Evaluate the content based on these criteria:
1. Title optimization (length: 30-60 characters ideal)
2. Keyword usage and relevance
3. Description quality and informativeness
4. Call-to-action presence and effectiveness
5. Brand mention and positioning
6. Target audience clarity
7. Content structure and readability
8. Conversion potential

REQUIRED OUTPUT FORMAT:
- score: A number between 0-100
- feedback: A string with overall analysis summary
- suggestions: An array of suggestion objects, each containing:
  * type: One of ['title', 'description', 'meta-description', 'alt-text', 'structured-data', 'missing-metafields', 'duplicate-content', 'schema-markup', 'rich-snippets', 'brand-category-info', 'technical-seo', 'e-commerce-optimizations', 'keywords', 'metafield', 'call-to-action']
  * priority: One of ['high', 'medium', 'low']
  * field: String describing the field being analyzed
  * current: String with current content
  * suggested: String with suggested improvement
  * reason: String explaining why this change is needed
  * impact: String describing the expected impact of this change

You MUST provide at least one suggestion. If no improvements are needed, provide a low-priority suggestion for minor enhancements.`,

  SEO_METADATA_ANALYSIS: `Analyze the following SEO metadata for search engine optimization:

Product ID: {productId}
SEO Title: {productSeoTitle}
SEO Description: {productSeoDescription}

Evaluate the metadata based on these criteria:
1. SEO title length (optimal: 50-60 characters)
2. Meta description length (optimal: 150-160 characters)
3. Keyword placement and density
4. Click-through rate optimization
5. Uniqueness and relevance
6. Call-to-action in meta description
7. Brand inclusion strategy
8. Search intent matching
9. SERP snippet optimization
10. Competitive advantage

REQUIRED OUTPUT FORMAT:
- score: A number between 0-100
- feedback: A string with overall analysis summary
- suggestions: An array of suggestion objects, each containing:
  * type: One of ['title', 'description', 'meta-description', 'alt-text', 'structured-data', 'missing-metafields', 'duplicate-content', 'schema-markup', 'rich-snippets', 'brand-category-info', 'technical-seo', 'e-commerce-optimizations', 'keywords', 'metafield', 'call-to-action']
  * priority: One of ['high', 'medium', 'low']
  * field: String describing the field being analyzed
  * current: String with current content
  * suggested: String with suggested improvement
  * reason: String explaining why this change is needed
  * impact: String describing the expected impact of this change

You MUST provide at least one suggestion. If no improvements are needed, provide a low-priority suggestion for minor enhancements.`,

  IMAGE_ANALYSIS: `Analyze the following product images for SEO and accessibility optimization:

Product Images Data:
{imagesData}

Evaluate each image based on these criteria:
1. Alt text presence and quality
2. Descriptiveness and accuracy
3. Keyword inclusion (natural, not stuffed)
4. Accessibility compliance (WCAG guidelines)
5. Length optimization (50-125 characters ideal)
6. Uniqueness across images
7. Product relevance and context
8. Brand mention when appropriate
9. Screen reader compatibility
10. Image search optimization

REQUIRED OUTPUT FORMAT:
- score: A number between 0-100
- feedback: A string with overall analysis summary
- suggestions: An array of suggestion objects, each containing:
  * type: One of ['title', 'description', 'meta-description', 'alt-text', 'structured-data', 'missing-metafields', 'duplicate-content', 'schema-markup', 'rich-snippets', 'brand-category-info', 'technical-seo', 'e-commerce-optimizations', 'keywords', 'metafield', 'call-to-action']
  * priority: One of ['high', 'medium', 'low']
  * field: String describing the field being analyzed
  * current: String with current content (use "MISSING" if alt text is not present)
  * suggested: String with suggested improvement
  * reason: String explaining why this change is needed
  * impact: String describing the expected impact of this change

You MUST provide at least one suggestion for each image that needs improvement.`,

  METAFIELDS_ANALYSIS: `Analyze the following product metafields for SEO enhancement opportunities:

Product Metafields Data:
{metafieldsData}

Evaluate the metafields based on these criteria:
1. SEO-relevant metafields (title_tag, description_tag, keywords)
2. Structured data potential (reviews, ratings, product details)
3. Content quality and optimization
4. Missing important metafields
5. Duplicate or redundant content
6. Schema markup opportunities
7. Rich snippets potential
8. Brand and category information
9. Technical SEO enhancements
10. E-commerce specific optimizations

REQUIRED OUTPUT FORMAT:
- score: A number between 0-100
- feedback: A string with overall analysis summary
- suggestions: An array of suggestion objects, each containing:
  * type: One of ['title', 'description', 'meta-description', 'alt-text', 'structured-data', 'missing-metafields', 'duplicate-content', 'schema-markup', 'rich-snippets', 'brand-category-info', 'technical-seo', 'e-commerce-optimizations', 'keywords', 'metafield', 'call-to-action']
  * priority: One of ['high', 'medium', 'low']
  * field: String describing the field being analyzed
  * current: String with current content (use "Not implemented" or "Missing" if not present)
  * suggested: String with suggested improvement
  * reason: String explaining why this change is needed
  * impact: String describing the expected impact of this change

You MUST provide at least one suggestion. Focus on leveraging metafields for enhanced search visibility and rich snippets.`
};