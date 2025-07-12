import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  Card,
  TextField,
  ResourceList,
  ResourceItem,
  Checkbox,
  Button,
  ButtonGroup,
  Text,
  BlockStack,
  InlineStack,
  Pagination,
  EmptyState,
  Spinner,
  Banner,
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';

// Mock product data - in real app, this would come from Shopify API
const mockProducts = Array.from({ length: 50 }, (_, index) => ({
  id: `product-${index + 1}`,
  title: `Product ${index + 1}`,
  handle: `product-${index + 1}`,
  status: Math.random() > 0.2 ? 'active' : 'draft',
  totalInventory: Math.floor(Math.random() * 100),
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  image: {
    url: `https://picsum.photos/60/60?random=${index}`,
    altText: `Product ${index + 1} image`,
  },
  vendor: ['Acme Corp', 'Best Products', 'Quality Goods', 'Premium Brand'][Math.floor(Math.random() * 4)],
  productType: ['Electronics', 'Clothing', 'Home & Garden', 'Sports'][Math.floor(Math.random() * 4)],
}));

function ProductSelectionModal({ open, onConfirm, onCancel }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  
  const productsPerPage = 10;

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.productType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate filtered products
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  // Load products (simulate API call)
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      // Simulate API loading
      setTimeout(() => {
        setProducts(mockProducts);
        setIsLoading(false);
      }, 500);
    }
  }, [open]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedProducts([]);
      setCurrentPage(1);
    }
  }, [open]);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleProductSelection = useCallback((productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const currentPageProductIds = paginatedProducts.map(product => product.id);
    const allCurrentSelected = currentPageProductIds.every(id => selectedProducts.includes(id));
    
    if (allCurrentSelected) {
      // Deselect all on current page
      setSelectedProducts(prev => prev.filter(id => !currentPageProductIds.includes(id)));
    } else {
      // Select all on current page
      setSelectedProducts(prev => {
        const newSelection = [...prev];
        currentPageProductIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  }, [paginatedProducts, selectedProducts]);

  const handleConfirm = useCallback(() => {
    const selectedProductData = products.filter(product => 
      selectedProducts.includes(product.id)
    );
    onConfirm(selectedProductData);
  }, [selectedProducts, products, onConfirm]);

  const handlePageChange = useCallback((direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'previous' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage, totalPages]);

  const renderProductItem = useCallback((product) => {
    const isSelected = selectedProducts.includes(product.id);
    
    return (
      <ResourceItem
        id={product.id}
        key={product.id}
        media={
          <img
            src={product.image.url}
            alt={product.image.altText}
            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
          />
        }
        accessibilityLabel={`Select ${product.title}`}
      >
        <InlineStack gap="300" align="space-between">
          <BlockStack gap="100">
            <InlineStack gap="200" align="start">
              <Checkbox
                checked={isSelected}
                onChange={() => handleProductSelection(product.id)}
                ariaLabel={`Select ${product.title}`}
              />
              <BlockStack gap="050">
                <Text variant="bodyMd" fontWeight="semibold">
                  {product.title}
                </Text>
                <Text variant="bodySm" color="subdued">
                  {product.vendor} • {product.productType}
                </Text>
                <Text variant="bodySm" color="subdued">
                  Status: {product.status} • Inventory: {product.totalInventory}
                </Text>
              </BlockStack>
            </InlineStack>
          </BlockStack>
        </InlineStack>
      </ResourceItem>
    );
  }, [selectedProducts, handleProductSelection]);

  const currentPageProductIds = paginatedProducts.map(product => product.id);
  const allCurrentSelected = currentPageProductIds.length > 0 &&
    currentPageProductIds.every(id => selectedProducts.includes(id));

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Select Products to Scan"
      primaryAction={{
        content: `Scan ${selectedProducts.length} Product${selectedProducts.length !== 1 ? 's' : ''}`,
        onAction: handleConfirm,
        disabled: selectedProducts.length === 0,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onCancel,
        },
      ]}
      large
    >
      <BlockStack gap="400">
        {selectedProducts.length > 0 && (
          <Banner status="info">
            {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected for SEO analysis
          </Banner>
        )}

        <TextField
          label="Search products"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by product name, vendor, or type..."
          prefix={<SearchIcon />}
          clearButton
          onClearButtonClick={() => handleSearchChange('')}
        />

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spinner accessibilityLabel="Loading products" size="large" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            heading="No products found"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Try adjusting your search terms</p>
          </EmptyState>
        ) : (
          <>
            <Card>
              <ResourceList
                resourceName={{ singular: 'product', plural: 'products' }}
                items={paginatedProducts}
                renderItem={renderProductItem}
                selectedItems={selectedProducts}
                onSelectionChange={setSelectedProducts}
                promotedBulkActions={[
                  {
                    content: allCurrentSelected ? 'Deselect all on page' : 'Select all on page',
                    onAction: handleSelectAll,
                  },
                ]}
                bulkActions={[
                  {
                    content: 'Select all on page',
                    onAction: handleSelectAll,
                  },
                ]}
                showHeader
              />
            </Card>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  hasPrevious={currentPage > 1}
                  onPrevious={() => handlePageChange('previous')}
                  hasNext={currentPage < totalPages}
                  onNext={() => handlePageChange('next')}
                  label={`Page ${currentPage} of ${totalPages}`}
                />
              </div>
            )}

            <Text variant="bodySm" color="subdued" alignment="center">
              Showing {startIndex + 1}-{Math.min(startIndex + productsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </Text>
          </>
        )}
      </BlockStack>
    </Modal>
  );
}

export default ProductSelectionModal;