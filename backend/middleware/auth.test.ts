
import jwt from "jsonwebtoken";

import { UnauthorizedError } from "../expressError";
import { SECRET_KEY } from "../config";

import {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
} from "./auth";


const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

function next(err:any):void {
  if (err) throw new Error("Got error from middleware");
}


describe("authenticateJWT", function (): void {
  test("works: via header", function (): void {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function (): void {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function (): void {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function (): void {
  test("works", function (): void {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function (): void {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function (): void {
    const req = {};
    const res = { locals: { user: { } } };
    expect(() => ensureLoggedIn(req, res, next))
        .toThrow(UnauthorizedError);
  });
});


describe("ensureAdmin", function (): void {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test", isAdmin: true } } };
    ensureAdmin(req, res, next);
  });

  test("unauth if not admin", function (): void {
    const req = {};
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    expect(() => ensureAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("unauth if not admin (invalid isAdmin)", function (): void {
    const req = {};
    const res = { locals: { user: { username: "test", isAdmin: "true" } } };
    expect(() => ensureAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("unauth if anon", function (): void {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });
});


describe("ensureCorrectUserOrAdmin", function (): void {
  test("works: admin", function (): void {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "admin", isAdmin: true } } };
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("works: same user", function (): void {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    ensureCorrectUserOrAdmin(req, res, next);
  });

  test("unauth: mismatch", function (): void {
    const req = { params: { username: "wrong" } };
    const res = { locals: { user: { username: "test", isAdmin: false } } };
    expect(() => ensureCorrectUserOrAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("unauth: mismatch (invalid isAdmin)", function (): void {
    const req = { params: { username: "wrong" } };
    const res = { locals: { user: { username: "test", isAdmin: "true" } } };
    expect(() => ensureCorrectUserOrAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });

  test("unauth: if anon", function (): void {
    const req = { params: { username: "test" } };
    const res = { locals: {} };
    expect(() => ensureCorrectUserOrAdmin(req, res, next))
        .toThrow(UnauthorizedError);
  });
});
