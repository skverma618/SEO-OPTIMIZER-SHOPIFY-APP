/**
 * Test script to demonstrate the parallel SEO analysis functionality
 * This script shows how to use the new parallel analysis service
 */

import { ParallelAnalysisInputDto } from '../../dto/seo.dto';

// Example test data based on the RYZE products from shopify_products_output.json
export const createTestAnalysisInput = (): ParallelAnalysisInputDto => {
  return {
    productContent: {
      productId: 'gid://shopify/Product/8882869141756',
      productTitle: 'RYZE Gums Frosty Mint Flavour - 2mg',
      productDescription: 'RYZE is a sugar free gum that helps manage your cravings with its controlled release formula. Easy on throat and gentle for jaw, Ryze will be your perfect companion at all testing moments.',
    },
    seoMetadata: {
      productId: 'gid://shopify/Product/8882869141756',
      productSeoTitle: 'RYZE Sugar free Gums Frosty Mint Flavor - 2mg',
      productSeoDescription: 'Buy RYZE Sugar Free Gums Frosty Mint Flavor- 2mg to help you stop smoking. Try this nicotine gum to satisfy your nicotine cravings with a burst of minty flavor.',
    },
    images: [
      {
        productId: 'gid://shopify/Product/8882869141756',
        productImageId: 'gid://shopify/ProductImage/123456789',
        productImageAltText: 'RYZE nicotine gum frosty mint flavor package',
      },
    ],
    metafields: [
      {
        productId: 'gid://shopify/Product/8882869141756',
        productMetaId: 'gid://shopify/Metafield/32337325490428',
        productMetaValue: 'RYZE Sugar free Gums Frosty Mint Flavor - 2mg',
      },
      {
        productId: 'gid://shopify/Product/8882869141756',
        productMetaId: 'gid://shopify/Metafield/32337325523196',
        productMetaValue: 'Buy RYZE Sugar Free Gums Frosty Mint Flavor- 2mg to help you stop smoking. Try this nicotine gum to satisfy your nicotine cravings with a burst of minty flavor.',
      },
    ],
  };
};

// Example of how to use the parallel analysis service
export const exampleUsage = `
// 1. Using the direct parallel analysis endpoint
POST /api/seo/analyze/parallel?shop=my-shop.myshopify.com
Content-Type: application/json

{
  "productContent": {
    "productId": "gid://shopify/Product/8882869141756",
    "productTitle": "RYZE Gums Frosty Mint Flavour - 2mg",
    "productDescription": "RYZE is a sugar free gum that helps manage your cravings..."
  },
  "seoMetadata": {
    "productId": "gid://shopify/Product/8882869141756",
    "productSeoTitle": "RYZE Sugar free Gums Frosty Mint Flavor - 2mg",
    "productSeoDescription": "Buy RYZE Sugar Free Gums Frosty Mint Flavor- 2mg..."
  },
  "images": [
    {
      "productId": "gid://shopify/Product/8882869141756",
      "productImageId": "gid://shopify/ProductImage/123456789",
      "productImageAltText": "RYZE nicotine gum frosty mint flavor package"
    }
  ],
  "metafields": [
    {
      "productId": "gid://shopify/Product/8882869141756",
      "productMetaId": "gid://shopify/Metafield/32337325490428",
      "productMetaValue": "RYZE Sugar free Gums Frosty Mint Flavor - 2mg"
    }
  ]
}

// 2. Using the automatic Shopify product fetch and analysis
POST /api/seo/analyze/product/gid://shopify/Product/8882869141756?shop=my-shop.myshopify.com

// 3. Using batch analysis for multiple products
POST /api/seo/analyze/products/batch?shop=my-shop.myshopify.com
Content-Type: application/json

{
  "productIds": [
    "gid://shopify/Product/8882869141756",
    "gid://shopify/Product/8882869240060",
    "gid://shopify/Product/8882869371132"
  ]
}

// Expected Response Structure:
{
  "success": true,
  "data": {
    "productId": "gid://shopify/Product/8882869141756",
    "overallScore": 78,
    "productContentAnalysis": {
      "score": 85,
      "suggestions": [...],
      "analysisType": "product-content",
      "feedback": "The product title is well-optimized..."
    },
    "seoMetadataAnalysis": {
      "score": 75,
      "suggestions": [...],
      "analysisType": "seo-metadata",
      "feedback": "SEO title and description need optimization..."
    },
    "imageAnalysis": {
      "score": 70,
      "suggestions": [...],
      "analysisType": "image-analysis",
      "feedback": "Image alt text could be more descriptive..."
    },
    "metafieldsAnalysis": {
      "score": 80,
      "suggestions": [...],
      "analysisType": "metafields-analysis",
      "feedback": "Metafields are well-structured..."
    },
    "allSuggestions": [
      {
        "id": "title-gid://shopify/Product/8882869141756-0",
        "type": "title",
        "priority": "high",
        "field": "seo.title",
        "current": "RYZE Sugar free Gums Frosty Mint Flavor - 2mg",
        "suggested": "RYZE Sugar Free Nicotine Gums Frosty Mint - 2mg | Quit Smoking Aid",
        "reason": "Include more specific keywords for better SEO",
        "impact": "Could improve search ranking for quit smoking related queries"
      }
    ],
    "executionTime": 2500
  },
  "message": "Product SEO analysis completed successfully"
}
`;

// Configuration requirements
export const setupInstructions = `
Setup Instructions:

1. Add OpenAI API Key to your .env file:
   OPENAI_API_KEY=your_openai_api_key_here

2. Install required dependencies (already done):
   npm install langchain @langchain/openai @langchain/core

3. The parallel analysis system includes:
   - ProductContentAnalysisWorker: Analyzes product title and description
   - SeoMetadataAnalysisWorker: Analyzes SEO title and meta description
   - ImageAnalysisWorker: Analyzes image alt text
   - MetafieldsAnalysisWorker: Analyzes product metafields
   - ParallelSeoAnalysisService: Orchestrates all workers concurrently

4. Scoring System:
   - Overall Score: Weighted average (SEO metadata 35%, Product content 30%, Images 20%, Metafields 15%)
   - Individual scores: 0-100 for each analysis type
   - Suggestions: Prioritized as high/medium/low

5. API Endpoints:
   - POST /api/seo/analyze/parallel - Direct analysis with provided data
   - POST /api/seo/analyze/product/:productId - Fetch from Shopify and analyze
   - POST /api/seo/analyze/products/batch - Batch analysis of multiple products
   - POST /api/seo/analyze/batch - Batch analysis with provided data

6. Performance:
   - All 4 workers run concurrently using Promise.allSettled
   - Batch processing with configurable concurrency (default: 3 products at a time)
   - Fallback analysis if LLM calls fail
   - Execution time tracking
`;

export default {
  createTestAnalysisInput,
  exampleUsage,
  setupInstructions,
};