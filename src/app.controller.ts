import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  healthCheck() {
    return {
      status: 'ok',
      message: this.appService.getHello(), // ✅ Usar o service
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get('health')
  health() {
    return this.appService.getHealth(); // ✅ Usar o service
  }
}
