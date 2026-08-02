const dbHandler = require('./setupDB');
const request = require('supertest');
const app = require('../app');
const { sendVerificationEmail } = require('../utils/emailSender');
jest.mock('../utils/emailSender.js', () => ({
  ...jest.requireActual('../utils/emailSender.js'),
  sendVerificationEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
}));

let accessToken;
let taskId;

beforeAll(async () => await dbHandler.connect());
afterAll(async () => {
  await dbHandler.clearDatabase();
  await dbHandler.closeDatabase();
});

describe('Public test route', () => {
  it('is reachable without a token', async () => {
    const res = await request(app).get('/tasks/test');
    expect(res.status).toBe(200);
  });
});

describe('Auth guard', () => {
  it('rejects requests to protected task routes with no token', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(401);
  });
});

describe('User registration', () => {
  it('registers the test user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Task Tester', email: 'tasktester@gmail.com', password: 'password123' });
    expect(sendVerificationEmail).toHaveBeenCalledWith('tasktester@gmail.com', expect.any(String));
    expect(res.status).toBe(201);
  });
});

describe('User login', () => {
  it('logs the test user in', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'tasktester@gmail.com', password: 'password123' });
    accessToken = res.body.accessToken;
    expect(res.status).toBe(200);
  });
});

describe('Creating a task', () => {
  it('creates a task with valid data', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({
        title: 'Get more money',
        description: 'Work a job to make more money',
        priority: 'medium',
        status: 'todo',
        category: 'Finance',
      });

    expect(res.status).toBe(201);
    expect(res.body.task).toHaveProperty('id');
    expect(res.body.task.title).toBe('Get more money');
    expect(res.body.task.category).toBe('Finance');

    taskId = res.body.task.id;
  });

  it('rejects a task with no title', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ description: 'Missing a title' });

    expect(res.status).toBe(400);
  });

  it('rejects an invalid priority value', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ title: 'Bad priority task', priority: 'urgent' });

    expect(res.status).toBe(400);
  });
});

describe('Getting tasks', () => {
  it('returns the list of tasks for the authenticated user', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', 'Bearer ' + accessToken);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((t) => t.id === taskId)).toBe(true);
  });
});

describe('Updating a task', () => {
  it('updates the task status', async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('completed');
  });

  it('rejects an invalid task id format', async () => {
    const res = await request(app)
      .put('/tasks/not-a-real-id')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ status: 'completed' });

    expect(res.status).toBe(400);
  });
});

describe('Deleting a task', () => {
  it('deletes the task', async () => {
    const res = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', 'Bearer ' + accessToken);

    expect(res.status).toBe(200);
  });

  it('no longer returns the deleted task in the task list', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('Authorization', 'Bearer ' + accessToken);

    expect(res.status).toBe(200);
    expect(res.body.some((t) => t.id === taskId)).toBe(false);
  });
});
