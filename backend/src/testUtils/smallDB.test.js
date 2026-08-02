const dbHandler = require('./setupDB');
const request = require('supertest');
const app = require("../app");


beforeAll(async () => await dbHandler.connect());
afterEach(async () => await dbHandler.clearDatabase());
afterAll(async () => await dbHandler.closeDatabase());

describe('Nothing API', () => {
  it('handles requests', async () => {
    const res = await request(app).get('/ai/test');
    expect(res.status).toBe(200);
  });
});
