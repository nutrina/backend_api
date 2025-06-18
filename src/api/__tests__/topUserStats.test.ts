import { app } from "../";
import request from "supertest";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("GET /top-user-stats", () => {
  const testUserName = "test-stats";

  it("should retrieve top user stats", async () => {
    // Create messages for user test
    for (let i = 0; i < 3; ++i) {
      const res = await request(app)
        .post("/v1/message?user=admin&password=admin")
        .send({ user: testUserName, message: `Test user message ${i}!` })
        .set("Accept", "application/json");

      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.status).toEqual(200);
      expect(res.body).toMatchObject({ id: expect.any(Number) });

      await sleep(100);
    }

    // As user test, retreive my message
    const readRes = await request(app)
      .get(`/v1/top-user-stats?user=admin&password=admin`)
      .set("Accept", "application/json");

    expect(readRes.headers["content-type"]).toMatch(/json/);
    expect(readRes.status).toEqual(200);
    expect(readRes.body).toEqual(
      expect.arrayContaining([
        {
          firstMessage: "Hello, world!",
          firstMessageDate: expect.any(String),
          lastMessageDate: expect.any(String),
          totalMessages: 5,
          username: "admin",
        },
        {
          firstMessage: "Test user message 0!",
          firstMessageDate: expect.any(String),
          lastMessageDate: expect.any(String),
          totalMessages: 3,
          username: testUserName,
        },
      ])
    );
  }, 60000); // ioncrease the test timeout since the request will be slow
});
