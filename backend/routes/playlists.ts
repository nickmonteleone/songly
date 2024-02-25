/** Routes for playlists. */

import jsonschema from "jsonschema";
import express from "express";

import { BadRequestError } from "../expressError";
import { ensureAdmin } from "../middleware/auth";
import Playlist from "../models/playlist";

import playlistNewSchema from "../schemas/playlistNew.json";
import playlistUpdateSchema from "../schemas/playlistUpdate.json";
import playlistSearchSchema from "../schemas/playlistSearch.json";

const router = express.Router();


/** POST / { playlist } =>  { playlist }
 *
 * playlist should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    playlistNewSchema,
    {required: true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs[0]);
  }

  const playlist = await Playlist.create(req.body);
  return res.status(201).json({ playlist });
});

/** GET /  =>
 *   { playlists: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const q = req.query;

  const validator = jsonschema.validate(
    q,
    playlistSearchSchema,
    {required: true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs[0]);
  }

  const playlists = await Playlist.findAll(q);
  return res.json({ playlists });
});

/** GET /[handle]  =>  { playlist }
 *
 *  Playlist is { handle, name, description, numEmployees, logoUrl, songs }
 *   where songs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  const playlist = await Playlist.get(req.params.handle);
  return res.json({ playlist });
});

/** PATCH /[handle] { fld1, fld2, ... } => { playlist }
 *
 * Patches playlist data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: admin
 */

router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    playlistUpdateSchema,
    {required: true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs[0]);
  }

  const playlist = await Playlist.update(req.params.handle, req.body);
  return res.json({ playlist });
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: admin
 */

router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  await Playlist.remove(req.params.handle);
  return res.json({ deleted: req.params.handle });
});


module.exports = router;
