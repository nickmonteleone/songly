
import request from "supertest";

import app from "./app";
import db from "./db";

test("not found for site 404", async function (): Promise<void> {
  const resp = await request(app).get("/no-such-path");
  expect(resp.statusCode).toEqual(404);
});

test("not found for site 404 (test stack print)", async function (): Promise<void> {
  process.env.NODE_ENV = "";
  const resp = await request(app).get("/no-such-path");
  expect(resp.statusCode).toEqual(404);
  delete process.env.NODE_ENV;
});

afterAll(function (): void {
  db.end();
});
