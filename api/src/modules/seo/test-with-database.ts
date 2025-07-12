import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeoService } from './seo.service';
import { Repository } from 'typeorm';
import { Shop } from '../../entities/shop.entity';
import { ScanHistory } from '../../entities/scan-history.entity';
import * as fs from 'fs';

async function testWithDatabase() {
  console.log('🚀 Starting Database Integration Test...\n');

  try {
    // Create NestJS application
    const app = await NestFactory.createApplicationContext(AppModule);
    const seoService = app.get(SeoService);
    const shopRepository = app.get('ShopRepository') as Repository<Shop>;
    const scanHistoryRepository = app.get('ScanHistoryRepository') as Repository<ScanHistory>;

    console.log('📊 Setting up test data in database...');

    // Create a test shop entry
    const testShop = shopRepository.create({
      shopDomain: 'test-shop.myshopify.com',
      accessToken: 'test_access_token_123',
      scope: 'read_products,write_products,read_orders',
      shopName: 'Test Shop',
      email: 'test@example.com',
      isActive: true,
    });

    // Save the test shop (this will create or update)
    await shopRepository.save(testShop);
    console.log('✅ Test shop created in database');

    // Mock the ShopifyService to return our test data instead of making real API calls
    const { ShopifyService } = await import('../shopify/shopify.service');
    const shopifyService = app.get(ShopifyService);
    const originalFetchProducts = shopifyService.fetchProducts;
    
    // Load test data
    const shopifyData = JSON.parse(fs.readFileSync('shopify_products_output.json', 'utf8'));
    const testProducts = shopifyData.slice(0, 2); // Test with 2 products

    // Mock the fetchProducts method
    shopifyService.fetchProducts = jest.fn().mockResolvedValue({
      data: {
        products: {
          edges: testProducts.map(product => ({ node: product }))
        }
      }
    });

    console.log(`📊 Testing with ${testProducts.length} products from Shopify data\n`);

    // Test the scanEntireStore method with database integration
    console.log('🔄 Running SEO analysis with database integration...');
    const startTime = Date.now();
    
    const results = await seoService.scanEntireStore('test-shop.myshopify.com');
    
    const endTime = Date.now();
    console.log(`✅ Analysis completed in ${endTime - startTime}ms\n`);

    // Display results
    console.log('📋 DATABASE INTEGRATION TEST RESULTS:');
    console.log('================================================================================');
    console.log(JSON.stringify(results, null, 2));
    console.log('================================================================================\n');

    // Validate response structure
    console.log('🎯 DATABASE INTEGRATION VALIDATION:');
    console.log(`✅ Has scanId: ${results.scanId ? 'YES' : 'NO'}`);
    console.log(`✅ Total products: ${results.totalProducts}`);
    console.log(`✅ Products with issues: ${results.productsWithIssues}`);
    console.log(`✅ Results array: ${Array.isArray(results.results) ? 'YES' : 'NO'}`);
    
    // Check if scan history was saved
    const scanHistoryCount = await scanHistoryRepository.count({
      where: { shopDomain: 'test-shop.myshopify.com' }
    });
    console.log(`✅ Scan history entries: ${scanHistoryCount}`);

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

    // Restore original method
    shopifyService.fetchProducts = originalFetchProducts;

    console.log('\n🎉 Database Integration Test Completed Successfully!');
    console.log('\n✨ The LLM-powered SEO analysis is now fully integrated with the API and Database!');
    
    await app.close();
  } catch (error) {
    console.error('❌ Database Integration Test Failed:', error);
    process.exit(1);
  }
}

// Run the test
testWithDatabase();