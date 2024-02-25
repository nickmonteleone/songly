import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";

import morgan from "morgan";

import { authenticateJWT } from "./middleware/auth";
import { NotFoundError } from "./expressError";
import authRoutes from "./routes/auth";
import playlistsRoutes from "./routes/playlists";
import songsRoutes from "./routes/songs";
import usersRoutes from "./routes/users";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/playlists", playlistsRoutes);
app.use("/songs", songsRoutes);
app.use("/users", usersRoutes);



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