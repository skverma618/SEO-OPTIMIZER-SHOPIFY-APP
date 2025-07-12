import React from 'react';
import { AppProvider } from '@shopify/polaris';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@shopify/polaris/build/esm/styles.css';

// Import components and contexts
import Dashboard from './components/Dashboard';
import ScanResults from './components/ScanResults';
import ShopConnection from './components/ShopConnection';
import { ShopProvider, useShop } from './contexts/ShopContext';

// Main app content that depends on shop context
function AppContent() {
  const { isAuthenticated, isLoading } = useShop();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <ShopConnection />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/results" element={<ScanResults />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider
      i18n={{
        Polaris: {
          Avatar: {
            label: 'Avatar',
            labelWithInitials: 'Avatar with initials {initials}',
          },
          ContextualSaveBar: {
            save: 'Save',
            discard: 'Discard',
          },
          TextField: {
            characterCount: '{count} characters',
          },
          TopBar: {
            toggleMenuLabel: 'Toggle menu',
            SearchField: {
              clearButtonLabel: 'Clear',
              search: 'Search',
            },
          },
          Modal: {
            iFrameTitle: 'body markup',
          },
          Frame: {
            skipToContent: 'Skip to content',
            navigationLabel: 'Navigation',
            Navigation: {
              closeMobileNavigationLabel: 'Close navigation',
            },
          },
        },
      }}
    >
      <Router>
        <ShopProvider>
          <AppContent />
        </ShopProvider>
      </Router>
    </AppProvider>
  );
}

export default App;
