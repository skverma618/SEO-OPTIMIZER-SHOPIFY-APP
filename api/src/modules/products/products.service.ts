import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../../entities/shop.entity';
import { ShopifyService } from '../shopify/shopify.service';
import { PaginationDto } from '../../dto/common.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    private shopifyService: ShopifyService,
  ) {}

  async getProducts(shopDomain: string, paginationDto: PaginationDto) {
    try {
      const shop = await this.shopRepository.findOne({
        where: { shopDomain },
      });

      if (!shop) {
        throw new Error('Shop not found');
      }

      const { page = 1, limit = 10, search } = paginationDto;
      const first = limit;
      const after = page > 1 ? this.generateCursor(page, limit) : undefined;

      const result = await this.shopifyService.fetchProducts(
        shopDomain,
        shop.accessToken,
        first,
        after,
        search,
      );

      if (result.errors) {
        throw new Error('Shopify API error: ' + JSON.stringify(result.errors));
      }

      const products = result.data?.products?.edges?.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        status: edge.node.status,
        vendor: edge.node.vendor,
        productType: edge.node.productType,
        createdAt: edge.node.createdAt,
        updatedAt: edge.node.updatedAt,
        seo: edge.node.seo,
        description: edge.node.description,
        images: edge.node.images?.edges?.map((imgEdge: any) => ({
          id: imgEdge.node.id,
          url: imgEdge.node.url,
          altText: imgEdge.node.altText,
        })) || [],
        totalInventory: edge.node.variants?.edges?.[0]?.node?.inventoryQuantity || 0,
      })) || [];

      const pageInfo = result.data?.products?.pageInfo || {};

      return {
        products,
        pagination: {
          page,
          limit,
          hasNextPage: pageInfo.hasNextPage,
          hasPreviousPage: pageInfo.hasPreviousPage,
          total: products.length, // Note: Shopify doesn't provide total count
        },
      };
    } catch (error) {
      this.logger.error('Error fetching products', error);
      throw error;
    }
  }

  async getProductById(shopDomain: string, productId: string) {
    try {
      const shop = await this.shopRepository.findOne({
        where: { shopDomain },
      });

      if (!shop) {
        throw new Error('Shop not found');
      }

      const result = await this.shopifyService.fetchProductById(
        shopDomain,
        shop.accessToken,
        productId,
      );

      if (result.errors) {
        throw new Error('Shopify API error: ' + JSON.stringify(result.errors));
      }

      const product = result.data?.product;
      if (!product) {
        return null;
      }

      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        status: product.status,
        vendor: product.vendor,
        productType: product.productType,
        description: product.description,
        seo: product.seo,
        images: product.images?.edges?.map((edge: any) => ({
          id: edge.node.id,
          url: edge.node.url,
          altText: edge.node.altText,
        })) || [],
        metafields: product.metafields?.edges?.map((edge: any) => ({
          id: edge.node.id,
          namespace: edge.node.namespace,
          key: edge.node.key,
          value: edge.node.value,
        })) || [],
      };
    } catch (error) {
      this.logger.error('Error fetching product by ID', error);
      throw error;
    }
  }

  private generateCursor(page: number, limit: number): string {
    // Simple cursor generation - in production, use actual Shopify cursors
    const offset = (page - 1) * limit;
    return Buffer.from(offset.toString()).toString('base64');
  }
}
