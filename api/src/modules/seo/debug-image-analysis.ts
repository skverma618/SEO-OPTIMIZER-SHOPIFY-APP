import { ImageAnalysisWorker } from './workers/image-analysis.worker';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

// Mock ConfigService for testing
class MockConfigService {
  get(key: string): string {
    const envVars = {
      'OPENAI_API_KEY': process.env.OPENAI_API_KEY || 'test-key',
    };
    return envVars[key] || '';
  }
}

async function debugImageAnalysis() {
  console.log('🔍 Debugging Image Analysis Worker...\n');

  // Load real Shopify data
  const shopifyDataPath = path.join(process.cwd(), 'shopify_products_output.json');
  const shopifyData = JSON.parse(fs.readFileSync(shopifyDataPath, 'utf8'));
  
  const testProduct = shopifyData.products[0]; // Gift Card
  console.log(`📦 Testing with product: "${testProduct.title}"`);
  
  // Transform to our input format
  const imageInputs = testProduct.images.edges.map((edge: any) => ({
    productId: testProduct.id,
    productImageId: edge.node.id,
    productImageUrl: edge.node.url,
    productImageAltText: edge.node.altText || '',
  }));

  console.log('📸 Image inputs:');
  imageInputs.forEach((input, index) => {
    console.log(`  Image ${index + 1}:`);
    console.log(`    ID: ${input.productImageId}`);
    console.log(`    URL: ${input.productImageUrl}`);
    console.log(`    Alt Text: "${input.productImageAltText}"`);
    console.log(`    Alt Text Length: ${input.productImageAltText.length}`);
  });

  // Initialize worker
  const configService = new MockConfigService();
  const imageWorker = new ImageAnalysisWorker(configService as any);

  try {
    console.log('\n🔄 Running image analysis...');
    
    // Add some debug logging to the worker temporarily
    console.log('🔧 Debug: About to call analyzeImageAltText with inputs:', JSON.stringify(imageInputs, null, 2));
    
    const result = await imageWorker.analyzeImageAltText(imageInputs);
    
    console.log('🔧 Debug: Raw result from worker:', JSON.stringify(result, null, 2));
    
    console.log('\n📊 Results:');
    console.log(`Score: ${result.score}`);
    console.log(`Suggestions: ${result.suggestions.length}`);
    console.log(`Field Scores: ${result.fieldScores?.length || 0}`);
    console.log(`Feedback: "${result.feedback}"`);
    
    if (result.fieldScores && result.fieldScores.length > 0) {
      console.log('\n🎯 Field Scores:');
      result.fieldScores.forEach(field => {
        console.log(`  • ${field.field}: ${field.score}/100 - ${field.description}`);
      });
    } else {
      console.log('\n❌ No field scores returned!');
    }

    if (result.suggestions.length > 0) {
      console.log('\n💡 Suggestions:');
      result.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion.field}: ${suggestion.reason}`);
      });
    }

    // Save debug results
    const debugPath = path.join(process.cwd(), 'debug-image-analysis-results.json');
    fs.writeFileSync(debugPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      imageInputs,
      result
    }, null, 2));
    
    console.log(`\n💾 Debug results saved to: ${debugPath}`);

  } catch (error) {
    console.error('❌ Error during image analysis:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the debug
if (require.main === module) {
  debugImageAnalysis()
    .then(() => {
      console.log('\n🎉 Debug completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Debug failed:', error);
      process.exit(1);
    });
}

export { debugImageAnalysis };