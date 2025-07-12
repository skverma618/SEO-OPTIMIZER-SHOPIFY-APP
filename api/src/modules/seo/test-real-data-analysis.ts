import { ConfigService } from '@nestjs/config';
import { ParallelSeoAnalysisService } from './parallel-seo-analysis.service';
import { ProductDataTransformerService } from './product-data-transformer.service';
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

async function testRealDataAnalysis() {
  console.log('🚀 Starting Real Data SEO Analysis Test...\n');

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

    // Transform all products for batch processing
    console.log('\n⚙️  Transforming product data for batch analysis...');
    const transformedProducts = shopifyData.products.map(product => {
      console.log(`📦 Transforming: "${product.title}"`);
      return transformerService.transformShopifyProductToAnalysisInput(product);
    });

    console.log('\n🚀 Running BATCH parallel SEO analysis for all products...');
    const batchStartTime = Date.now();

    // Run batch analysis - this will return an array of results
    const batchResults = await parallelSeoService.analyzeMultipleProducts(transformedProducts);
    
    const batchEndTime = Date.now();
    const batchDuration = batchEndTime - batchStartTime;

    console.log(`\n✅ Batch Analysis completed in ${batchDuration}ms`);
    console.log('\n📊 BATCH ANALYSIS RESULTS:');
    console.log('=' .repeat(80));
    
    // Display results for each product
    batchResults.forEach((analysisResult, index) => {
      const product = shopifyData.products[index];
      
      console.log(`\n🔍 Product ${index + 1}: "${product.title}"`);
      console.log(`📝 Product ID: ${analysisResult.productId}`);
      console.log(`⏱️  Analysis Duration: ${analysisResult.executionTime}ms`);
      
      // Overall score
      console.log(`🎯 Overall SEO Score: ${analysisResult.overallScore}/100`);
      console.log(`📈 Performance: ${analysisResult.overallScore >= 80 ? '🟢 Excellent' : analysisResult.overallScore >= 60 ? '🟡 Good' : '🔴 Needs Improvement'}`);
      
      // Individual scores
      console.log('\n📋 Individual Analysis Scores:');
      const results = [
        analysisResult.productContentAnalysis,
        analysisResult.seoMetadataAnalysis,
        analysisResult.imageAnalysis,
        analysisResult.metafieldsAnalysis
      ];
      
      results.forEach(result => {
        const emoji = result.score >= 80 ? '🟢' : result.score >= 60 ? '🟡' : '🔴';
        console.log(`  ${emoji} ${result.analysisType}: ${result.score}/100`);
      });

      // Top suggestions count
      const highPrioritySuggestions = analysisResult.allSuggestions
        .filter(suggestion => suggestion.priority === 'high');
      
      console.log(`\n🔧 Suggestions: ${analysisResult.allSuggestions.length} total (${highPrioritySuggestions.length} high priority)`);
      
      console.log('-'.repeat(60));
    });

    // Batch summary
    const summary = parallelSeoService.getAnalysisSummary(batchResults);
    console.log('\n📈 BATCH SUMMARY:');
    console.log(`  • Products Analyzed: ${batchResults.length}`);
    console.log(`  • Average SEO Score: ${summary.averageScore}/100`);
    console.log(`  • Total Suggestions: ${summary.totalSuggestions}`);
    console.log(`  • High Priority Issues: ${summary.highPrioritySuggestions}`);
    console.log(`  • Total Analysis Time: ${summary.analysisTime}ms`);
    console.log(`  • Batch Processing Time: ${batchDuration}ms`);

    // Show the array structure
    console.log('\n🗂️  RESPONSE STRUCTURE:');
    console.log('Array of analysis results:');
    batchResults.forEach((result, index) => {
      console.log(`  [${index}] Product: ${result.productId.split('/').pop()}`);
      console.log(`      Score: ${result.overallScore}/100`);
      console.log(`      Suggestions: ${result.allSuggestions.length}`);
      console.log(`      Duration: ${result.executionTime}ms`);
    });

    console.log('\n🎉 Real Data Analysis Test Completed Successfully!');
    console.log('\n📈 Summary:');
    console.log(`  • Products Analyzed: ${shopifyData.products.length}`);
    console.log(`  • Analysis System: Parallel LangChain Workers with Structured Output`);
    console.log(`  • Prompt System: Separated System & Task Prompts`);
    console.log(`  • Schema Validation: Zod-based structured responses`);

  } catch (error) {
    console.error('❌ Error during analysis:', error);
    if (error.message.includes('OPENAI_API_KEY')) {
      console.log('\n💡 Make sure to set your OPENAI_API_KEY in the .env file');
    }
  }
}

// Run the test
testRealDataAnalysis();