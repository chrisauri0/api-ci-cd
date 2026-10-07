import { Controller, Get } from '@nestjs/common';
import { APP_CONFIG } from '../config/app.config';

@Controller()
export class HealthController {
  /** GET /api/health -> estado de la API (lo usa el pipeline para verificar el deploy) */
  @Get('health')
  health() {
    return {
      status: 'ok',
      message: APP_CONFIG.message,
      version: APP_CONFIG.version,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  /** GET /api/health/ping -> respuesta mínima (healthcheck del contenedor) */
  @Get('health/ping')
  ping() {
    return { pong: true };
  }

  /** GET /api/info -> información de la versión desplegada (commit incluido) */
  @Get('info')
  info() {
    return {
      name: APP_CONFIG.name,
      version: APP_CONFIG.version,
      commit: process.env.GIT_SHA || 'local',
      environment: process.env.NODE_ENV || 'development',
      node: process.version,
    };
  }
}
