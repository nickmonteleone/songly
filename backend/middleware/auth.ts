/** Convenience middleware to handle common auth cases in routes. */

import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { SECRET_KEY }from "../config";
import { UnauthorizedError } from "../expressError";


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req: Request|any, res: Response|any, next:NextFunction): void {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      /* ignore invalid tokens (but don't store user!) */
    }
  }
  return next();

}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req: Request|any, res: Response|any, next:NextFunction): void {
  if (res.locals.user?.username) return next();
  throw new UnauthorizedError();
}


/** Middleware to use when they be logged in as an admin user.
 *
 *  If not, raises Unauthorized.
 */

function ensureAdmin(req: Request|any, res: Response|any, next:NextFunction): void {
  if (res.locals.user?.username && res.locals.user?.isAdmin === true) {
    return next();
  }
  throw new UnauthorizedError();

}

/** Middleware to use when they must provide a valid token & be user matching
 *  username provided as route param.
 *
 *  If not, raises Unauthorized.
 */

function ensureCorrectUserOrAdmin(req: Request|any, res: Response|any, next:NextFunction): void {
  const user = res.locals.user;
  const username = res.locals.user?.username;
  if (username && (username === req.params.username || user.isAdmin === true)) {
    return next();
  }

  throw new UnauthorizedError();
}


export {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
};
