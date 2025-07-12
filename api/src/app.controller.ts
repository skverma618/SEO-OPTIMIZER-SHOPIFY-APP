import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  serveApp(@Res() res: Response): void {
    res.sendFile(join(__dirname, '..', '..', 'client', 'dist', 'index.html'));
  }
}
