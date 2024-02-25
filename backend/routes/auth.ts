/** Routes for authentication. */

import jsonschema from "jsonschema";

import User from "../models/user";
import express from "express";

const  router = express.Router();

import { createToken } from "../helpers/tokens";
import userAuthSchema from "../schemas/userAuth.json";
import userRegisterSchema from "../schemas/userRegister.json";
import { BadRequestError } from "../expressError";

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    userAuthSchema,
    {required: true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs[0]);
  }

  const { username, password } = req.body;
  const user = await User.authenticate(username, password);
  const token = createToken(user);
  return res.json({ token });
});


/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    userRegisterSchema,
    {required: true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs[0]);
  }

  const newUser = await User.register({ ...req.body, isAdmin: false });
  const token = createToken(newUser);
  return res.status(201).json({ token });
});


export default router;
