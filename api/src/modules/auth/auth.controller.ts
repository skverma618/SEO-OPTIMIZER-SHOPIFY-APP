import {
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponseDto } from '../../dto/common.dto';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('install')
  async install(@Query('shop') shop: string): Promise<ApiResponseDto<{ authUrl: string }>> {
    try {
      if (!shop) {
        throw new HttpException('Shop parameter is required', HttpStatus.BAD_REQUEST);
      }

      const authUrl = await this.authService.generateAuthUrl(shop);

      return {
        success: true,
        data: { authUrl },
        message: 'Auth URL generated successfully',
      };
    } catch (error) {
      this.logger.error('Error generating auth URL', error);
      throw new HttpException(
        'Failed to generate auth URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('callback')
  @Redirect()
  async callback(
    @Query('code') code: string,
    @Query('hmac') hmac: string,
    @Query('shop') shop: string,
    @Query('state') state: string,
  ) {
    try {
      if (!code || !shop) {
        throw new HttpException(
          'Missing required parameters',
          HttpStatus.BAD_REQUEST,
        );
      }

      // TODO: Verify HMAC signature for security
      const result = await this.authService.handleCallback(code, shop, hmac, state);

      if (result.success) {
        // Redirect to frontend with success
        return {
          url: `${process.env.FRONTEND_URL}?installation=success`,
          statusCode: 302,
        };
      } else {
        // Redirect to frontend with error
        return {
          url: `${process.env.FRONTEND_URL}?installation=error`,
          statusCode: 302,
        };
      }
    } catch (error) {
      this.logger.error('Error handling OAuth callback', error);
      return {
        url: `${process.env.FRONTEND_URL}?installation=error`,
        statusCode: 302,
      };
    }
  }

  @Post('verify')
  async verify(@Query('shop') shop: string): Promise<ApiResponseDto<{ isValid: boolean }>> {
    try {
      if (!shop) {
        throw new HttpException('Shop parameter is required', HttpStatus.BAD_REQUEST);
      }

      const isValid = await this.authService.verifyShopSession(shop);

      return {
        success: true,
        data: { isValid },
        message: isValid ? 'Session is valid' : 'Session is invalid',
      };
    } catch (error) {
      this.logger.error('Error verifying shop session', error);
      throw new HttpException(
        'Failed to verify session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}