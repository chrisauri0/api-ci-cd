import { APP_CONFIG } from '../config/app.config';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const controller = new HealthController();
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('health regresa status ok y el mensaje configurado', () => {
    const res = controller.health();
    expect(res.status).toBe('ok');
    expect(res.message).toBe(APP_CONFIG.message);
    expect(typeof res.uptime).toBe('number');
  });

  it('ping regresa pong', () => {
    expect(controller.ping()).toEqual({ pong: true });
  });

  it('info usa valores por defecto sin variables de entorno', () => {
    delete process.env.GIT_SHA;
    delete process.env.NODE_ENV;
    expect(controller.info()).toMatchObject({
      commit: 'local',
      environment: 'development',
    });
  });

  it('info muestra el commit desplegado', () => {
    process.env.GIT_SHA = 'abc123';
    process.env.NODE_ENV = 'production';
    expect(controller.info()).toMatchObject({
      commit: 'abc123',
      environment: 'production',
    });
  });
});
