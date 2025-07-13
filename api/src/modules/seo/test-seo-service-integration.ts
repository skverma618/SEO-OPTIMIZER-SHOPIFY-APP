import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { SeoService } from './seo.service';
import { SimplifiedSeoAnalysisService } from './simplified-seo-analysis.service';
import { ParallelSeoAnalysisService } from './parallel-seo-analysis.service';
import { ProductContentAnalysisWorker } from './workers/product-content-analysis.worker';
import { SeoMetadataAnalysisWorker } from './workers/seo-metadata-analysis.worker';
import { ImageAnalysisWorker } from './workers/image-analysis.worker';
import { MetafieldsAnalysisWorker } from './workers/metafields-analysis.worker';
import { ProductDataTransformerService } from './product-data-transformer.service';
import { ShopifyService } from '../shopify/shopify.service';
import * as fs from 'fs';

// Mock ShopifyService since we don't need actual Shopify API calls
const mockShopifyService = {
  fetchProducts: jest.fn(),
  fetchProductById: jest.fn(),
  updateProduct: jest.fn(),
};

// Mock repository dependencies
const mockShopRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

const mockScanHistoryRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

async function testSeoServiceIntegration() {
  console.log('🚀 Starting SEO Service Integration Test...\n');

  try {
    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [
        SeoService,
        SimplifiedSeoAnalysisService,
        ParallelSeoAnalysisService,
        ProductContentAnalysisWorker,
        SeoMetadataAnalysisWorker,
        ImageAnalysisWorker,
        MetafieldsAnalysisWorker,
        ProductDataTransformerService,
        {
          provide: ShopifyService,
          useValue: mockShopifyService,
        },
        {
          provide: 'ShopRepository',
          useValue: mockShopRepository,
        },
        {
          provide: 'ScanHistoryRepository',
          useValue: mockScanHistoryRepository,
        },
      ],
    }).compile();

    const seoService = module.get<SeoService>(SeoService);

    // Load test data
    const shopifyData = JSON.parse(fs.readFileSync('shopify_products_output.json', 'utf8'));
    const testProducts = shopifyData.slice(0, 2); // Test with 2 products

    console.log(`📊 Testing with ${testProducts.length} products from Shopify data\n`);

    // Test the analyzeProductsForSEO method directly
    console.log('🔄 Running SEO analysis through API service...');
    const startTime = Date.now();
    
    const results = await (seoService as any).analyzeProductsForSEO(testProducts);
    
    const endTime = Date.now();
    console.log(`✅ Analysis completed in ${endTime - startTime}ms\n`);

    // Display results
    console.log('📋 SEO SERVICE INTEGRATION TEST RESULTS:');
    console.log('================================================================================');
    console.log(JSON.stringify(results, null, 2));
    console.log('================================================================================\n');

    // Validate response structure
    console.log('🎯 RESPONSE VALIDATION:');
    console.log(`✅ Array format: ${Array.isArray(results) ? 'YES' : 'NO'}`);
    console.log(`✅ Total products analyzed: ${results.length}`);
    
    results.forEach((result, index) => {
      console.log(`\n🔍 Product ${index + 1}:`);
      console.log(`  📝 Product ID: ${result.productId}`);
      console.log(`  📝 Title: "${result.title}"`);
      console.log(`  🔗 Handle: "${result.handle}"`);
      console.log(`  🔧 Suggestions: ${result.suggestions.length} total`);
      
      if (result.suggestions.length > 0) {
        const topSuggestion = result.suggestions[0];
        console.log(`  📈 Top Suggestion: ${topSuggestion.type} (${topSuggestion.priority} priority, score: ${topSuggestion.score})`);
      }
    });

    console.log('\n🎉 SEO Service Integration Test Completed Successfully!');
    
    await module.close();
  } catch (error) {
    console.error('❌ SEO Service Integration Test Failed:', error);
    process.exit(1);
  }
}

// Run the test
testSeoServiceIntegration();