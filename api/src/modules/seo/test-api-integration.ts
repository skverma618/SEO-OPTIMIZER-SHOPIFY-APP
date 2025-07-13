import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeoService } from './seo.service';
import * as fs from 'fs';

async function testApiIntegration() {
  console.log('🚀 Starting API Integration Test...\n');

  try {
    // Create NestJS application
    const app = await NestFactory.createApplicationContext(AppModule);
    const seoService = app.get(SeoService);

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
    console.log('📋 API INTEGRATION TEST RESULTS:');
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

    console.log('\n🎉 API Integration Test Completed Successfully!');
    
    await app.close();
  } catch (error) {
    console.error('❌ API Integration Test Failed:', error);
    process.exit(1);
  }
}

// Run the test
testApiIntegration();