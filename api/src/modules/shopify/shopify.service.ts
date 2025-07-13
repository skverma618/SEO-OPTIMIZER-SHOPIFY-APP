import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class ShopifyService {
  private readonly logger = new Logger(ShopifyService.name);

  constructor(private configService: ConfigService) {}

  private createGraphQLClient(shopDomain: string, accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: `https://${shopDomain}/admin/api/2023-10/graphql.json`,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });
  }

  async fetchProducts(
    shopDomain: string,
    accessToken: string,
    first: number = 10,
    after?: string,
    query?: string,
  ) {
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
    } catch (error) {
      this.logger.error('Error fetching products from Shopify', error);
      throw error;
    }
  }

  async fetchProductById(shopDomain: string, accessToken: string, productId: string) {
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
    } catch (error) {
      this.logger.error('Error fetching product by ID from Shopify', error);
      throw error;
    }
  }

  async updateProduct(
  shopDomain: string,
  accessToken: string,
  productId: string, // Must be a GraphQL global ID!
  updates: any,
) {
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

    console.log("INPUT SENT TO SHOPIFY API : ", input)
    const response = await client.post('', {
      query: graphqlMutation,
      variables: { input },
    });

    // const response = await client.post('', {
    //   query: graphqlMutation,
    //   variables: {
    //     input: {
    //       id: productId, // e.g. "gid://shopify/Product/1234567890"
    //       ...updates,    // e.g. { descriptionHtml: "<p>New description</p>" }
    //     },
    //   },
    // });

    // Log the full response for debugging
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
  } catch (error) {
    console.error('Error updating product in Shopify:', error);
    throw error;
  } finally {
    console.log("=== Shopify Product Update: End ===");
  }
}


  async updateProductImage(
    shopDomain: string,
    accessToken: string,
    imageId: string,
    altText: string,
  ) {
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
    } catch (error) {
      this.logger.error('Error updating product image in Shopify', error);
      throw error;
    }
  }

  async updateProductMetafield(
    shopDomain: string,
    accessToken: string,
    productId: string,
    namespace: string,
    key: string,
    value: string,
    type: string = 'single_line_text_field',
  ) {
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
    } catch (error) {
      this.logger.error('Error updating product metafield in Shopify', error);
      throw error;
    }
  }

  async verifyWebhook(data: string, hmacHeader: string): Promise<boolean> {
    // TODO: Implement webhook verification logic
    // This would use crypto to verify the HMAC signature
    return true;
  }

  private buildProductUpdateInput(productId: string, updates: any, currentProduct?: any) {
    const input: any = { id: productId };

    // Update title if provided
    if (updates.title !== undefined) {
      input.title = updates.title;
    }

    // Update descriptionHtml if provided
    if (updates.descriptionHtml !== undefined) {
      input.descriptionHtml = updates.descriptionHtml;
    }

    // Update SEO fields dynamically
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

    // Add other fields as needed...

    return input;
  }

}
