import React, { useState, useCallback } from 'react';
import {
  Page,
  Card,
  Button,
  ButtonGroup,
  Text,
  BlockStack,
  InlineStack,
  Icon,
  Banner,
} from '@shopify/polaris';
import { SearchIcon, ChartVerticalIcon } from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import ProductSelectionModal from './ProductSelectionModal';

function Dashboard() {
  const navigate = useNavigate();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState(null);

  const handleScanEntireStore = useCallback(async () => {
    setIsScanning(true);
    setScanType('entire-store');
    
    try {
      // TODO: Implement API call to scan entire store
      console.log('Scanning entire store...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to results page
      navigate('/results', { 
        state: { 
          scanType: 'entire-store',
          totalProducts: 150, // Mock data
          issuesFound: 45 
        } 
      });
    } catch (error) {
      console.error('Error scanning store:', error);
    } finally {
      setIsScanning(false);
      setScanType(null);
    }
  }, [navigate]);

  const handleScanSelectedProducts = useCallback(() => {
    setIsProductModalOpen(true);
  }, []);

  const handleProductSelectionConfirm = useCallback(async (selectedProducts) => {
    setIsProductModalOpen(false);
    setIsScanning(true);
    setScanType('selected-products');

    try {
      // TODO: Implement API call to scan selected products
      console.log('Scanning selected products:', selectedProducts);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to results page
      navigate('/results', { 
        state: { 
          scanType: 'selected-products',
          selectedProducts,
          totalProducts: selectedProducts.length,
          issuesFound: Math.floor(selectedProducts.length * 0.3) // Mock 30% have issues
        } 
      });
    } catch (error) {
      console.error('Error scanning selected products:', error);
    } finally {
      setIsScanning(false);
      setScanType(null);
    }
  }, [navigate]);

  const handleProductSelectionCancel = useCallback(() => {
    setIsProductModalOpen(false);
  }, []);

  return (
    <Page
      title="SEO Optimizer"
      subtitle="Analyze and optimize your store's SEO performance"
    >
      <BlockStack gap="500">
        <Banner
          title="Welcome to SEO Optimizer"
          status="info"
        >
          <p>
            Scan your products to identify SEO opportunities including keyword optimization, 
            meta descriptions, image alt text, and technical SEO improvements.
          </p>
        </Banner>

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Choose Scan Type
            </Text>
            
            <Text variant="bodyMd" color="subdued">
              Select how you'd like to analyze your store's SEO performance
            </Text>

            <InlineStack gap="400" align="start">
              <Card sectioned>
                <BlockStack gap="300">
                  <InlineStack gap="200" align="center">
                    <Icon source={ChartVerticalIcon} color="base" />
                    <Text variant="headingSm" as="h3">
                      Scan Entire Store
                    </Text>
                  </InlineStack>
                  
                  <Text variant="bodyMd" color="subdued">
                    Analyze all products in your store for SEO opportunities. 
                    This may take a few minutes for large stores.
                  </Text>
                  
                  <Button
                    primary
                    size="large"
                    onClick={handleScanEntireStore}
                    loading={isScanning && scanType === 'entire-store'}
                    disabled={isScanning}
                  >
                    {isScanning && scanType === 'entire-store' 
                      ? 'Scanning Store...' 
                      : 'Scan Entire Store'
                    }
                  </Button>
                </BlockStack>
              </Card>

              <Card sectioned>
                <BlockStack gap="300">
                  <InlineStack gap="200" align="center">
                    <Icon source={SearchIcon} color="base" />
                    <Text variant="headingSm" as="h3">
                      Scan Selected Products
                    </Text>
                  </InlineStack>
                  
                  <Text variant="bodyMd" color="subdued">
                    Choose specific products to analyze. Perfect for testing 
                    or focusing on your most important products.
                  </Text>
                  
                  <Button
                    onClick={handleScanSelectedProducts}
                    loading={isScanning && scanType === 'selected-products'}
                    disabled={isScanning}
                    size="large"
                  >
                    {isScanning && scanType === 'selected-products' 
                      ? 'Scanning Products...' 
                      : 'Select Products'
                    }
                  </Button>
                </BlockStack>
              </Card>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h2">
              What We Analyze
            </Text>
            
            <BlockStack gap="200">
              <Text variant="bodyMd">
                • <strong>Keywords:</strong> Research and suggest high-intent keywords for your products
              </Text>
              <Text variant="bodyMd">
                • <strong>Meta Tags:</strong> Optimize titles and descriptions for search engines
              </Text>
              <Text variant="bodyMd">
                • <strong>Image Alt Text:</strong> Ensure all images have SEO-friendly descriptions
              </Text>
              <Text variant="bodyMd">
                • <strong>Technical SEO:</strong> Fix broken links, redirects, and missing schema
              </Text>
              <Text variant="bodyMd">
                • <strong>Content Quality:</strong> Improve product descriptions for better rankings
              </Text>
            </BlockStack>
          </BlockStack>
        </Card>
      </BlockStack>

      {isProductModalOpen && (
        <ProductSelectionModal
          open={isProductModalOpen}
          onConfirm={handleProductSelectionConfirm}
          onCancel={handleProductSelectionCancel}
        />
      )}
    </Page>
  );
}

export default Dashboard;