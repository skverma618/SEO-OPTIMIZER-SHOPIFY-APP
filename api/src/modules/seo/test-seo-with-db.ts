import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SimplifiedSeoAnalysisService } from './simplified-seo-analysis.service';
import { Repository } from 'typeorm';
import { ScanHistory } from '../../entities/scan-history.entity';
import * as fs from 'fs';

async function testSeoWithDatabase() {
  console.log('🚀 Starting SEO Analysis with Database Test...\n');

  try {
    // Create NestJS application
    const app = await NestFactory.createApplicationContext(AppModule);
    const simplifiedSeoService = app.get(SimplifiedSeoAnalysisService);
    const scanHistoryRepository = app.get('ScanHistoryRepository') as Repository<ScanHistory>;

    console.log('📊 Database connection established successfully');

    // Load test data
    const shopifyData = JSON.parse(fs.readFileSync('shopify_products_output.json', 'utf8'));
    // Handle both array and object formats
    const testProducts = Array.isArray(shopifyData) ? shopifyData.slice(0, 2) : [shopifyData].slice(0, 2);

    console.log(`📊 Testing with ${testProducts.length} products from Shopify data\n`);

    // Test the LLM-powered SEO analysis
    console.log('🔄 Running LLM-powered SEO analysis...');
    const startTime = Date.now();
    
    const analysisResults = await simplifiedSeoService.analyzeProductsSimplified(testProducts);
    
    const endTime = Date.now();
    console.log(`✅ Analysis completed in ${endTime - startTime}ms\n`);

    // Save scan history to database
    console.log('💾 Saving scan history to database...');
    const scanHistory = scanHistoryRepository.create({
      shopDomain: 'test-shop.myshopify.com',
      scanType: 'llm-analysis-test',
      scanResults: analysisResults,
      totalProducts: analysisResults.length,
      productsWithIssues: analysisResults.filter(r => r.suggestions.length > 0).length,
    });

    await scanHistoryRepository.save(scanHistory);
    console.log('✅ Scan history saved to database');

    // Display results
    console.log('\n📋 SEO ANALYSIS WITH DATABASE TEST RESULTS:');
    console.log('================================================================================');
    console.log(JSON.stringify(analysisResults, null, 2));
    console.log('================================================================================\n');

    // Validate response structure
    console.log('🎯 DATABASE INTEGRATION VALIDATION:');
    console.log(`✅ Results array: ${Array.isArray(analysisResults) ? 'YES' : 'NO'}`);
    console.log(`✅ Total products analyzed: ${analysisResults.length}`);
    
    // Check if scan history was saved
    const scanHistoryCount = await scanHistoryRepository.count({
      where: { shopDomain: 'test-shop.myshopify.com' }
    });
    console.log(`✅ Scan history entries in database: ${scanHistoryCount}`);

    if (analysisResults && analysisResults.length > 0) {
      const firstResult = analysisResults[0];
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

    console.log('\n🎉 SEO Analysis with Database Test Completed Successfully!');
    console.log('\n✨ The LLM-powered SEO analysis is working and can store results in the database!');
    
    await app.close();
  } catch (error) {
    console.error('❌ SEO Analysis with Database Test Failed:', error);
    process.exit(1);
  }
}

// Run the test
testSeoWithDatabase();