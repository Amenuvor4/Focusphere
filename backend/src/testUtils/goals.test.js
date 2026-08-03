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
let goalId;

beforeAll(async () => await dbHandler.connect());
afterAll(async () => {
  await dbHandler.clearDatabase();
  await dbHandler.closeDatabase();
});

describe('Public test route', () => {
  it('is reachable without a token', async () => {
    const res = await request(app).get('/goals/test');
    expect(res.status).toBe(200);
  });
});

describe('Auth guard', () => {
  it('rejects requests to protected goal routes with no token', async () => {
    const res = await request(app).get('/goals');
    expect(res.status).toBe(401);
  });
});

describe('User registration', () => {
  it('registers the test user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Goal Tester', email: 'goaltester@gmail.com', password: 'password123' });
    expect(sendVerificationEmail).toHaveBeenCalledWith('goaltester@gmail.com', expect.any(String));
    expect(res.status).toBe(201);
  });
});

describe('User login', () => {
  it('logs the test user in', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'goaltester@gmail.com', password: 'password123' });
    accessToken = res.body.accessToken;
    expect(res.status).toBe(200);
  });
});

describe('Creating a goal', () => {
  it('creates a goal with valid data', async () => {
    const res = await request(app)
      .post('/goals')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({
        title: 'Learn Jest',
        description: 'Get comfortable writing backend tests',
        progress: 0,
        priority: 'high',
        deadline: '2027-01-01',
      });

    expect(res.status).toBe(201);
    expect(res.body.goal).toHaveProperty('_id');
    expect(res.body.goal.title).toBe('Learn Jest');

    goalId = res.body.goal._id;
  });

  it('rejects a goal with no description', async () => {
    const res = await request(app)
      .post('/goals')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ title: 'Missing description', progress: 0 });

    expect(res.status).toBe(400);
  });

  it('rejects progress outside 0-100', async () => {
    const res = await request(app)
      .post('/goals')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ title: 'Bad progress', description: 'Progress too high', progress: 150 });

    expect(res.status).toBe(400);
  });

  it('rejects a deadline in the past', async () => {
    const res = await request(app)
      .post('/goals')
      .set('Authorization', 'Bearer ' + accessToken)
      .send({
        title: 'Bad deadline',
        description: 'Deadline already passed',
        progress: 0,
        deadline: '2020-01-01',
      });

    expect(res.status).toBe(400);
  });
});

describe('Getting goals', () => {
  it('returns the list of goals for the authenticated user', async () => {
    const res = await request(app)
      .get('/goals')
      .set('Authorization', 'Bearer ' + accessToken);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((g) => g._id === goalId)).toBe(true);
  });

  it('returns a single goal by id', async () => {
    const res = await request(app)
      .get(`/goals/${goalId}`)
      .set('Authorization', 'Bearer ' + accessToken);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(goalId);
  });

  it('rejects an invalid goal id format', async () => {
    const res = await request(app)
      .get('/goals/not-a-real-id')
      .set('Authorization', 'Bearer ' + accessToken);

    expect(res.status).toBe(400);
  });

  it('returns 404 for a well-formed id that does not exist', async () => {
    const res = await request(app)
      .get('/goals/507f1f77bcf86cd799439011')
      .set('Authorization', 'Bearer ' + accessToken);

    expect(res.status).toBe(404);
  });
});

describe('Updating a goal', () => {
  it('updates the goal progress', async () => {
    const res = await request(app)
      .put(`/goals/${goalId}`)
      .set('Authorization', 'Bearer ' + accessToken)
      .send({ progress: 50 });

    expect(res.status).toBe(200);
    expect(res.body.goal.progress).toBe(50);
  });
});

describe('Deleting a goal', () => {
  it('deletes the goal', async () => {
    const res = await request(app)
      .delete(`/goals/${goalId}`)
      .set('Authorization', 'Bearer ' + accessToken);

    expect(res.status).toBe(200);
  });

  it('no longer returns the deleted goal', async () => {
    const res = await request(app)
      .get(`/goals/${goalId}`)
      .set('Authorization', 'Bearer ' + accessToken);

    expect(res.status).toBe(404);
  });
});
