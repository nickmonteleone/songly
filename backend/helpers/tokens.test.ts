import jwt from "jsonwebtoken";
import { createToken } from "./tokens";
import { SECRET_KEY } from "../config";

describe("createToken", function (): void {

  test("works: not admin", function (): void  {
    const token = createToken({ username: "test", isAdmin: false });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: false,
    });
  });

  test("works: admin", function (): void  {
    const token = createToken({ username: "test", isAdmin: true });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: true,
    });
  });

  test("works: default no admin", function () {
    // given the security risk if this didn't work, checking this specifically
    const token = createToken({ username: "test" });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: false,
    });
  });
});
