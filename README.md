# SEO-OPTIMIZER-SHOPIFY-APP
An app that audits product pages and suggests AI-generated improvements for titles, metafields, images, resizing etc


## **MVP Implementation Scope**

- **Highlight issues and suggestions on a dashboard and/or inline.**
- **Allow one-click acceptance of AI-powered fixes, with instant updates to the store.**
- **Support both individual and bulk actions.**

## Delivery Visualization:

- **Step 1:** User runs a scan or audit of their store/page.
- **Step 2:** The app presents a list (and/or visual highlights) of issues with AI-powered recommendations for each.
- **Step 3:** The user can:
    - Review all suggestions on a dashboard.
    - Click on any highlighted element in context to see the suggestion.
    - Accept individual changes or select multiple and approve them in bulk.
- **Step 4:** The app pushes accepted changes directly to the Shopify store via the API.

### Path:

1. **User clicks “Scan Store”** in your app.
2. **App triggers a bulk operation** to fetch all relevant data (products, pages, etc.).
3. **Once the operation completes**, download and process the results.
4. **Display all findings and recommendations** in your app, with one-click/bulk apply options.

Technologies and Notes:

| Backend | Node.js, Express | Shopify ecosystem standard, async, scalable |  |
| --- | --- | --- | --- |
| Frontend | React, Polaris | Native Shopify UI, fast development |  |
| Database | PostgreSQL | Flexible, scalable, widely supported |  |
| **Shopify Integration** | 
• **Shopify Admin API** (for fetching and updating products, pages, images, meta fields)
• **Shopify GraphQL Bulk Operations API** (for scanning all products/pages efficiently at scale) | ✅ (bulk operations)
✅ (async bulk opr.)
only option for speed and large merchants | No REST |
| SEO AUDIT | Lighthouse/PageSpeed API | Industry standard for technical SEO checks | Not in scope yet |



-------------------------------------------


# Shopify SEO Optimizer - Backend API

A NestJS-based REST API for the Shopify SEO Optimizer app that analyzes products and provides SEO suggestions.

## 🏗️ Architecture

### Tech Stack
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Shopify OAuth 2.0
- **API Integration**: Shopify GraphQL Admin API
- **Validation**: class-validator & class-transformer
- **Rate Limiting**: @nestjs/throttler

### Project Structure
```
src/
├── entities/                 # TypeORM entities
│   ├── shop.entity.ts       # Shop/store information
│   └── scan-history.entity.ts # SEO scan results history
├── dto/                     # Data Transfer Objects
│   ├── common.dto.ts        # Shared DTOs (pagination, responses)
│   └── seo.dto.ts          # SEO-specific DTOs
├── modules/                 # Feature modules
│   ├── auth/               # Shopify OAuth authentication
│   ├── products/           # Product management
│   ├── seo/               # SEO scanning and suggestions
│   └── shopify/           # Shopify GraphQL service
├── app.module.ts          # Main application module
└── main.ts               # Application bootstrap
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/install` - Shopify app installation
- `GET /api/auth/callback` - OAuth callback
- `POST /api/auth/verify` - Verify shop session

### Products
- `GET /api/products` - List products with pagination
- `GET /api/products/:id` - Get single product details

### SEO Operations
- `POST /api/seo/scan/store` - Scan entire store for SEO issues
- `POST /api/seo/scan/products` - Scan selected products
- `POST /api/seo/apply/suggestion` - Apply single SEO suggestion
- `POST /api/seo/apply/bulk` - Apply multiple suggestions

## 🔧 Setup & Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=seo_optimizer

# Shopify App
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_SCOPES=read_products,write_products,read_product_listings,write_product_listings

# App Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Installation & Running
```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

## 📊 Database Schema

### Shop Entity
- `shopDomain` (Primary Key)
- `accessToken` - Shopify access token
- `scope` - OAuth scopes
- `email`, `shopName`, `planName` - Shop details
- `isActive` - Installation status
- `installedAt`, `updatedAt` - Timestamps

### ScanHistory Entity
- `id` (UUID Primary Key)
- `shopDomain` - Reference to shop
- `scanResults` - JSON scan results with suggestions
- `totalProducts`, `productsWithIssues` - Scan statistics
- `scanType` - 'store' or 'products'
- `createdAt` - Scan timestamp

## 🔍 SEO Analysis Features

### Current Implementation
- **Mock SEO Analysis**: Generates sample suggestions for testing
- **Product Title Optimization**: Suggests improved titles with keywords
- **Meta Description**: Identifies missing meta descriptions
- **Image Alt Text**: Flags missing alt text for accessibility

### Placeholder for Business Logic
The SEO analysis logic is currently implemented with mock data. To implement real SEO analysis:

1. **Keyword Research**: Integrate with keyword research APIs
2. **Content Analysis**: Implement NLP for content quality assessment
3. **Technical SEO**: Add schema markup, URL structure analysis
4. **Competitor Analysis**: Compare with industry benchmarks
5. **Performance Metrics**: Track improvement over time

## 🛡️ Security Features

- **CORS Configuration**: Restricted to frontend and Shopify domains
- **Rate Limiting**: 100 requests per minute per IP
- **Input Validation**: All DTOs validated with class-validator
- **Environment Variables**: Sensitive data in environment files
- **OAuth Security**: Proper Shopify OAuth 2.0 implementation

## 🔄 Integration Points

### Shopify GraphQL API
- **Product Fetching**: Retrieves product data with SEO fields
- **Product Updates**: Applies SEO suggestions via mutations
- **Image Management**: Updates alt text for product images
- **Bulk Operations**: Supports batch updates for efficiency

### Frontend Communication
- **REST API**: Clean REST endpoints for frontend consumption
- **Standardized Responses**: Consistent API response format
- **Error Handling**: Proper HTTP status codes and error messages

## 📝 Development Notes

### TODO Items for Production
1. **Implement Real SEO Logic**: Replace mock suggestions with actual analysis
2. **Add Webhook Verification**: Implement HMAC signature verification
3. **Optimize Bulk Operations**: Use Shopify's bulk API for large datasets
4. **Add Caching**: Implement Redis for frequently accessed data
5. **Monitoring**: Add logging, metrics, and health checks
6. **Testing**: Add unit and integration tests
7. **Documentation**: Generate API documentation with Swagger

### ESLint Warnings
The current codebase has some ESLint warnings related to:
- `any` type usage (intentional for Shopify API responses)
- Formatting preferences (can be auto-fixed)
- Unused parameters in placeholder methods

These are expected for a boilerplate and should be addressed during implementation.
