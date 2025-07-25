import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Shop } from '../../entities/shop.entity';
import { BrandStoryDto } from '../../dto/brand.dto';
export declare class AuthService {
    private configService;
    private shopRepository;
    private readonly logger;
    constructor(configService: ConfigService, shopRepository: Repository<Shop>);
    generateAuthUrl(shop: string): Promise<string>;
    handleCallback(code: string, shop: string, hmac: string, state: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    verifyShopSession(shop: string): Promise<boolean>;
    private exchangeCodeForToken;
    private getShopInfo;
    private saveShop;
    private generateRandomState;
    getBrandStory(shop: string): Promise<any>;
    saveBrandStory(shop: string, brandStoryDto: BrandStoryDto): Promise<any>;
}
