import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";

import morgan from "morgan";

import { NotFoundError } from "./expressError"

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

/** Handle 404 errors -- this matches everything */
app.use( function (req: Request, res: Response, next:NextFunction) {
  throw new NotFoundError();
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err: any, req: Request, res: Response, next:NextFunction) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});


export default app;