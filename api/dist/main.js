"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: [
            configService.get('FRONTEND_URL') || 'http://localhost:5173',
            /\.shopify\.com$/,
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Shopify-Access-Token'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    app.setGlobalPrefix('api');
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    console.log(`🚀 SEO Optimizer API is running on: http://localhost:${port}`);
    console.log(`📚 Environment: ${configService.get('NODE_ENV')}`);
}
bootstrap();
//# sourceMappingURL=main.js.map