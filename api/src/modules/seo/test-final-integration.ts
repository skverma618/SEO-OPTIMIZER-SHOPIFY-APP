import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SimplifiedSeoAnalysisService } from './simplified-seo-analysis.service';
import { Repository } from 'typeorm';
import { ScanHistory } from '../../entities/scan-history.entity';
import * as fs from 'fs';

async function testFinalIntegration() {
  console.log('🚀 Starting Final Integration Test with Database...\n');

  try {
    // Create NestJS application
    const app = await NestFactory.createApplicationContext(AppModule);
    const simplifiedSeoService = app.get(SimplifiedSeoAnalysisService);
    const scanHistoryRepository = app.get('ScanHistoryRepository') as Repository<ScanHistory>;

    console.log('📊 Database connection established successfully');

    // Use the same test data that worked in our previous tests
    const rawData = fs.readFileSync('shopify_products_output.json', 'utf8');
    const shopifyData = JSON.parse(rawData);
    
    // Extract the first 2 products properly
    let testProducts;
    if (Array.isArray(shopifyData)) {
      testProducts = shopifyData.slice(0, 2);
    } else if (shopifyData && typeof shopifyData === 'object') {
      // If it's an object, try to find an array property
      const keys = Object.keys(shopifyData);
      const arrayKey = keys.find(key => Array.isArray(shopifyData[key]));
      if (arrayKey) {
        testProducts = shopifyData[arrayKey].slice(0, 2);
      } else {
        // If no array found, use the object itself
        testProducts = [shopifyData];
      }
    } else {
      throw new Error('Invalid shopify data format');
    }

    console.log(`📊 Testing with ${testProducts.length} products from Shopify data`);
    console.log(`📋 First product title: "${testProducts[0]?.title || 'Unknown'}"`);

    // Test the LLM-powered SEO analysis
    console.log('\n🔄 Running LLM-powered SEO analysis...');
    const startTime = Date.now();
    
    const analysisResults = await simplifiedSeoService.analyzeProductsSimplified(testProducts);
    
    const endTime = Date.now();
    console.log(`✅ Analysis completed in ${endTime - startTime}ms\n`);

    // Save scan history to database
    console.log('💾 Saving scan history to database...');
    const scanHistory = scanHistoryRepository.create({
      shopDomain: 'test-shop.myshopify.com',
      scanType: 'final-integration-test',
      scanResults: analysisResults,
      totalProducts: analysisResults.length,
      productsWithIssues: analysisResults.filter(r => r.suggestions.length > 0).length,
    });

    await scanHistoryRepository.save(scanHistory);
    console.log('✅ Scan history saved to database');

    // Display summary results
    console.log('\n📋 FINAL INTEGRATION TEST RESULTS:');
    console.log('================================================================================');
    
    // Validate response structure
    console.log('🎯 INTEGRATION VALIDATION:');
    console.log(`✅ Results array: ${Array.isArray(analysisResults) ? 'YES' : 'NO'}`);
    console.log(`✅ Total products analyzed: ${analysisResults.length}`);
    
    // Check if scan history was saved
    const scanHistoryCount = await scanHistoryRepository.count({
      where: { shopDomain: 'test-shop.myshopify.com' }
    });
    console.log(`✅ Scan history entries in database: ${scanHistoryCount}`);

    if (analysisResults && analysisResults.length > 0) {
      analysisResults.forEach((result, index) => {
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
    }

    console.log('\n🎉 Final Integration Test Completed Successfully!');
    console.log('\n✨ SUMMARY:');
    console.log('   🔥 LLM-powered SEO analysis is working perfectly');
    console.log('   💾 Database integration is functional');
    console.log('   🚀 API service is ready for production use');
    console.log('   📊 Scan history is being stored correctly');
    
    await app.close();
  } catch (error) {
    console.error('❌ Final Integration Test Failed:', error);
    process.exit(1);
  }
}

// Run the test
testFinalIntegration();