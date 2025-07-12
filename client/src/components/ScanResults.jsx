import React, { useState, useCallback, useEffect } from 'react';
import {
  Page,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  DataTable,
  Checkbox,
  ButtonGroup,
  Banner,
  Spinner,
  EmptyState,
  Tabs,
  Icon,
  Modal,
  Avatar,
} from '@shopify/polaris';
import {
  CheckIcon,
  AlertTriangleIcon,
  EditIcon,
  ImageIcon,
  SearchIcon,
  ViewIcon,
} from '@shopify/polaris-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import SEOSuggestionCard from './SEOSuggestionCard';
import { useShop } from '../contexts/ShopContext';
import ApiService from '../services/api';


function ScanResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { shop } = useShop();
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);

  useEffect(() => {
    // Get the real data from location state
    const stateData = location.state;
    console.log('SEO stateData', stateData)
    if (stateData && stateData.seoResults) {
      console.log('SEO Results received:', stateData.seoResults);
      
      // Transform the API response to match the component's expected format
      const transformedResults = stateData.seoResults.results.map(product => ({
        id: product.productId,
        title: product.title,
        handle: product.handle,
        image: { url: 'https://picsum.photos/80/80?random=' + Math.random(), altText: product.title },
        suggestions: product.suggestions.map(suggestion => ({
          id: suggestion.id,
          type: suggestion.type,
          priority: suggestion.priority,
          field: suggestion.field,
          current: suggestion.current,
          suggested: suggestion.suggested,
          reason: suggestion.reason,
          impact: suggestion.impact,
        }))
      }));
      
      setResults(transformedResults);
      setIsLoading(false);
    } else {
      // If no data is passed, redirect back to dashboard
      console.error('No SEO results data found in location state');
      navigate('/');
    }
  }, [location.state, navigate]);

  const allSuggestions = results.flatMap(product => 
    product.suggestions.map(suggestion => ({
      ...suggestion,
      productId: product.id,
      productTitle: product.title,
    }))
  );

  const highPrioritySuggestions = allSuggestions.filter(s => s.priority === 'high');
  const mediumPrioritySuggestions = allSuggestions.filter(s => s.priority === 'medium');
  const lowPrioritySuggestions = allSuggestions.filter(s => s.priority === 'low');

  const tabs = [
    {
      id: 'all',
      content: `All Issues (${allSuggestions.length})`,
      panelID: 'all-suggestions',
    },
    {
      id: 'high',
      content: `High Priority (${highPrioritySuggestions.length})`,
      panelID: 'high-priority',
    },
    {
      id: 'medium',
      content: `Medium Priority (${mediumPrioritySuggestions.length})`,
      panelID: 'medium-priority',
    },
    {
      id: 'low',
      content: `Low Priority (${lowPrioritySuggestions.length})`,
      panelID: 'low-priority',
    },
  ];

  const getCurrentTabSuggestions = () => {
    switch (selectedTab) {
      case 1: return highPrioritySuggestions;
      case 2: return mediumPrioritySuggestions;
      case 3: return lowPrioritySuggestions;
      default: return allSuggestions;
    }
  };

  const handleSuggestionSelection = useCallback((suggestionId) => {
    setSelectedSuggestions(prev => {
      const newSelection = prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId];
      
      // Update product selection based on suggestion selection
      setSelectedProducts(currentProducts => {
        const updatedProducts = [...currentProducts];
        
        // Check each product to see if all its suggestions are selected
        results.forEach(product => {
          const productSuggestionIds = product.suggestions.map(s => s.id);
          const allSuggestionsSelected = productSuggestionIds.every(id => newSelection.includes(id));
          const isProductSelected = updatedProducts.includes(product.id);
          
          if (allSuggestionsSelected && !isProductSelected) {
            updatedProducts.push(product.id);
          } else if (!allSuggestionsSelected && isProductSelected) {
            const index = updatedProducts.indexOf(product.id);
            if (index > -1) {
              updatedProducts.splice(index, 1);
            }
          }
        });
        
        return updatedProducts;
      });
      
      return newSelection;
    });
  }, [results]);

  const handleSelectAll = useCallback(() => {
    const currentSuggestions = getCurrentTabSuggestions();
    const currentIds = currentSuggestions.map(s => s.id);
    const allSelected = currentIds.every(id => selectedSuggestions.includes(id));
    
    if (allSelected) {
      setSelectedSuggestions(prev => prev.filter(id => !currentIds.includes(id)));
    } else {
      setSelectedSuggestions(prev => {
        const newSelection = [...prev];
        currentIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  }, [selectedSuggestions, selectedTab]);

  const handleApplySelected = useCallback(async () => {
    if (!shop || selectedSuggestions.length === 0) return;
    
    setIsApplying(true);
    
    try {
      // Transform selected suggestions to the format expected by the API
      const suggestionsToApply = selectedSuggestions.map(suggestionId => {
        // Find the suggestion in the results
        const suggestion = allSuggestions.find(s => s.id === suggestionId);
        if (!suggestion) return null;
        
        return {
          suggestionId: suggestion.id,
          productId: suggestion.productId,
          field: suggestion.field,
          value: suggestion.suggested,
        };
      }).filter(Boolean);
      
      console.log('Applying suggestions:', suggestionsToApply);
      
      // Make the API call
      const response = await ApiService.applySEO(shop, suggestionsToApply);
      
      if (response.success) {
        // Mark suggestions as applied
        setAppliedSuggestions(prev => [...prev, ...selectedSuggestions]);
        setSelectedSuggestions([]);
        
        console.log('Successfully applied SEO suggestions:', response.message);
        // TODO: Show success toast notification
      } else {
        throw new Error(response.message || 'Failed to apply suggestions');
      }
    } catch (error) {
      console.error('Error applying suggestions:', error);
      // TODO: Show error toast notification
    } finally {
      setIsApplying(false);
    }
  }, [selectedSuggestions, allSuggestions, shop]);

  const handleBackToDashboard = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleViewSuggestions = useCallback((product) => {
    setModalProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setModalProduct(null);
  }, []);

  const handleProductSelection = useCallback((productId, isSelected) => {
    // Find all suggestions for this product
    const product = results.find(p => p.id === productId);
    const productSuggestionIds = product ? product.suggestions.map(s => s.id) : [];
    
    setSelectedProducts(prev => {
      if (isSelected) {
        return [...prev, productId];
      } else {
        return prev.filter(id => id !== productId);
      }
    });
    
    // Also select/deselect all suggestions for this product
    setSelectedSuggestions(prev => {
      if (isSelected) {
        // Add all product suggestions to selected suggestions
        const newSelection = [...prev];
        productSuggestionIds.forEach(suggestionId => {
          if (!newSelection.includes(suggestionId)) {
            newSelection.push(suggestionId);
          }
        });
        return newSelection;
      } else {
        // Remove all product suggestions from selected suggestions
        return prev.filter(id => !productSuggestionIds.includes(id));
      }
    });
  }, [results]);

if (!SEOSuggestionCard) {
  console.error('SEOSuggestionCard failed to import!');
}

  if (isLoading) {
    return (
      <Page title="Analyzing SEO...">
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Spinner accessibilityLabel="Analyzing SEO" size="large" />
            <br />
            <br />
            <Text variant="headingMd">Analyzing your products for SEO opportunities...</Text>
            <br />
            <Text variant="bodyMd" color="subdued">
              This may take a few moments while we scan for improvements.
            </Text>
          </div>
        </Card>
      </Page>
    );
  }

  if (results.length === 0) {
    return (
      <Page
        title="SEO Analysis Complete"
        backAction={{ content: 'Back to Dashboard', onAction: handleBackToDashboard }}
      >
        <EmptyState
          heading="Great news! No SEO issues found"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>Your selected products are already well-optimized for search engines.</p>
          <div style={{ marginTop: '20px' }}>
            <Button primary onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>
        </EmptyState>
      </Page>
    );
  }

  const currentSuggestions = getCurrentTabSuggestions();

  return (
    <Page
      title="SEO Analysis Results"
      subtitle={`Found ${allSuggestions.length} optimization opportunities across ${results.length} products`}
      backAction={{ content: 'Back to Dashboard', onAction: handleBackToDashboard }}
      primaryAction={
        selectedSuggestions.length > 0 ? {
          content: `Apply ${selectedSuggestions.length} Selected`,
          onAction: handleApplySelected,
          loading: isApplying,
        } : undefined
      }
      secondaryActions={[
        {
          content: 'Select All Visible',
          onAction: handleSelectAll,
        },
      ]}
    >
      <BlockStack gap="500">
        <Banner
          title="SEO Analysis Complete"
          status="success"
        >
          <p>
            We found {allSuggestions.length} opportunities to improve your SEO. 
            Select the suggestions you'd like to apply and click "Apply Selected" to implement them.
          </p>
        </Banner>

        <Card>
          <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
            <div style={{ padding: '16px' }}>
              {results.length === 0 ? (
                <EmptyState
                  heading="No products found"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>No products with SEO suggestions were found.</p>
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={['text', 'text', 'numeric', 'text']}
                  headings={['', 'Product', 'Total Suggestions', 'Actions']}
                  rows={results.map((product) => {
                    const filteredSuggestions = getCurrentTabSuggestions().filter(s => s.productId === product.id);
                    const productSuggestionIds = product.suggestions.map(s => s.id);
                    const allSuggestionsSelected = productSuggestionIds.every(id => selectedSuggestions.includes(id));
                    const isProductSelected = allSuggestionsSelected && productSuggestionIds.length > 0;
                    
                    return [
                      <Checkbox
                        checked={isProductSelected}
                        onChange={(checked) => handleProductSelection(product.id, checked)}
                        ariaLabel={`Select ${product.title}`}
                      />,
                      <InlineStack gap="300" align="start">
                        <Avatar
                          source={product.image?.url}
                          alt={product.image?.altText || product.title}
                          size="medium"
                        />
                        <BlockStack gap="100">
                          <Text variant="bodyMd" fontWeight="semibold">
                            {product.title}
                          </Text>
                          <Text variant="bodySm" color="subdued">
                            {product.handle}
                          </Text>
                        </BlockStack>
                      </InlineStack>,
                      <Badge status={filteredSuggestions.length > 0 ? 'attention' : 'success'}>
                        {filteredSuggestions.length} suggestions
                      </Badge>,
                      <Button
                        size="slim"
                        icon={ViewIcon}
                        onClick={() => handleViewSuggestions(product)}
                        disabled={filteredSuggestions.length === 0}
                      >
                        View Details
                      </Button>
                    ];
                  })}
                />
              )}
            </div>
          </Tabs>
        </Card>

        {selectedSuggestions.length > 0 && (
          <Card>
            <div style={{ padding: '16px' }}>
              <InlineStack gap="300" align="space-between">
                <Text variant="bodyMd">
                  {selectedSuggestions.length} suggestion{selectedSuggestions.length !== 1 ? 's' : ''} selected
                </Text>
                <ButtonGroup>
                  <Button onClick={() => setSelectedSuggestions([])}>
                    Clear Selection
                  </Button>
                  <Button
                    primary
                    onClick={handleApplySelected}
                    loading={isApplying}
                  >
                    Apply Selected
                  </Button>
                </ButtonGroup>
              </InlineStack>
            </div>
          </Card>
        )}
      </BlockStack>

      {/* Modal for viewing product suggestions */}
      {isModalOpen && modalProduct && (
        <Modal
          open={isModalOpen}
          onClose={handleCloseModal}
          title={`SEO Suggestions for ${modalProduct.title}`}
          primaryAction={{
            content: 'Close',
            onAction: handleCloseModal,
          }}
          large
        >
          <Modal.Section>
            <BlockStack gap="400">
              {modalProduct.suggestions.length === 0 ? (
                <EmptyState
                  heading="No suggestions for this product"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>This product is already well-optimized for SEO.</p>
                </EmptyState>
              ) : (
                modalProduct.suggestions.map((suggestion) => (
                  <SEOSuggestionCard
                    key={suggestion.id}
                    suggestion={{
                      ...suggestion,
                      productId: modalProduct.id,
                      productTitle: modalProduct.title,
                    }}
                    isSelected={selectedSuggestions.includes(suggestion.id)}
                    isApplied={appliedSuggestions.includes(suggestion.id)}
                    onSelect={() => handleSuggestionSelection(suggestion.id)}
                    onApply={() => handleApplySelected()}
                  />
                ))
              )}
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}

export default ScanResults;