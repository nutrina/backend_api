
import { app } from "../";
import request from "supertest";

describe("POST /message", () => {
  it("should store the message & read it back", async () => {
    const res = await request(app)
      .post("/v1/message?user=admin&password=admin")
      .send({ user: "admin", message: "Hello World!" })
      .set("Accept", "application/json");

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject({ id: expect.any(Number) });
  });
});

describe("GET /message", () => {
  it("should return messages", async () => {
    const res = await request(app)
      .get("/v1/message?user=admin&password=admin")
      .set("Accept", "application/json");

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            user: expect.any(String),
            message: expect.any(String),
            date: expect.any(String),
          }),
        ]),
      })
    );
  });

  it("should return messages & newly created messages", async () => {
    // Create new message
    const res = await request(app)
      .post("/v1/message?user=admin&password=admin")
      .send({ user: "admin", message: "Hello World!" })
      .set("Accept", "application/json");

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject({ id: expect.any(Number) });

    const newCreatedId = res.body.id;

    // Read the messages
    const readRes = await request(app)
      .get("/v1/message?user=admin&password=admin")
      .set("Accept", "application/json");

    expect(readRes.headers["content-type"]).toMatch(/json/);
    expect(readRes.status).toEqual(200);
    expect(readRes.body).toEqual(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            id: newCreatedId,
            user: "admin",
            message: "Hello World!",
            date: expect.any(String),
          }),
        ]),
      })
    );
  });
});

describe("DELETE /message/:id", () => {
  it("should delete a message identified by id", async () => {
    // Create new message
    const res = await request(app)
      .post("/v1/message?user=admin&password=admin")
      .send({ user: "admin", message: "Hello World!" })
      .set("Accept", "application/json");

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(200);
    expect(res.body).toMatchObject({ id: expect.any(Number) });

    const newCreatedId = res.body.id;

    // Delete the message
    const delRes = await request(app)
      .delete(`/v1/message/${newCreatedId}?user=admin&password=admin`)
      .set("Accept", "application/json");

    expect(delRes.headers["content-type"]).toMatch(/json/);
    expect(delRes.status).toEqual(200);
    expect(delRes.body).toEqual({ status: "ok" });

    // Expect an error if you try to delete it again
    const delRes2 = await request(app)
      .delete(`/v1/message/${newCreatedId}?user=admin&password=admin`)
      .set("Accept", "application/json");

    expect(delRes2.headers["content-type"]).toMatch(/json/);
    expect(delRes2.status).toEqual(200);
    expect(delRes2.body).toEqual({
      error: "Failed to delete message (bad id)",
    });
  });
});
