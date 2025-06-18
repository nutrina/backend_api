import { app } from "../";
import request from "supertest";

describe("POST /user", () => {
  it("should create a new user", async () => {
    const res = await request(app)
      .post("/v1/user?user=admin&password=admin")
      .send({ user: "test", password: "secret" })
      .set("Accept", "application/json");

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject({ status: "ok" });
  });

  it("should fail to create a user if the username is duplicate", async () => {
    const res = await request(app)
      .post("/v1/user?user=admin&password=admin")
      .send({ user: "admin", password: "secret" })
      .set("Accept", "application/json");

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject({ message: "User already exists" });
  });
});

describe("GET /user/:username/message", () => {
  const testUserName = "test";

  it("should retrieve messages for a specific user", async () => {
    // Create new message for user test
    const res = await request(app)
      .post("/v1/message?user=admin&password=admin")
      .send({ user: testUserName, message: "Test user message!" })
      .set("Accept", "application/json");

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject({ id: expect.any(Number) });

    const newCreatedId = res.body.id;

    // Retreive my messages for user test
    const readRes = await request(app)
      .get(
        `/v1/user/${testUserName}/message?user=admin&password=admin&limit=10&offset=0`
      )
      .set("Accept", "application/json");

    expect(readRes.headers["content-type"]).toMatch(/json/);
    expect(readRes.status).toEqual(200);
    expect(readRes.body).toEqual(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            id: newCreatedId,
            user: "test",
            message: "Test user message!",
            date: expect.any(String),
          }),
        ]),
      })
    );
  });
});

describe("GET /user/:username/stats", () => {
  const testUserName = "test-1";

  it("should retrieve stats for a specific user", async () => {
    // Create messages for user test
    for (let i = 0; i < 3; ++i) {
      const res = await request(app)
        .post("/v1/message?user=admin&password=admin")
        .send({ user: testUserName, message: `Test user message ${i}!` })
        .set("Accept", "application/json");

      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.status).toEqual(200);
      expect(res.body).toMatchObject({ id: expect.any(Number) });
    }

    // As user test, retreive my message
    const readRes = await request(app)
      .get(`/v1/user/${testUserName}/stats?user=admin&password=admin`)
      .set("Accept", "application/json");

    expect(readRes.headers["content-type"]).toMatch(/json/);
    expect(readRes.status).toEqual(200);
    expect(readRes.body).toEqual({
      firstMessage: "Test user message 0!",
      firstMessageDate: expect.any(String),
      lastMessageDate: expect.any(String),
      totalMessages: 3,
      username: testUserName,
    });
  });
});
