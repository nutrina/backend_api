import { app } from "../";
import request from "supertest";

describe("POST /auth/changePassword", () => {
  it("should change password", async () => {
    const res = await request(app)
      .post("/v1/auth/changePassword?user=admin&password=admin")
      .send({ user: "admin", password: "new-password" })
      .set("Accept", "application/json");

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ status: "ok" });

    // Check that old password fails
    const res_fail = await request(app)
      .post("/v1/auth/changePassword?user=admin&password=admin")
      .send({ user: "admin", password: "admin" })
      .set("Accept", "application/json");

    expect(res_fail.headers["content-type"]).toMatch(/json/);
    expect(res_fail.status).toEqual(400);
    expect(res_fail.body).toEqual({ message: "Unauthorized" });

    // Check that new password works
    const res_new_pwd = await request(app)
      .post("/v1/auth/changePassword?user=admin&password=new-password")
      .send({ user: "admin", password: "admin" })
      .set("Accept", "application/json");

    expect(res_new_pwd.headers["content-type"]).toMatch(/json/);
    expect(res_new_pwd.status).toEqual(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("should fail if user does not exist", async () => {
    const res = await request(app)
      .post("/v1/auth/changePassword?user=admin&password=admin")
      .send({ user: "stranger", password: "new-password" })
      .set("Accept", "application/json");

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ message: "User does not exist" });
  });
});
