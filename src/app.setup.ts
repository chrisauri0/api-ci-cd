import { INestApplication } from '@nestjs/common';

/**
 * Configuración compartida entre main.ts y las pruebas e2e,
 * así los tests prueban la app exactamente como corre en producción.
 */
export function configureApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix('api');
  app.enableCors();
  app.enableShutdownHooks();
  return app;
}
