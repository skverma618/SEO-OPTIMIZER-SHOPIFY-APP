import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  Card,
  TextField,
  ResourceList,
  ResourceItem,
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
import { useShop } from '../contexts/ShopContext';
import ApiService from '../services/api';

function ProductSelectionModal({ open, onConfirm, onCancel }) {
  const { shop } = useShop();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState(null);
  
  const productsPerPage = 10;

  // Load products from Shopify API
  const loadProducts = async (page = 1, search = '') => {
    if (!shop) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await ApiService.getProducts(shop, {
        page,
        limit: productsPerPage,
        search,
      });

      if (response.success) {
        const { products: fetchedProducts, pagination: paginationData } = response.data;
        
        // Transform products to match expected format
        const transformedProducts = fetchedProducts.map(product => ({
          id: product.id,
          title: product.title,
          handle: product.handle,
          status: product.status,
          vendor: product.vendor,
          productType: product.productType,
          totalInventory: product.totalInventory,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          images: product.images || [],
          image: product.images?.[0] || {
            url: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png',
            altText: product.title,
          },
        }));

        setProducts(transformedProducts);
        setPagination(paginationData);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load products when modal opens or page/search changes
  useEffect(() => {
    if (open && shop) {
      loadProducts(currentPage, searchQuery);
    }
  }, [open, shop, currentPage]);

  // Handle search with debounce
  useEffect(() => {
    if (!open) return;

    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      loadProducts(1, searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, open]);

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
  }, []);


  const handleSelectAll = useCallback(() => {
    const currentPageProductIds = products.map(product => product.id);
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
  }, [products, selectedProducts]);

  const handleConfirm = useCallback(() => {
    const selectedProductData = products.filter(product =>
      selectedProducts.includes(product.id)
    );
    onConfirm(selectedProductData);
  }, [selectedProducts, products, onConfirm]);

  const handlePageChange = useCallback((direction) => {
    if (direction === 'next' && pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'previous' && pagination.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage, pagination]);

  const renderProductItem = useCallback((product) => {
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
      </ResourceItem>
    );
  }, []);

  const currentPageProductIds = products.map(product => product.id);
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
      <Modal.Section>
        <BlockStack gap="400">
        {selectedProducts.length > 0 && (
          <Banner status="info">
            {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected for SEO analysis
          </Banner>
        )}

        {error && (
          <Banner status="critical" title="Error loading products">
            <p>{error}</p>
          </Banner>
        )}

        <TextField
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by product name, vendor, or type..."
          prefix={<SearchIcon />}
          clearButton
          onClearButtonClick={() => handleSearchChange('')}
          disabled={isLoading}
        />

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spinner accessibilityLabel="Loading products" size="large" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            heading="No products found"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>{error ? 'Failed to load products' : 'Try adjusting your search terms or check if you have products in your store'}</p>
          </EmptyState>
        ) : (
          <>
            <Card>
              <ResourceList
                resourceName={{ singular: 'product', plural: 'products' }}
                items={products}
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

            {(pagination.hasNextPage || pagination.hasPreviousPage) && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  hasPrevious={pagination.hasPreviousPage}
                  onPrevious={() => handlePageChange('previous')}
                  hasNext={pagination.hasNextPage}
                  onNext={() => handlePageChange('next')}
                  label={`Page ${currentPage}`}
                />
              </div>
            )}

            <Text variant="bodySm" color="subdued" alignment="center">
              Showing {products.length} products on page {currentPage}
            </Text>
          </>
        )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

export default ProductSelectionModal;