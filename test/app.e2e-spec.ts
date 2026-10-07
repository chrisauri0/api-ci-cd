import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

/**
 * Pruebas de integración: levantan la app completa (como en producción)
 * y golpean los endpoints reales con HTTP usando supertest.
 */

interface ResourceCase {
  path: string;
  valid: () => Record<string, unknown>;
  invalid: Record<string, unknown>;
  patch: Record<string, unknown>;
  searchTerm: string;
}

let seq = 0;
const unique = () => `${Date.now()}${seq++}`;

const resources: ResourceCase[] = [
  {
    path: 'users',
    valid: () => ({ name: 'Usuario Test', email: `test${unique()}@mail.com` }),
    invalid: { name: 'Sin email' },
    patch: { role: 'admin' },
    searchTerm: 'usuario test',
  },
  {
    path: 'products',
    valid: () => ({ name: 'Producto Test', price: 99.5, stock: 4 }),
    invalid: { price: 10 },
    patch: { price: 120 },
    searchTerm: 'producto',
  },
  {
    path: 'categories',
    valid: () => ({ name: 'Categoría Test', description: 'desc' }),
    invalid: { description: 'sin nombre' },
    patch: { description: 'nueva desc' },
    searchTerm: 'categoría test',
  },
  {
    path: 'orders',
    valid: () => ({ customerId: 1, total: 500 }),
    invalid: { total: 10 },
    patch: { total: 750 },
    searchTerm: 'pending',
  },
  {
    path: 'customers',
    valid: () => ({ name: 'Cliente Test', email: 'cliente@test.com', phone: '442000' }),
    invalid: { name: 'Sin email' },
    patch: { phone: '4429999999' },
    searchTerm: 'cliente test',
  },
  {
    path: 'suppliers',
    valid: () => ({ name: 'Proveedor Test', contact: 'Juan' }),
    invalid: { contact: 'sin nombre' },
    patch: { contact: 'Pedro' },
    searchTerm: 'proveedor test',
  },
  {
    path: 'tasks',
    valid: () => ({ title: 'Tarea Test', description: 'probar' }),
    invalid: { description: 'sin título' },
    patch: { priority: 'high' },
    searchTerm: 'tarea test',
  },
  {
    path: 'notes',
    valid: () => ({ title: 'Nota Test', content: 'contenido' }),
    invalid: { title: 'sin contenido' },
    patch: { content: 'editado' },
    searchTerm: 'nota test',
  },
];

describe('API e2e', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET /api/health', async () => {
      const res = await http.get('/api/health').expect(200);
      expect(res.body.status).toBe('ok');
      expect(typeof res.body.message).toBe('string');
    });

    it('GET /api/health/ping', async () => {
      await http.get('/api/health/ping').expect(200, { pong: true });
    });

    it('GET /api/info', async () => {
      const res = await http.get('/api/info').expect(200);
      expect(res.body).toHaveProperty('commit');
      expect(res.body).toHaveProperty('version');
    });

    it('ruta inexistente regresa 404', async () => {
      await http.get('/api/no-existe').expect(404);
    });
  });

  describe.each(resources)('CRUD /api/$path', (r) => {
    const base = `/api/${r.path}`;
    let createdId: number;

    it(`POST ${base} crea un registro (201)`, async () => {
      const res = await http.post(base).send(r.valid()).expect(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
      createdId = res.body.id;
    });

    it(`POST ${base} sin campos obligatorios regresa 400`, async () => {
      await http.post(base).send(r.invalid).expect(400);
    });

    it(`POST ${base} con body que no es objeto regresa 400`, async () => {
      await http.post(base).send([1, 2, 3]).expect(400);
    });

    it(`GET ${base} lista los registros`, async () => {
      const res = await http.get(base).expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((i: { id: number }) => i.id === createdId)).toBe(true);
    });

    it(`GET ${base}/count regresa el total`, async () => {
      const res = await http.get(`${base}/count`).expect(200);
      expect(res.body.total).toBeGreaterThan(0);
    });

    it(`GET ${base}/search?q= encuentra el registro`, async () => {
      const res = await http
        .get(`${base}/search`)
        .query({ q: r.searchTerm })
        .expect(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it(`GET ${base}/search sin q regresa 400`, async () => {
      await http.get(`${base}/search`).expect(400);
    });

    it(`GET ${base}/:id regresa el registro`, async () => {
      const res = await http.get(`${base}/${createdId}`).expect(200);
      expect(res.body.id).toBe(createdId);
    });

    it(`GET ${base}/:id inexistente regresa 404`, async () => {
      await http.get(`${base}/999999`).expect(404);
    });

    it(`GET ${base}/:id no numérico regresa 400`, async () => {
      await http.get(`${base}/abc`).expect(400);
    });

    it(`PUT ${base}/:id reemplaza el registro`, async () => {
      const body = r.valid();
      const res = await http.put(`${base}/${createdId}`).send(body).expect(200);
      expect(res.body.id).toBe(createdId);
    });

    it(`PUT ${base}/:id sin obligatorios regresa 400`, async () => {
      await http.put(`${base}/${createdId}`).send(r.invalid).expect(400);
    });

    it(`PATCH ${base}/:id actualiza parcialmente`, async () => {
      const res = await http.patch(`${base}/${createdId}`).send(r.patch).expect(200);
      expect(res.body).toMatchObject(r.patch);
    });

    it(`PATCH ${base}/:id vacío regresa 400`, async () => {
      await http.patch(`${base}/${createdId}`).send({}).expect(400);
    });

    it(`DELETE ${base}/:id elimina el registro`, async () => {
      await http.delete(`${base}/${createdId}`).expect(200, {
        deleted: true,
        id: createdId,
      });
      await http.get(`${base}/${createdId}`).expect(404);
    });

    it(`DELETE ${base}/:id inexistente regresa 404`, async () => {
      await http.delete(`${base}/999999`).expect(404);
    });
  });

  describe('Endpoints extra', () => {
    it('PATCH /api/users/:id/deactivate', async () => {
      const res = await http.patch('/api/users/1/deactivate').expect(200);
      expect(res.body.active).toBe(false);
    });

    it('POST /api/users con email duplicado regresa 409', async () => {
      await http
        .post('/api/users')
        .send({ name: 'Dup', email: 'ana@example.com' })
        .expect(409);
    });

    it('GET /api/products/low-stock', async () => {
      const res = await http.get('/api/products/low-stock').query({ max: 5 }).expect(200);
      expect(res.body.every((p: { stock: number }) => p.stock <= 5)).toBe(true);
    });

    it('GET /api/products/low-stock usa max=5 por defecto', async () => {
      await http.get('/api/products/low-stock').expect(200);
    });

    it('PATCH /api/products/:id/stock', async () => {
      const res = await http
        .patch('/api/products/1/stock')
        .send({ quantity: 2 })
        .expect(200);
      expect(res.body.stock).toBe(12);
      await http.patch('/api/products/1/stock').send({ quantity: -1000 }).expect(400);
    });

    it('PATCH /api/orders/:id/status', async () => {
      const res = await http
        .patch('/api/orders/1/status')
        .send({ status: 'paid' })
        .expect(200);
      expect(res.body.status).toBe('paid');
      await http.patch('/api/orders/1/status').send({ status: 'x' }).expect(400);
    });

    it('GET /api/tasks/pending y PATCH /api/tasks/:id/complete', async () => {
      const before = await http.get('/api/tasks/pending').expect(200);
      await http.patch('/api/tasks/1/complete').expect(200);
      const after = await http.get('/api/tasks/pending').expect(200);
      expect(after.body.length).toBe(before.body.length - 1);
    });
  });
});
