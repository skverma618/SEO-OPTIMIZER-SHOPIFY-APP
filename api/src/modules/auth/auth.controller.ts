import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Redirect,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ApiResponseDto } from '../../dto/common.dto';
import { BrandStoryDto } from '../../dto/brand.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('install')
  @ApiOperation({
    summary: 'Generate Shopify OAuth URL',
    description:
      'Generates the OAuth authorization URL for Shopify app installation',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Auth URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            authUrl: {
              type: 'string',
              example:
                'https://my-shop.myshopify.com/admin/oauth/authorize?...',
            },
          },
        },
        message: {
          type: 'string',
          example: 'Auth URL generated successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Shop parameter is required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async install(
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<{ authUrl: string }>> {
    try {
      if (!shop) {
        throw new HttpException(
          'Shop parameter is required',
          HttpStatus.BAD_REQUEST,
        );
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
  @ApiOperation({
    summary: 'Handle Shopify OAuth callback',
    description:
      'Processes the OAuth callback from Shopify and completes the installation',
  })
  @ApiQuery({
    name: 'code',
    description: 'Authorization code from Shopify',
    example: 'abc123def456',
  })
  @ApiQuery({
    name: 'hmac',
    description: 'HMAC signature for verification',
    example: 'sha256=...',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiQuery({
    name: 'state',
    description: 'State parameter for security',
    example: 'random-state-string',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with installation result',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Missing required parameters',
  })
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
      const result = await this.authService.handleCallback(
        code,
        shop,
        hmac,
        state,
      );

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

  @Get('verify')
  @ApiOperation({
    summary: 'Verify shop session',
    description:
      'Verifies if the shop has a valid session and is properly authenticated',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Shop session verification result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            isValid: { type: 'boolean', example: true },
          },
        },
        message: {
          type: 'string',
          example: 'Session is valid',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Shop parameter is required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async verify(
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<{ isValid: boolean }>> {
    try {
      if (!shop) {
        throw new HttpException(
          'Shop parameter is required',
          HttpStatus.BAD_REQUEST,
        );
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

  @Get('brand-story')
  @ApiOperation({
    summary: 'Get brand story',
    description: 'Retrieves the brand story for a shop from brandMapping column',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Brand story retrieved successfully',
  })
  async getBrandStory(
    @Query('shop') shop: string,
  ): Promise<ApiResponseDto<any>> {
    try {
      if (!shop) {
        throw new HttpException(
          'Shop parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const brandStory = await this.authService.getBrandStory(shop);

      return {
        success: true,
        data: brandStory,
        message: 'Brand story retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error retrieving brand story', error);
      throw new HttpException(
        'Failed to retrieve brand story',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('brand-story')
  @ApiOperation({
    summary: 'Save brand story',
    description: 'Saves the brand story to shop brandMapping column',
  })
  @ApiQuery({
    name: 'shop',
    description: 'Shopify shop domain',
    example: 'my-shop.myshopify.com',
  })
  @ApiBody({
    type: BrandStoryDto,
    description: 'Brand story data',
  })
  @ApiResponse({
    status: 200,
    description: 'Brand story saved successfully',
  })
  async saveBrandStory(
    @Query('shop') shop: string,
    @Body() brandStoryDto: BrandStoryDto,
  ): Promise<ApiResponseDto<any>> {
    try {
      if (!shop) {
        throw new HttpException(
          'Shop parameter is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.authService.saveBrandStory(shop, brandStoryDto);

      return {
        success: true,
        data: result,
        message: 'Brand story saved successfully',
      };
    } catch (error) {
      this.logger.error('Error saving brand story', error);
      throw new HttpException(
        'Failed to save brand story',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
