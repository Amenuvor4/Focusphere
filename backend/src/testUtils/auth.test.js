const dbHandler = require("./setupDB");
const app = require("../app");
const request = require("supertest");
const { sendVerificationEmail } = require("../utils/emailSender");
const User = require('../models/User');
jest.mock('../utils/emailSender.js', () => ({
  ...jest.requireActual('../utils/emailSender.js'),
  sendVerificationEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
}));


let accessToken;
let adminToken;

beforeAll(async () => await dbHandler.connect());
afterAll(async () => {
  await dbHandler.clearDatabase();
  await dbHandler.closeDatabase();
});

describe("Registering a Users API test", () => {
  it("handles registration requests", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "brad", email: "test2@gmail.com", password: "password123" });
    expect(sendVerificationEmail).toHaveBeenCalledWith('test2@gmail.com', expect.any(String));  
    expect(res.status).toBe(201);
    await User.findOneAndUpdate({ email: 'test2@gmail.com'}, { role: 'admin'})
  });
});


describe("Registering a Users API test", () => {
  it("handles registration requests", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "John", email: "test3@gmail.com", password: "password123" });
    expect(sendVerificationEmail).toHaveBeenCalledWith('test3@gmail.com', expect.any(String));  
    expect(res.status).toBe(201);
  });
});


describe("User Logging In API test", () => {
  it("Handles login requests", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test3@gmail.com", password: "password123" });
    accessToken = res.body.accessToken;
    expect(res.status).toBe(200);
  });
});

describe("Admin Logging In API test", () => {
  it("Handles Admin login requests", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test2@gmail.com", password: "password123" });
    adminToken = res.body.accessToken;
    expect(res.status).toBe(200);
  });
});


describe("Getting User Profile API tests", () => {
  it("Handles profile requests for a specific user", async () => {
    const res = await request(app)
      .get("/auth/profile")
      .set("Authorization", "Bearer " + accessToken);
    expect(res.status).toBe(200);
  });
});

describe("Getting all Users API test", () => {
  it("Handles request to get all users in db", async () => {
    const res = await request(app)
      .get("/auth/users")
      .set("Authorization", "Bearer " + adminToken);
    expect(res.status).toBe(200);
  })
})

describe("Non-admin Getting all Users API test", () => {
  it("Handles request to get all users in db", async () => {
    const res = await request(app)
      .get("/auth/users")
      .set("Authorization", "Bearer " + accessToken);
    expect(res.status).toBe(403);
  })
})