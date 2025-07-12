import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  serveApp(@Res() res: Response): void {
    res.sendFile(join(__dirname, '..', '..', 'client', 'dist', 'index.html'));
  }

  @Get('*')
  serveFallback(@Res() res: Response): void {
    // For any route that doesn't match API routes, serve the React app
    res.sendFile(join(__dirname, '..', '..', 'client', 'dist', 'index.html'));
  }
}
