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
        console.log("=== Shopify Product Update: Start ===");
        console.log("Shop Domain:", shopDomain);
        console.log("Product ID:", productId);
        console.log("Update Payload:", updates);
        const graphqlMutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          descriptionHtml
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
            console.log("Sending GraphQL mutation to Shopify...");
            const input = this.buildProductUpdateInput(productId, updates);
            console.log("INPUT SENT TO SHOPIFY API : ", input);
            const response = await client.post('', {
                query: graphqlMutation,
                variables: { input },
            });
            console.log("Raw response from Shopify:", JSON.stringify(response.data, null, 2));
            const result = response.data.data.productUpdate;
            if (result.userErrors && result.userErrors.length > 0) {
                console.warn("Shopify returned userErrors:", result.userErrors);
                return {
                    success: false,
                    errors: result.userErrors,
                };
            }
            console.log("Product updated successfully:", result.product);
            return {
                success: true,
                product: result.product,
            };
        }
        catch (error) {
            console.error('Error updating product in Shopify:', error);
            throw error;
        }
        finally {
            console.log("=== Shopify Product Update: End ===");
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
    async updateProductMetafield(shopDomain, accessToken, productId, namespace, key, value, type = 'single_line_text_field') {
        const client = this.createGraphQLClient(shopDomain, accessToken);
        const graphqlMutation = `
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
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
                    metafields: [
                        {
                            ownerId: productId,
                            namespace,
                            key,
                            value,
                            type,
                        },
                    ],
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Error updating product metafield in Shopify', error);
            throw error;
        }
    }
    async verifyWebhook(data, hmacHeader) {
        return true;
    }
    buildProductUpdateInput(productId, updates, currentProduct) {
        const input = { id: productId };
        if (updates.title !== undefined) {
            input.title = updates.title;
        }
        if (updates.descriptionHtml !== undefined) {
            input.descriptionHtml = updates.descriptionHtml;
        }
        if (updates.seo) {
            input.seo = {
                title: updates.seo.title !== undefined
                    ? updates.seo.title
                    : currentProduct?.seo?.title || '',
                description: updates.seo.description !== undefined
                    ? updates.seo.description
                    : currentProduct?.seo?.description || ''
            };
        }
        return input;
    }
};
exports.ShopifyService = ShopifyService;
exports.ShopifyService = ShopifyService = ShopifyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ShopifyService);
//# sourceMappingURL=shopify.service.js.map