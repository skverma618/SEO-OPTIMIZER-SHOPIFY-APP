import React, { useState, useCallback, useEffect } from 'react';
import {
  Page,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  ResourceList,
  ResourceItem,
  Checkbox,
  ButtonGroup,
  Banner,
  Spinner,
  EmptyState,
  Tabs,
  Icon,
} from '@shopify/polaris';
import {
  CheckIcon,
  AlertTriangleIcon,
  EditIcon,
  ImageIcon,
  SearchIcon,
} from '@shopify/polaris-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import SEOSuggestionCard from './SEOSuggestionCard';

// Mock SEO analysis results
const mockSEOResults = [
  {
    id: 'product-1',
    title: 'Premium Wireless Headphones',
    handle: 'premium-wireless-headphones',
    image: { url: 'https://picsum.photos/80/80?random=1', altText: 'Headphones' },
    suggestions: [
      {
        id: 'title-1',
        type: 'title',
        priority: 'high',
        current: 'Premium Wireless Headphones',
        suggested: 'Premium Wireless Bluetooth Headphones - Noise Cancelling',
        reason: 'Add target keywords "Bluetooth" and "Noise Cancelling" to improve search visibility',
        impact: 'Could improve search ranking for high-volume keywords',
      },
      {
        id: 'description-1',
        type: 'description',
        priority: 'medium',
        current: 'Great headphones for music.',
        suggested: 'Experience premium sound quality with our wireless Bluetooth headphones featuring active noise cancellation, 30-hour battery life, and comfortable over-ear design.',
        reason: 'Current description is too short and lacks important product features',
        impact: 'Better descriptions increase click-through rates by 15-25%',
      },
      {
        id: 'alt-text-1',
        type: 'alt-text',
        priority: 'medium',
        current: '',
        suggested: 'Black wireless Bluetooth headphones with noise cancelling technology',
        reason: 'Missing alt text hurts accessibility and SEO',
        impact: 'Improves image search visibility and accessibility compliance',
      },
    ],
  },
  {
    id: 'product-2',
    title: 'Organic Cotton T-Shirt',
    handle: 'organic-cotton-t-shirt',
    image: { url: 'https://picsum.photos/80/80?random=2', altText: 'T-shirt' },
    suggestions: [
      {
        id: 'title-2',
        type: 'title',
        priority: 'high',
        current: 'Organic Cotton T-Shirt',
        suggested: 'Organic Cotton T-Shirt - Sustainable Eco-Friendly Apparel',
        reason: 'Add trending keywords "Sustainable" and "Eco-Friendly"',
        impact: 'Target growing eco-conscious consumer market',
      },
      {
        id: 'meta-desc-2',
        type: 'meta-description',
        priority: 'high',
        current: '',
        suggested: 'Shop our premium organic cotton t-shirt made from 100% sustainable materials. Soft, comfortable, and eco-friendly. Available in multiple colors and sizes.',
        reason: 'Missing meta description reduces search engine visibility',
        impact: 'Meta descriptions can improve click-through rates by up to 30%',
      },
    ],
  },
];

function ScanResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading results
    setTimeout(() => {
      setResults(mockSEOResults);
      setIsLoading(false);
    }, 1000);
  }, []);

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
      if (prev.includes(suggestionId)) {
        return prev.filter(id => id !== suggestionId);
      } else {
        return [...prev, suggestionId];
      }
    });
  }, []);

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
    setIsApplying(true);
    
    try {
      // TODO: Implement API calls to apply SEO suggestions
      console.log('Applying suggestions:', selectedSuggestions);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark suggestions as applied
      setAppliedSuggestions(prev => [...prev, ...selectedSuggestions]);
      setSelectedSuggestions([]);
      
      // Show success message (would use Toast in real implementation)
      console.log('Successfully applied SEO suggestions');
    } catch (error) {
      console.error('Error applying suggestions:', error);
    } finally {
      setIsApplying(false);
    }
  }, [selectedSuggestions]);

  const handleBackToDashboard = useCallback(() => {
    navigate('/');
  }, [navigate]);


  if (isLoading) {
    return (
      <Page title="Analyzing SEO...">
        <Card sectioned>
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
            <Card.Section>
              {currentSuggestions.length === 0 ? (
                <EmptyState
                  heading="No suggestions in this category"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>All suggestions in this priority level have been addressed.</p>
                </EmptyState>
              ) : (
                <ResourceList
                  resourceName={{ singular: 'suggestion', plural: 'suggestions' }}
                  items={currentSuggestions}
                  selectedItems={selectedSuggestions}
                  onSelectionChange={setSelectedSuggestions}
                  renderItem={(suggestion) => (
                    <ResourceItem
                      id={suggestion.id}
                      accessibilityLabel={`SEO suggestion for ${suggestion.productTitle}`}
                    >
                      <SEOSuggestionCard
                        suggestion={suggestion}
                        isSelected={selectedSuggestions.includes(suggestion.id)}
                        isApplied={appliedSuggestions.includes(suggestion.id)}
                        onSelect={() => handleSuggestionSelection(suggestion.id)}
                        onApply={() => handleApplySelected()}
                      />
                    </ResourceItem>
                  )}
                />
              )}
            </Card.Section>
          </Tabs>
        </Card>

        {selectedSuggestions.length > 0 && (
          <Card>
            <Card.Section>
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
            </Card.Section>
          </Card>
        )}
      </BlockStack>
    </Page>
  );
}

export default ScanResults;