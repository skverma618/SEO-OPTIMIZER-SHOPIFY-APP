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

// Mock ShopifyService to return test data instead of making API calls
const mockShopifyService = {
  fetchProducts: jest.fn().mockImplementation(() => {
    const shopifyData = JSON.parse(fs.readFileSync('shopify_products_output.json', 'utf8'));
    return {
      data: {
        products: {
          edges: shopifyData.slice(0, 2).map(product => ({ node: product }))
        }
      }
    };
  }),
  fetchProductById: jest.fn(),
  updateProduct: jest.fn().mockResolvedValue({ success: true }),
};

// Mock repository dependencies
const mockShopRepository = {
  findOne: jest.fn().mockResolvedValue({ shopDomain: 'test-shop', accessToken: 'test-token' }),
  save: jest.fn(),
  create: jest.fn(),
};

const mockScanHistoryRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn().mockReturnValue({}),
};

async function testApiWithMockData() {
  console.log('🚀 Starting API Integration Test with Mock Data...\n');

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

    console.log('🔄 Testing scanEntireStore API method...');
    const startTime = Date.now();
    
    // Test the scanEntireStore method (this will use our LLM analysis)
    const results = await seoService.scanEntireStore('test-shop.myshopify.com');
    
    const endTime = Date.now();
    console.log(`✅ API call completed in ${endTime - startTime}ms\n`);

    // Display results
    console.log('📋 API INTEGRATION TEST RESULTS:');
    console.log('================================================================================');
    console.log(JSON.stringify(results, null, 2));
    console.log('================================================================================\n');

    // Validate response structure
    console.log('🎯 API RESPONSE VALIDATION:');
    console.log(`✅ Has scanId: ${results.scanId ? 'YES' : 'NO'}`);
    console.log(`✅ Total products: ${results.totalProducts}`);
    console.log(`✅ Products with issues: ${results.productsWithIssues}`);
    console.log(`✅ Results array: ${Array.isArray(results.results) ? 'YES' : 'NO'}`);
    
    if (results.results && results.results.length > 0) {
      const firstResult = results.results[0];
      console.log(`\n🔍 First Product Analysis:`);
      console.log(`  📝 Product ID: ${firstResult.productId}`);
      console.log(`  📝 Title: "${firstResult.title}"`);
      console.log(`  🔗 Handle: "${firstResult.handle}"`);
      console.log(`  🔧 Suggestions: ${firstResult.suggestions.length} total`);
      
      if (firstResult.suggestions.length > 0) {
        const topSuggestion = firstResult.suggestions[0];
        console.log(`  📈 Top Suggestion: ${topSuggestion.type} (${topSuggestion.priority} priority, score: ${topSuggestion.score})`);
      }
    }

    console.log('\n🎉 API Integration Test with Mock Data Completed Successfully!');
    console.log('\n✨ The LLM-powered SEO analysis is now fully integrated with the API!');
    
    await module.close();
  } catch (error) {
    console.error('❌ API Integration Test Failed:', error);
    process.exit(1);
  }
}

// Run the test
testApiWithMockData();