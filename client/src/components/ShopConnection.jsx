import React, { useState } from 'react';
import {
  Page,
  Card,
  TextField,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Banner,
  Icon,
} from '@shopify/polaris';
import { ConnectIcon } from '@shopify/polaris-icons';
import { useShop } from '../contexts/ShopContext';

function ShopConnection() {
  const [shopDomain, setShopDomain] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectShop, error } = useShop();

  const handleConnect = async () => {
    if (!shopDomain.trim()) return;

    setIsConnecting(true);
    try {
      await connectShop(shopDomain.trim());
    } catch (err) {
      console.error('Connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleShopDomainChange = (value) => {
    // Remove any protocol and clean the input
    const cleaned = value.replace(/^https?:\/\//, '').replace(/\/$/, '');
    setShopDomain(cleaned);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleConnect();
    }
  };

  return (
    <Page title="Connect Your Shopify Store">
      <BlockStack gap="500">
        {error && (
          <Banner status="critical" title="Connection Error">
            <p>{error}</p>
          </Banner>
        )}

        <Card>
          <BlockStack gap="400">
            <InlineStack gap="200" align="center">
              <Icon source={ConnectIcon} color="base" />
              <Text variant="headingLg" as="h1">
                SEO Optimizer for Shopify
              </Text>
            </InlineStack>

            <Text variant="bodyMd" color="subdued">
              Connect your Shopify store to start optimizing your products for better search engine visibility.
            </Text>

            <BlockStack gap="300">
              <TextField
                label="Shop Domain"
                value={shopDomain}
                onChange={handleShopDomainChange}
                onKeyPress={handleKeyPress}
                placeholder="your-shop-name.myshopify.com"
                helpText="Enter your shop's .myshopify.com domain"
                autoComplete="off"
                disabled={isConnecting}
              />

              <Button
                primary
                size="large"
                onClick={handleConnect}
                loading={isConnecting}
                disabled={!shopDomain.trim() || isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect Store'}
              </Button>
            </BlockStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h2">
              What happens next?
            </Text>
            
            <BlockStack gap="200">
              <Text variant="bodyMd">
                1. You'll be redirected to Shopify to authorize the app
              </Text>
              <Text variant="bodyMd">
                2. Grant permissions to read and analyze your products
              </Text>
              <Text variant="bodyMd">
                3. Return to the app to start your SEO analysis
              </Text>
            </BlockStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h2">
              Required Permissions
            </Text>
            
            <BlockStack gap="200">
              <Text variant="bodyMd">
                • <strong>Read Products:</strong> To analyze your product information and SEO data
              </Text>
              <Text variant="bodyMd">
                • <strong>Write Products:</strong> To apply SEO improvements to your products
              </Text>
              <Text variant="bodyMd">
                • <strong>Read Product Listings:</strong> To access product visibility settings
              </Text>
            </BlockStack>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}

export default ShopConnection;