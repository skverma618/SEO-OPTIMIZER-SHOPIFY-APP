import React, { useState, useCallback } from 'react';
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Button,
  Checkbox,
  Icon,
  Collapsible,
  TextField,
  ButtonGroup,
} from '@shopify/polaris';
import {
  CheckIcon,
  AlertTriangleIcon,
  EditIcon,
  ImageIcon,
  SearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@shopify/polaris-icons';

function SEOSuggestionCard({ 
  suggestion, 
  isSelected, 
  isApplied, 
  onSelect, 
  onApply 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(suggestion.suggested);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
    setEditedValue(suggestion.suggested);
  }, [suggestion.suggested]);

  const handleCancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditedValue(suggestion.suggested);
  }, [suggestion.suggested]);

  const handleSaveEdit = useCallback(() => {
    // TODO: Implement save functionality
    console.log('Saving edited suggestion:', editedValue);
    setIsEditing(false);
    // In real implementation, this would update the suggestion
  }, [editedValue]);

  const getPriorityBadge = (priority) => {
    const badgeProps = {
      high: { status: 'critical', children: 'High Priority' },
      medium: { status: 'attention', children: 'Medium Priority' },
      low: { status: 'info', children: 'Low Priority' },
    };
    return <Badge {...badgeProps[priority]} />;
  };

  const getTypeIcon = (type) => {
    const icons = {
      title: SearchIcon,
      description: EditIcon,
      'meta-description': EditIcon,
      'alt-text': ImageIcon,
    };
    return icons[type] || EditIcon;
  };

  const getTypeLabel = (type) => {
    const labels = {
      title: 'Product Title',
      description: 'Product Description',
      'meta-description': 'Meta Description',
      'alt-text': 'Image Alt Text',
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <div style={{ padding: '16px' }}>
        <BlockStack gap="300">
          {/* Header with selection and basic info */}
          <InlineStack gap="300" align="space-between">
            <InlineStack gap="300" align="start">
              <Checkbox
                checked={isSelected}
                onChange={onSelect}
                disabled={isApplied}
                ariaLabel={`Select ${getTypeLabel(suggestion.type)} suggestion`}
              />
              
              <BlockStack gap="100">
                <InlineStack gap="200" align="start">
                  <Icon source={getTypeIcon(suggestion.type)} color="base" />
                  <Text variant="bodyMd" fontWeight="semibold">
                    {getTypeLabel(suggestion.type)}
                  </Text>
                  {getPriorityBadge(suggestion.priority)}
                  {isApplied && (
                    <Badge status="success" icon={CheckIcon}>
                      Applied
                    </Badge>
                  )}
                </InlineStack>
                
                <Text variant="bodySm" color="subdued">
                  {suggestion.productTitle}
                </Text>
              </BlockStack>
            </InlineStack>

            <ButtonGroup>
              <Button
                size="slim"
                onClick={handleToggleExpanded}
                icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
              >
                {isExpanded ? 'Less' : 'Details'}
              </Button>
              
              {!isApplied && (
                <Button
                  size="slim"
                  primary
                  onClick={onApply}
                  disabled={!isSelected}
                >
                  Apply
                </Button>
              )}
            </ButtonGroup>
          </InlineStack>

          {/* Quick preview of the suggestion */}
          <BlockStack gap="200">
            <Text variant="bodySm" color="subdued">
              {suggestion.reason}
            </Text>
            
            {suggestion.current && (
              <div>
                <Text variant="bodySm" fontWeight="medium" color="subdued">
                  Current:
                </Text>
                <Text variant="bodySm" color="subdued">
                  "{suggestion.current}"
                </Text>
              </div>
            )}
            
            <div>
              <Text variant="bodySm" fontWeight="medium" color="success">
                Suggested:
              </Text>
              <Text variant="bodySm">
                "{suggestion.suggested}"
              </Text>
            </div>
          </BlockStack>

          {/* Expandable details section */}
          <Collapsible
            open={isExpanded}
            id={`suggestion-details-${suggestion.id}`}
            transition={{ duration: '200ms', timingFunction: 'ease-in-out' }}
          >
            <BlockStack gap="400">
              <Card background="bg-surface-secondary">
                <div style={{ padding: '16px' }}>
                  <BlockStack gap="300">
                    <Text variant="headingSm">Impact & Benefits</Text>
                    <Text variant="bodySm">
                      {suggestion.impact}
                    </Text>
                  </BlockStack>
                </div>
              </Card>

              {/* Editable suggestion */}
              <BlockStack gap="300">
                <InlineStack gap="200" align="space-between">
                  <Text variant="headingSm">Customize Suggestion</Text>
                  {!isEditing ? (
                    <Button size="slim" onClick={handleStartEditing}>
                      <Icon source={EditIcon} />
                      Edit
                    </Button>
                  ) : (
                    <ButtonGroup>
                      <Button size="slim" onClick={handleCancelEditing}>
                        Cancel
                      </Button>
                      <Button size="slim" primary onClick={handleSaveEdit}>
                        Save
                      </Button>
                    </ButtonGroup>
                  )}
                </InlineStack>

                {isEditing ? (
                  <TextField
                    value={editedValue}
                    onChange={setEditedValue}
                    multiline={suggestion.type === 'description' || suggestion.type === 'meta-description'}
                    autoComplete="off"
                    helpText="Customize this suggestion to better fit your brand voice and strategy"
                  />
                ) : (
                  <Card background="bg-surface-secondary">
                    <div style={{ padding: '16px' }}>
                      <Text variant="bodySm">
                        {editedValue}
                      </Text>
                    </div>
                  </Card>
                )}
              </BlockStack>

              {/* Before/After comparison for visual types */}
              {suggestion.type === 'title' && (
                <BlockStack gap="300">
                  <Text variant="headingSm">Preview</Text>
                  <Card background="bg-surface-secondary">
                    <div style={{ padding: '16px' }}>
                      <BlockStack gap="200">
                        <div>
                          <Text variant="bodySm" fontWeight="medium" color="subdued">
                            Before:
                          </Text>
                          <Text variant="bodyMd" color="subdued">
                            {suggestion.current || 'No title set'}
                          </Text>
                        </div>
                        <div>
                          <Text variant="bodySm" fontWeight="medium" color="success">
                            After:
                          </Text>
                          <Text variant="bodyMd" fontWeight="semibold">
                            {editedValue}
                          </Text>
                        </div>
                      </BlockStack>
                    </div>
                  </Card>
                </BlockStack>
              )}
            </BlockStack>
          </Collapsible>
        </BlockStack>
      </div>
    </Card>
  );
}

export default SEOSuggestionCard;