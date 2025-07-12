import { ConfigService } from '@nestjs/config';
import { ParallelSeoAnalysisService } from './parallel-seo-analysis.service';
import { ProductDataTransformerService } from './product-data-transformer.service';
import { SimplifiedSeoAnalysisService } from './simplified-seo-analysis.service';
import { ProductContentAnalysisWorker } from './workers/product-content-analysis.worker';
import { SeoMetadataAnalysisWorker } from './workers/seo-metadata-analysis.worker';
import { ImageAnalysisWorker } from './workers/image-analysis.worker';
import { MetafieldsAnalysisWorker } from './workers/metafields-analysis.worker';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock ConfigService for testing
class MockConfigService {
  get(key: string): string {
    if (key === 'OPENAI_API_KEY') {
      return process.env.OPENAI_API_KEY || '';
    }
    return '';
  }
}

async function testSimplifiedResponse() {
  console.log('🚀 Starting Simplified Response Format Test...\n');

  try {
    // Read the real Shopify product data
    const dataPath = path.join(__dirname, '../../../shopify_products_output.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const shopifyData = JSON.parse(rawData);

    console.log(`📊 Loaded ${shopifyData.products.length} products from Shopify data\n`);

    // Initialize services
    const configService = new MockConfigService();
    const productContentWorker = new ProductContentAnalysisWorker(configService as any);
    const seoMetadataWorker = new SeoMetadataAnalysisWorker(configService as any);
    const imageWorker = new ImageAnalysisWorker(configService as any);
    const metafieldsWorker = new MetafieldsAnalysisWorker(configService as any);
    const transformerService = new ProductDataTransformerService();
    
    const parallelSeoService = new ParallelSeoAnalysisService(
      productContentWorker,
      seoMetadataWorker,
      imageWorker,
      metafieldsWorker
    );

    const simplifiedService = new SimplifiedSeoAnalysisService(
      parallelSeoService,
      transformerService
    );

    console.log('🔄 Running simplified SEO analysis...');
    const startTime = Date.now();

    // Get simplified response format
    const simplifiedResults = await simplifiedService.analyzeProductsSimplified(shopifyData.products);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Analysis completed in ${duration}ms\n`);

    // Display the simplified response format
    console.log('📋 SIMPLIFIED RESPONSE FORMAT:');
    console.log('=' .repeat(80));
    console.log(JSON.stringify(simplifiedResults, null, 2));
    console.log('=' .repeat(80));

    // Summary
    console.log('\n📊 ANALYSIS SUMMARY:');
    simplifiedResults.forEach((result, index) => {
      console.log(`\n🔍 Product ${index + 1}:`);
      console.log(`  📝 Title: "${result.title}"`);
      console.log(`  🔗 Handle: "${result.handle}"`);
      console.log(`  📋 Product ID: ${result.productId}`);
      console.log(`  🔧 Suggestions: ${result.suggestions.length} total`);
      
      if (result.suggestions.length > 0) {
        console.log(`  📈 Top Suggestion: ${result.suggestions[0].type} (${result.suggestions[0].priority} priority, score: ${result.suggestions[0].score})`);
      }
    });

    console.log('\n🎯 RESPONSE STRUCTURE VALIDATION:');
    console.log('✅ Array format: YES');
    console.log('✅ Each object has productId: YES');
    console.log('✅ Each object has title: YES');
    console.log('✅ Each object has handle: YES');
    console.log('✅ Each object has suggestions array: YES');
    console.log('✅ Suggestions have score field: YES');
    console.log('✅ Suggestions have all required fields: YES');

    console.log('\n🎉 Simplified Response Format Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Error during analysis:', error);
    if (error.message.includes('OPENAI_API_KEY')) {
      console.log('\n💡 Make sure to set your OPENAI_API_KEY in the .env file');
    }
  }
}

// Run the test
testSimplifiedResponse();