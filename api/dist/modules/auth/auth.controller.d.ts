import { AuthService } from './auth.service';
import { ApiResponseDto } from '../../dto/common.dto';
import { BrandStoryDto } from '../../dto/brand.dto';
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    install(shop: string): Promise<ApiResponseDto<{
        authUrl: string;
    }>>;
    callback(code: string, hmac: string, shop: string, state: string): Promise<{
        url: string;
        statusCode: number;
    }>;
    verify(shop: string): Promise<ApiResponseDto<{
        isValid: boolean;
    }>>;
    getBrandStory(shop: string): Promise<ApiResponseDto<any>>;
    saveBrandStory(shop: string, brandStoryDto: BrandStoryDto): Promise<ApiResponseDto<any>>;
}
