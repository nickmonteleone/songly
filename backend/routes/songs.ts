/** Routes for songs. */

import jsonschema from "jsonschema";

import express from "express";
import { BadRequestError } from "../expressError";
import { ensureAdmin } from "../middleware/auth";
import Song from "../models/song";
import songNewSchema from "../schemas/songNew.json";
import songUpdateSchema from "../schemas/songUpdate.json";
import songSearchSchema from "../schemas/songSearch.json";

const router = express.Router({ mergeParams: true });


/** POST / { song } => { song }
 *
 * song should be { title, artist, link, playlistHandle }
 *
 * Returns { id, title, artist, link, playlistHandle }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    songNewSchema,
    {required: true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs[0]);
  }

  const song = await Song.create(req.body);
  return res.status(201).json({ song });
});

/** GET / =>
 *   { songs: [ { id, title, artist, link, playlistHandle, playlistName }, ...] }
 *
 * Can provide search filter in query:
 * - minSalary
 * - hasEquity (true returns only songs with link > 0, other values ignored)
 * - title (will find case-insensitive, partial matches)

 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const q = req.query;

  const validator = jsonschema.validate(
    q,
    songSearchSchema,
    {required: true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs[0]);
  }

  const songs = await Song.findAll(q);
  return res.json({ songs });
});

/** GET /[songId] => { song }
 *
 * Returns { id, title, artist, link, playlist }
 *   where playlist is { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  const song = await Song.get(req.params.id);
  return res.json({ song });
});


/** PATCH /[songId]  { fld1, fld2, ... } => { song }
 *
 * Data can include: { title, artist, link }
 *
 * Returns { id, title, artist, link, playlistHandle }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    songUpdateSchema,
    {required: true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs[0]);
  }

  const song = await Song.update(req.params.id, req.body);
  return res.json({ song });
});

/** DELETE /[handle]  =>  { deleted: id }
 *
 * Authorization required: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  await Song.remove(req.params.id);
  return res.json({ deleted: +req.params.id });
});


export default router;
