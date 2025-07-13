import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  BlockStack,
  InlineStack,
  Tag,
  Banner,
  Select,
} from '@shopify/polaris';
import { useShop } from '../contexts/ShopContext';
import ApiService from '../services/api';

function BrandStoryModal({ open, onClose }) {
  const { shop } = useShop();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [shopInfo, setShopInfo] = useState({ shopName: null });
  
  const [formData, setFormData] = useState({
    brandName: '',
    brandTone: '',
    brandKeys: [],
    brandStory: '',
    brandGuidelines: '',
  });
  
  const [newKeyword, setNewKeyword] = useState('');

  // Brand tone options
  const brandToneOptions = [
    { label: 'Select brand tone', value: '' },
    { label: 'Professional and Authoritative', value: 'professional-authoritative' },
    { label: 'Friendly and Approachable', value: 'friendly-approachable' },
    { label: 'Casual and Conversational', value: 'casual-conversational' },
    { label: 'Luxury and Sophisticated', value: 'luxury-sophisticated' },
    { label: 'Fun and Playful', value: 'fun-playful' },
    { label: 'Innovative and Tech-Forward', value: 'innovative-tech' },
    { label: 'Trustworthy and Reliable', value: 'trustworthy-reliable' },
    { label: 'Creative and Artistic', value: 'creative-artistic' },
    { label: 'Minimalist and Clean', value: 'minimalist-clean' },
    { label: 'Bold and Confident', value: 'bold-confident' },
  ];

  // Fetch existing brand story when modal opens
  useEffect(() => {
    if (open && shop) {
      fetchBrandStory();
    }
  }, [open, shop]);

  const fetchBrandStory = useCallback(async () => {
    if (!shop) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.getBrandStory(shop);
      if (response.success && response.data) {
        setFormData({
          brandName: response.data.brandName || '',
          brandTone: response.data.brandTone || '',
          brandKeys: response.data.brandKeys || [],
          brandStory: response.data.brandStory || '',
          brandGuidelines: response.data.brandGuidelines || '',
        });
      }
    } catch (error) {
      console.error('Error fetching brand story:', error);
      setError('Failed to load brand story');
    } finally {
      setLoading(false);
    }
  }, [shop]);

  const handleInputChange = useCallback((field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(false);
  }, []);

  const handleAddKeyword = useCallback(() => {
    if (newKeyword.trim() && !formData.brandKeys.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        brandKeys: [...prev.brandKeys, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  }, [newKeyword, formData.brandKeys]);

  const handleRemoveKeyword = useCallback((keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      brandKeys: prev.brandKeys.filter(keyword => keyword !== keywordToRemove)
    }));
  }, []);

  const handleKeywordKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddKeyword();
    }
  }, [handleAddKeyword]);

  const handleSave = useCallback(async () => {
    if (!shop) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await ApiService.saveBrandStory(shop, formData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        setError('Failed to save brand story');
      }
    } catch (error) {
      console.error('Error saving brand story:', error);
      setError('Failed to save brand story');
    } finally {
      setSaving(false);
    }
  }, [shop, formData, onClose]);

  const handleClose = useCallback(() => {
    setError(null);
    setSuccess(false);
    onClose();
  }, [onClose]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Brand Story"
      primaryAction={{
        content: saving ? 'Saving...' : 'Save',
        onAction: handleSave,
        loading: saving,
        disabled: loading,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: handleClose,
          disabled: saving,
        },
      ]}
      large
    >
      <Modal.Section>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Text variant="bodyMd">Loading brand story...</Text>
          </div>
        ) : (
          <Card>
            <BlockStack gap="400">
              {error && (
                <Banner status="critical" title="Error">
                  <p>{error}</p>
                </Banner>
              )}
              
              {success && (
                <Banner status="success" title="Success">
                  <p>Brand story saved successfully!</p>
                </Banner>
              )}

              <Text variant="headingMd" as="h2">
                Define Your Brand Story
              </Text>
              
              <Text variant="bodyMd" color="subdued">
                This information will help generate better SEO content that aligns with your brand voice and values.
              </Text>

              <FormLayout>
                <TextField
                  label="Brand Name"
                  value={formData.brandName}
                  onChange={handleInputChange('brandName')}
                  placeholder="Enter your brand name"
                  helpText="The name of your brand or business"
                />

                <Select
                  label="Brand Tone"
                  options={brandToneOptions}
                  value={formData.brandTone}
                  onChange={handleInputChange('brandTone')}
                  helpText="Select the tone and personality that best represents your brand"
                />

                <div>
                  <Text variant="bodyMd" as="label">
                    Brand Keywords
                  </Text>
                  <div style={{ marginTop: '8px' }}>
                    <InlineStack gap="200" align="start">
                      <div style={{ flex: 1 }}>
                        <TextField
                          value={newKeyword}
                          onChange={setNewKeyword}
                          onKeyPress={handleKeywordKeyPress}
                          placeholder="Add a keyword and press Enter"
                          connectedRight={
                            <Button onClick={handleAddKeyword} disabled={!newKeyword.trim()}>
                              Add
                            </Button>
                          }
                        />
                      </div>
                    </InlineStack>
                    
                    {formData.brandKeys.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <InlineStack gap="100" wrap>
                          {formData.brandKeys.map((keyword, index) => (
                            <Tag
                              key={index}
                              onRemove={() => handleRemoveKeyword(keyword)}
                            >
                              {keyword}
                            </Tag>
                          ))}
                        </InlineStack>
                      </div>
                    )}
                    
                    <Text variant="bodyMd" color="subdued" as="p" style={{ marginTop: '8px' }}>
                      Key words or phrases that represent your brand (e.g., quality, innovation, sustainable)
                    </Text>
                  </div>
                </div>

                <TextField
                  label="Brand Story"
                  value={formData.brandStory}
                  onChange={handleInputChange('brandStory')}
                  multiline={4}
                  placeholder="Tell us about your brand's origin, mission, and what makes it unique..."
                  helpText="A brief narrative about your brand's history, mission, and values"
                />

                <TextField
                  label="Brand Guidelines"
                  value={formData.brandGuidelines}
                  onChange={handleInputChange('brandGuidelines')}
                  multiline={3}
                  placeholder="Any specific guidelines for how your brand should be represented..."
                  helpText="Specific guidelines for tone, messaging, or content creation"
                />
              </FormLayout>
            </BlockStack>
          </Card>
        )}
      </Modal.Section>
    </Modal>
  );
}

export default BrandStoryModal;