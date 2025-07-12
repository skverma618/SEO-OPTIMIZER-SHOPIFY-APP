# Shopify Development Setup Guide

## 1. Create a Shopify Partner Account
1. Go to https://partners.shopify.com/
2. Sign up for a free Shopify Partner account
3. This gives you access to create development stores and apps

## 2. Create a Development Store
1. In your Partner Dashboard, click "Stores"
2. Click "Add store" → "Development store"
3. Choose "Create a store to test and build"
4. Fill in store details (e.g., "seo-optimizer-dev")
5. Select "Start with test data" for sample products

## 3. Create a Shopify App
1. In Partner Dashboard, go to "Apps"
2. Click "Create app" → "Create app manually"
3. Fill in app details:
   - App name: "SEO Optimizer"
   - App URL: https://your-ngrok-url.ngrok.io
   - Allowed redirection URL(s): https://your-ngrok-url.ngrok.io/api/auth/callback

## 3.1. Set Up ngrok (Required for Local Development)
1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 3001`
3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
4. Use this URL in your Shopify app settings above

## 4. Get Your API Credentials
After creating the app, you'll get:
- Client ID (API Key)
- Client Secret
- These are the real credentials you need

## 5. Update Environment Variables
Replace the placeholder values in api/.env with your real credentials:

```
SHOPIFY_API_KEY=your_real_api_key_here
SHOPIFY_API_SECRET=your_real_api_secret_here
CLIENT_ID=your_real_api_key_here
CLIENT_SECRET=your_real_api_secret_here
```

## 6. Install Your App on Development Store
1. Use your development store domain (e.g., seo-optimizer-dev.myshopify.com)
2. The OAuth flow will now work with real credentials