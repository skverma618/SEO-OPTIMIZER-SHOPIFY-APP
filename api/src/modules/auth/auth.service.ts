import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../../entities/shop.entity';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
  ) {}

  async generateAuthUrl(shop: string): Promise<string> {
    const apiKey = this.configService.get<string>('SHOPIFY_API_KEY');
    const scopes = this.configService.get<string>('SHOPIFY_SCOPES');
    const redirectUri = `${this.configService.get<string>('APP_URL')}/api/auth/callback`;
    const state = this.generateRandomState();

    const authUrl = `https://${shop}/admin/oauth/authorize?` +
      `client_id=${apiKey}&` +
      `scope=${scopes}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}`;

    return authUrl;
  }

  async handleCallback(
    code: string,
    shop: string,
    hmac: string,
    state: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // TODO: Verify HMAC signature for security
      
      // Exchange code for access token
      const accessToken = await this.exchangeCodeForToken(code, shop);
      
      if (!accessToken) {
        return { success: false, message: 'Failed to get access token' };
      }

      // Get shop information
      const shopInfo = await this.getShopInfo(shop, accessToken);
      
      // Save or update shop in database
      await this.saveShop(shop, accessToken, shopInfo);

      return { success: true, message: 'Installation successful' };
    } catch (error) {
      this.logger.error('Error handling OAuth callback', error);
      return { success: false, message: 'Installation failed' };
    }
  }

  async verifyShopSession(shop: string): Promise<boolean> {
    try {
      const shopEntity = await this.shopRepository.findOne({
        where: { shopDomain: shop },
      });

      if (!shopEntity || !shopEntity.isActive) {
        return false;
      }

      // TODO: Verify token is still valid with Shopify
      return true;
    } catch (error) {
      this.logger.error('Error verifying shop session', error);
      return false;
    }
  }

  private async exchangeCodeForToken(code: string, shop: string): Promise<string | null> {
    try {
      const apiKey = this.configService.get<string>('SHOPIFY_API_KEY');
      const apiSecret = this.configService.get<string>('SHOPIFY_API_SECRET');

      const response = await axios.post(`https://${shop}/admin/oauth/access_token`, {
        client_id: apiKey,
        client_secret: apiSecret,
        code,
      });

      return response.data.access_token;
    } catch (error) {
      this.logger.error('Error exchanging code for token', error);
      return null;
    }
  }

  private async getShopInfo(shop: string, accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`https://${shop}/admin/api/2023-10/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      });

      return response.data.shop;
    } catch (error) {
      this.logger.error('Error getting shop info', error);
      return {};
    }
  }

  private async saveShop(shop: string, accessToken: string, shopInfo: any): Promise<void> {
    try {
      const existingShop = await this.shopRepository.findOne({
        where: { shopDomain: shop },
      });

      if (existingShop) {
        // Update existing shop
        existingShop.accessToken = accessToken;
        existingShop.email = shopInfo.email || existingShop.email;
        existingShop.shopName = shopInfo.name || existingShop.shopName;
        existingShop.planName = shopInfo.plan_name || existingShop.planName;
        existingShop.isActive = true;
        existingShop.updatedAt = new Date();

        await this.shopRepository.save(existingShop);
      } else {
        // Create new shop
        const newShop = this.shopRepository.create({
          shopDomain: shop,
          accessToken,
          scope: this.configService.get<string>('SHOPIFY_SCOPES'),
          email: shopInfo.email,
          shopName: shopInfo.name,
          planName: shopInfo.plan_name,
          isActive: true,
        });

        await this.shopRepository.save(newShop);
      }
    } catch (error) {
      this.logger.error('Error saving shop', error);
      throw error;
    }
  }

  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}
