"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ShopifyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let ShopifyService = ShopifyService_1 = class ShopifyService {
    configService;
    logger = new common_1.Logger(ShopifyService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    createGraphQLClient(shopDomain, accessToken) {
        return axios_1.default.create({
            baseURL: `https://${shopDomain}/admin/api/2023-10/graphql.json`,
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
        });
    }
    async fetchProducts(shopDomain, accessToken, first = 10, after, query) {
        const client = this.createGraphQLClient(shopDomain, accessToken);
        const searchQuery = query ? `title:*${query}*` : '';
        const graphqlQuery = `
      query getProducts($first: Int!, $after: String, $query: String) {
        products(first: $first, after: $after, query: $query) {
          edges {
            node {
              id
              title
              handle
              status
              vendor
              productType
              createdAt
              updatedAt
              seo {
                title
                description
              }
              description
              images(first: 5) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    inventoryQuantity
                  }
                }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;
        try {
            const response = await client.post('', {
                query: graphqlQuery,
                variables: {
                    first,
                    after,
                    query: searchQuery,
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Error fetching products from Shopify', error);
            throw error;
        }
    }
    async fetchProductById(shopDomain, accessToken, productId) {
        const client = this.createGraphQLClient(shopDomain, accessToken);
        const graphqlQuery = `
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          status
          vendor
          productType
          description
          seo {
            title
            description
          }
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          metafields(first: 10) {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        }
      }
    `;
        try {
            const response = await client.post('', {
                query: graphqlQuery,
                variables: { id: productId },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Error fetching product by ID from Shopify', error);
            throw error;
        }
    }
    async updateProduct(shopDomain, accessToken, productId, updates) {
        const client = this.createGraphQLClient(shopDomain, accessToken);
        const graphqlMutation = `
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
            seo {
              title
              description
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
        try {
            const response = await client.post('', {
                query: graphqlMutation,
                variables: {
                    input: {
                        id: productId,
                        ...updates,
                    },
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Error updating product in Shopify', error);
            throw error;
        }
    }
    async updateProductImage(shopDomain, accessToken, imageId, altText) {
        const client = this.createGraphQLClient(shopDomain, accessToken);
        const graphqlMutation = `
      mutation productImageUpdate($productImage: ProductImageInput!) {
        productImageUpdate(productImage: $productImage) {
          image {
            id
            altText
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
        try {
            const response = await client.post('', {
                query: graphqlMutation,
                variables: {
                    productImage: {
                        id: imageId,
                        altText,
                    },
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Error updating product image in Shopify', error);
            throw error;
        }
    }
    async verifyWebhook(data, hmacHeader) {
        return true;
    }
};
exports.ShopifyService = ShopifyService;
exports.ShopifyService = ShopifyService = ShopifyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ShopifyService);
//# sourceMappingURL=shopify.service.js.map