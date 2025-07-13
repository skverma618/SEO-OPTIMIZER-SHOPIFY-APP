import React, { useState, useCallback } from 'react';
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Button,
  Checkbox,
  TextField,
  ButtonGroup,
} from '@shopify/polaris';
import {
  CheckIcon,
  EditIcon,
} from '@shopify/polaris-icons';

// Score indicator component with circular ring
function ScoreIndicator({ score }) {
  console.log(score, "SCORE!!")
  const getScoreColor = (score) => {
    if (score <= 40) return { color: '#dc2626', textColor: '#dc2626' }; // Red
    if (score <= 80) return { color: '#d97706', textColor: '#d97706' }; // Yellow/Orange
    return { color: '#16a34a', textColor: '#16a34a' }; // Green
  };

  const { color, textColor } = getScoreColor(score);
  const circumference = 2 * Math.PI * 16; // radius = 16
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div style={{
      position: 'relative',
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Background circle */}
      <svg
        width="48"
        height="48"
        style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3"
        />
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out'
          }}
        />
      </svg>
      
      {/* Score text */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `2px solid ${color}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: textColor,
          lineHeight: '1'
        }}>
          {score}
        </span>
      </div>
    </div>
  );
}

function SEOSuggestionCard({
  suggestion, 
  isSelected, 
  isApplied, 
  onSelect, 
  onApply 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(suggestion.suggested);

  console.log(suggestion, "SUGGESTION!!")

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
                  {/* <Icon source={getTypeIcon(suggestion.type)} color="base" /> */}
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

            <InlineStack gap="300" align="center">
              {/* Score indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <ScoreIndicator score={suggestion.score} />
                {/* <Text variant="captionMd" color="subdued">
                  SEO Score
                </Text> */}
              </div>

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
            </InlineStack>
          </InlineStack>

          {/* New structure as requested */}
          <BlockStack gap="200">
            {/* Suggestion with highlighted reason */}
            <div>
              <Text variant="bodySm" fontWeight="medium">
                Suggestion: <span style={{ backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '3px' }}>{suggestion.reason}</span>
              </Text>
            </div>
            
            {/* Impact with highlighted text */}
            <div>
              <Text variant="bodySm" fontWeight="medium">
                Impact: <span style={{ backgroundColor: '#dcfce7', padding: '2px 4px', borderRadius: '3px' }}>{suggestion.impact}</span>
              </Text>
            </div>
            
            {/* Suggested value with edit icon */}
            <InlineStack gap="200" align="space-between">
              <div style={{ flex: 1 }}>
                <Text variant="bodySm" fontWeight="medium" color="success">
                  Suggested:
                </Text>
                {isEditing ? (
                  <TextField
                    value={editedValue}
                    onChange={setEditedValue}
                    multiline={suggestion.type === 'description' || suggestion.type === 'meta-description'}
                    autoComplete="off"
                  />
                ) : (
                  <Text variant="bodySm">
                    "{editedValue}"
                  </Text>
                )}
              </div>
              
              {!isEditing ? (
                <Button size="slim" onClick={handleStartEditing} icon={EditIcon}>
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
          </BlockStack>

        </BlockStack>
      </div>
    </Card>
  );
}

export default SEOSuggestionCard;