import { Injectable } from '@nestjs/common';
import {
  ParallelAnalysisInputDto,
  ProductAnalysisInputDto,
  ProductSeoAnalysisInputDto,
  ProductImageAnalysisInputDto,
  ProductMetaFieldAnalysisInputDto,
} from '../../dto/seo.dto';

@Injectable()
export class ProductDataTransformerService {
  
  /**
   * Transform Shopify product data into parallel analysis input format
   */
  transformShopifyProductToAnalysisInput(shopifyProduct: any): ParallelAnalysisInputDto {
    const productId = shopifyProduct.id;
    
    // Transform product content
    const productContent: ProductAnalysisInputDto = {
      productId,
      productTitle: shopifyProduct.title || '',
      productDescription: this.stripHtml(shopifyProduct.description || shopifyProduct.descriptionHtml || ''),
    };

    // Transform SEO metadata
    const seoMetadata: ProductSeoAnalysisInputDto = {
      productId,
      productSeoTitle: shopifyProduct.seo?.title || '',
      productSeoDescription: shopifyProduct.seo?.description || '',
    };

    // Transform images
    const images: ProductImageAnalysisInputDto[] = this.transformImages(shopifyProduct, productId);

    // Transform metafields
    const metafields: ProductMetaFieldAnalysisInputDto[] = this.transformMetafields(shopifyProduct, productId);

    return {
      productContent,
      seoMetadata,
      images,
      metafields,
    };
  }

  /**
   * Transform multiple Shopify products for batch analysis
   */
  transformMultipleProducts(shopifyProducts: any[]): ParallelAnalysisInputDto[] {
    return shopifyProducts.map(product => this.transformShopifyProductToAnalysisInput(product));
  }

  /**
   * Transform product images from Shopify format
   */
  private transformImages(shopifyProduct: any, productId: string): ProductImageAnalysisInputDto[] {
    const images: ProductImageAnalysisInputDto[] = [];
    
    // Handle different image data structures
    if (shopifyProduct.images?.edges) {
      // GraphQL format
      shopifyProduct.images.edges.forEach((edge: any) => {
        if (edge.node) {
          images.push({
            productId,
            productImageId: edge.node.id,
            productImageAltText: edge.node.altText || '',
          });
        }
      });
    } else if (shopifyProduct.images && Array.isArray(shopifyProduct.images)) {
      // REST API format
      shopifyProduct.images.forEach((image: any) => {
        images.push({
          productId,
          productImageId: image.id,
          productImageAltText: image.altText || '',
        });
      });
    }

    return images;
  }

  /**
   * Transform product metafields from Shopify format
   */
  private transformMetafields(shopifyProduct: any, productId: string): ProductMetaFieldAnalysisInputDto[] {
    const metafields: ProductMetaFieldAnalysisInputDto[] = [];
    
    // Handle different metafield data structures
    if (shopifyProduct.metafields?.edges) {
      // GraphQL format
      shopifyProduct.metafields.edges.forEach((edge: any) => {
        if (edge.node && this.isSeoRelevantMetafield(edge.node)) {
          metafields.push({
            productId,
            productMetaId: edge.node.id,
            productMetaValue: edge.node.value || '',
          });
        }
      });
    } else if (shopifyProduct.metafields && Array.isArray(shopifyProduct.metafields)) {
      // REST API format
      shopifyProduct.metafields.forEach((metafield: any) => {
        if (this.isSeoRelevantMetafield(metafield)) {
          metafields.push({
            productId,
            productMetaId: metafield.id,
            productMetaValue: metafield.value || '',
          });
        }
      });
    }

    return metafields;
  }

  /**
   * Check if a metafield is relevant for SEO analysis
   */
  private isSeoRelevantMetafield(metafield: any): boolean {
    if (!metafield.namespace || !metafield.key) {
      return false;
    }

    const seoRelevantFields = [
      'global.title_tag',
      'global.description_tag',
      'seo.title',
      'seo.description',
      'custom.seo_title',
      'custom.seo_description',
      'product.seo_title',
      'product.seo_description',
      'reviews.rating',
      'reviews.rating_count',
      'theme.label',
    ];

    const fieldKey = `${metafield.namespace}.${metafield.key}`;
    
    return seoRelevantFields.includes(fieldKey) || 
           metafield.key.toLowerCase().includes('seo') ||
           metafield.key.toLowerCase().includes('title') ||
           metafield.key.toLowerCase().includes('description') ||
           metafield.namespace.toLowerCase().includes('seo');
  }

  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    if (!html) return '';
    
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Create analysis input from individual components (for manual input)
   */
  createAnalysisInput(
    productId: string,
    title: string,
    description: string,
    seoTitle: string,
    seoDescription: string,
    images: Array<{ id: string; altText: string }> = [],
    metafields: Array<{ id: string; value: string }> = [],
  ): ParallelAnalysisInputDto {
    
    const productContent: ProductAnalysisInputDto = {
      productId,
      productTitle: title,
      productDescription: this.stripHtml(description),
    };

    const seoMetadata: ProductSeoAnalysisInputDto = {
      productId,
      productSeoTitle: seoTitle,
      productSeoDescription: seoDescription,
    };

    const imageInputs: ProductImageAnalysisInputDto[] = images.map(img => ({
      productId,
      productImageId: img.id,
      productImageAltText: img.altText,
    }));

    const metafieldInputs: ProductMetaFieldAnalysisInputDto[] = metafields.map(meta => ({
      productId,
      productMetaId: meta.id,
      productMetaValue: meta.value,
    }));

    return {
      productContent,
      seoMetadata,
      images: imageInputs,
      metafields: metafieldInputs,
    };
  }

  /**
   * Validate analysis input data
   */
  validateAnalysisInput(input: ParallelAnalysisInputDto): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate product content
    if (!input.productContent.productId) {
      errors.push('Product ID is required');
    }
    if (!input.productContent.productTitle) {
      errors.push('Product title is required');
    }

    // Validate SEO metadata
    if (input.productContent.productId !== input.seoMetadata.productId) {
      errors.push('Product IDs must match across all input sections');
    }

    // Validate images
    input.images.forEach((image, index) => {
      if (image.productId !== input.productContent.productId) {
        errors.push(`Image ${index + 1}: Product ID mismatch`);
      }
      if (!image.productImageId) {
        errors.push(`Image ${index + 1}: Image ID is required`);
      }
    });

    // Validate metafields
    input.metafields.forEach((metafield, index) => {
      if (metafield.productId !== input.productContent.productId) {
        errors.push(`Metafield ${index + 1}: Product ID mismatch`);
      }
      if (!metafield.productMetaId) {
        errors.push(`Metafield ${index + 1}: Metafield ID is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}