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
import BrandStoryModal from './BrandStoryModal';
import { useShop } from '../contexts/ShopContext';
import ApiService from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const { shop } = useShop();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBrandStoryModalOpen, setIsBrandStoryModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState(null);
  const [error, setError] = useState(null);

  const handleScanEntireStore = useCallback(async () => {
    if (!shop) return;

    setIsScanning(true);
    setScanType('entire-store');
    setError(null);
    
    try {
      // First, get all products from the store
      console.log('Fetching all products for store scan...');
      
      let allProducts = [];
      let currentPage = 1;
      let hasMoreProducts = true;
      
      while (hasMoreProducts) {
        const response = await ApiService.getProducts(shop, {
          page: currentPage,
          limit: 50, // Fetch more products per page for efficiency
        });
        
        if (response.success && response.data.products) {
          allProducts = [...allProducts, ...response.data.products];
          hasMoreProducts = response.data.pagination.hasNextPage;
          currentPage++;
        } else {
          hasMoreProducts = false;
        }
      }

      if (allProducts.length === 0) {
        throw new Error('No products found in your store');
      }

      // Extract product IDs for SEO analysis
      const productIds = allProducts.map(product => product.id);
      
      // Perform SEO analysis
      console.log(`Analyzing SEO for ${allProducts.length} products...`);
      const seoResponse = await ApiService.analyzeSEO(shop, productIds);
      
      if (seoResponse.success) {
        // Navigate to results page with real data
        navigate('/results', {
          state: {
            scanType: 'entire-store',
            totalProducts: allProducts.length,
            products: allProducts,
            seoResults: seoResponse.data,
            issuesFound: seoResponse.data.totalIssues || 0
          }
        });
      } else {
        throw new Error('SEO analysis failed');
      }
    } catch (error) {
      console.error('Error scanning store:', error);
      setError(error.message || 'Failed to scan store');
    } finally {
      setIsScanning(false);
      setScanType(null);
    }
  }, [navigate, shop]);

  const handleScanSelectedProducts = useCallback(() => {
    setIsProductModalOpen(true);
  }, []);

  const handleProductSelectionConfirm = useCallback(async (selectedProducts) => {
    if (!shop || selectedProducts.length === 0) return;

    setIsProductModalOpen(false);
    setIsScanning(true);
    setScanType('selected-products');
    setError(null);

    try {
      console.log('Scanning selected products:', selectedProducts);
      
      // Extract product IDs for SEO analysis
      const productIds = selectedProducts.map(product => product.id);
      
      // Perform SEO analysis on selected products
      const seoResponse = await ApiService.analyzeSEO(shop, productIds);
      
      if (seoResponse.success) {
        // Navigate to results page with real data
        navigate('/results', {
          state: {
            scanType: 'selected-products',
            selectedProducts,
            totalProducts: selectedProducts.length,
            products: selectedProducts,
            seoResults: seoResponse.data,
            issuesFound: seoResponse.data.totalIssues || 0
          }
        });
      } else {
        throw new Error('SEO analysis failed');
      }
    } catch (error) {
      console.error('Error scanning selected products:', error);
      setError(error.message || 'Failed to scan selected products');
    } finally {
      setIsScanning(false);
      setScanType(null);
    }
  }, [navigate, shop]);

  const handleProductSelectionCancel = useCallback(() => {
    setIsProductModalOpen(false);
  }, []);

  const handleBrandStoryOpen = useCallback(() => {
    setIsBrandStoryModalOpen(true);
  }, []);

  const handleBrandStoryClose = useCallback(() => {
    setIsBrandStoryModalOpen(false);
  }, []);

  return (
    <Page
      title="SEO Optimizer"
      subtitle={`Analyze and optimize your store's SEO performance${shop ? ` - ${shop}` : ''}`}
    >
      <BlockStack gap="500">
        {error && (
          <Banner status="critical" title="Error">
            <p>{error}</p>
          </Banner>
        )}

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
              Brand Configuration
            </Text>
            
            <Text variant="bodyMd" color="subdued">
              Configure your brand story to generate more personalized SEO content
            </Text>

            <InlineStack gap="300">
              <Button
                onClick={handleBrandStoryOpen}
                disabled={isScanning}
              >
                Configure Brand Story
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Choose Scan Type
            </Text>
            
            <Text variant="bodyMd" color="subdued">
              Select how you'd like to analyze your store's SEO performance
            </Text>

            <InlineStack gap="400" align="start" wrap={false}>
              <div style={{ flex: 1 }}>
                <Card>
                  <div style={{ padding: '16px' }}>
                    <BlockStack gap="300">
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0 }}>
                          <Icon source={ChartVerticalIcon} color="base" />
                        </div>
                        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                          <Text variant="headingSm" as="h3">
                            Scan Entire Store
                          </Text>
                        </div>
                      </div>
                      
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
                  </div>
                </Card>
              </div>

              <div style={{ flex: 1 }}>
                <Card>
                  <div style={{ padding: '16px' }}>
                    <BlockStack gap="300">
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0 }}>
                          <Icon source={SearchIcon} color="base" />
                        </div>
                        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                          <Text variant="headingSm" as="h3">
                            Scan Selected Products
                          </Text>
                        </div>
                      </div>
                      
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
                  </div>
                </Card>
              </div>
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

      {isBrandStoryModalOpen && (
        <BrandStoryModal
          open={isBrandStoryModalOpen}
          onClose={handleBrandStoryClose}
        />
      )}
    </Page>
  );
}

export default Dashboard;