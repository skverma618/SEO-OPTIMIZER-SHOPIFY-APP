import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const [shop, setShop] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get shop domain from URL parameters (for Shopify app installation)
  const getShopFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('shop');
  };

  // Check if shop is already authenticated
  const checkAuthentication = async (shopDomain) => {
    try {
      setIsLoading(true);
      const response = await ApiService.verifyShopSession(shopDomain);
      
      if (response.success && response.data.isValid) {
        setShop(shopDomain);
        setIsAuthenticated(true);
        setError(null);
      } else {
        setIsAuthenticated(false);
        // If not authenticated, initiate OAuth flow
        await initiateOAuth(shopDomain);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setError('Failed to verify shop authentication');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initiate OAuth flow
  const initiateOAuth = async (shopDomain) => {
    try {
      const response = await ApiService.generateAuthUrl(shopDomain);
      
      if (response.success && response.data.authUrl) {
        // Redirect to Shopify OAuth
        window.location.href = response.data.authUrl;
      } else {
        throw new Error('Failed to generate auth URL');
      }
    } catch (error) {
      console.error('OAuth initiation failed:', error);
      setError('Failed to initiate authentication');
    }
  };

  // Handle OAuth callback
  const handleOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const installation = urlParams.get('installation');
    const shopDomain = urlParams.get('shop') || getShopFromUrl();

    if (installation === 'success' && shopDomain) {
      setShop(shopDomain);
      setIsAuthenticated(true);
      setError(null);
      
      // Clean up URL parameters
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (installation === 'error') {
      setError('App installation failed');
      setIsAuthenticated(false);
    }
  };

  // Connect to a shop (for manual shop entry)
  const connectShop = async (shopDomain) => {
    // Validate shop domain format
    const cleanShopDomain = shopDomain.includes('.myshopify.com') 
      ? shopDomain 
      : `${shopDomain}.myshopify.com`;

    await checkAuthentication(cleanShopDomain);
  };

  // Disconnect shop
  const disconnectShop = () => {
    setShop(null);
    setIsAuthenticated(false);
    setError(null);
  };

  useEffect(() => {
    // Check for OAuth callback first
    const urlParams = new URLSearchParams(window.location.search);
    const installation = urlParams.get('installation');
    
    if (installation) {
      handleOAuthCallback();
      setIsLoading(false);
      return;
    }

    // Check for shop parameter in URL (app installation)
    const shopFromUrl = getShopFromUrl();
    if (shopFromUrl) {
      checkAuthentication(shopFromUrl);
    } else {
      // No shop in URL, user needs to enter shop domain
      setIsLoading(false);
    }
  }, []);

  const value = {
    shop,
    isAuthenticated,
    isLoading,
    error,
    connectShop,
    disconnectShop,
    checkAuthentication,
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};