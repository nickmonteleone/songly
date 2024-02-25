import db from "../db";
import { BadRequestError, NotFoundError } from "../expressError";
import { sqlForPartialUpdate } from "../helpers/sql";

/** Related functions for playlists. */

class Playlist {
  /** Create a playlist (from data), update db, return new playlist data.
   *
   * data should be { handle, name, description, logoUrl }
   *
   * Returns { handle, name, description, logoUrl }
   *
   * Throws BadRequestError if playlist already in database.
   * */

  static async create({ handle, name, description, logoUrl }) {
    const duplicateCheck = await db.query(`
        SELECT handle
        FROM playlists
        WHERE handle = $1`, [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate playlist: ${handle}`);

    const result = await db.query(`
                INSERT INTO playlists (handle,
                                       name,
                                       description,
                                       logo_url)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    handle,
                    name,
                    description,
                    logo_url AS "logoUrl"`, [
      handle,
      name,
      description,
      logoUrl,
    ],
    );
    const playlist = result.rows[0];

    return playlist;
  }

  /** Create WHERE clause for filters, to be used by functions that query
   * with filters.
   *
   * searchFilters (all optional):
   * - nameLike (will find case-insensitive, partial matches)
   *
   * Returns {
   *  where: name ILIKE $1",
   *  vals: ['%Apple%']
   * }
   */

  static _filterWhereBuilder({ nameLike }:any) {
    let whereParts = [];
    let vals = [];

    if (nameLike) {
      vals.push(`%${nameLike}%`);
      whereParts.push(`name ILIKE $${vals.length}`);
    }

    const where = (whereParts.length > 0) ?
      "WHERE " + whereParts.join(" AND ")
      : "";

    return { where, vals };
  }

  /** Find all playlists (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - nameLike (will find case-insensitive, partial matches)
   *
   * Returns [{ handle, name, description, logoUrl }, ...]
   * */

  static async findAll(searchFilters: Record<string, string>|any = {}) {
    const { nameLike } = searchFilters;

    const { where, vals } = this._filterWhereBuilder({ nameLike });

    const result = await db.query(`
        SELECT handle,
               name,
               description,
               logo_url      AS "logoUrl"
        FROM playlists ${where}
        ORDER BY name`, vals);
    return result.rows;
  }

  /** Given a playlist handle, return data about playlist.
   *
   * Returns { handle, name, description, logoUrl, songs }
   *   where songs is [{ id, title, artist, link }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle: string) {
    const result = await db.query(`
        SELECT handle,
               name,
               description,
               logo_url      AS "logoUrl"
        FROM playlists
        WHERE handle = $1`, [handle]);

    const playlist = result.rows[0];

    if (!playlist) throw new NotFoundError(`No playlist: ${handle}`);

    const songsRes = await db.query(`
        SELECT id, title, artist, link
        FROM songs
        WHERE playlist_handle = $1
        ORDER BY id`, [handle],
    );

    playlist.songs = songsRes.rows;

    return playlist;
  }

  /** Update playlist data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, logoUrl}
   *
   * Returns {handle, name, description, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      { logoUrl: "logo_url" },
    );
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE playlists
        SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING
            handle,
            name,
            description,
            logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const playlist = result.rows[0];

    if (!playlist) throw new NotFoundError(`No playlist: ${handle}`);

    return playlist;
  }

  /** Delete given playlist from database; returns undefined.
   *
   * Throws NotFoundError if playlist not found.
   **/

  static async remove(handle) {
    const result = await db.query(`
        DELETE
        FROM playlists
        WHERE handle = $1
        RETURNING handle`, [handle]);
    const playlist = result.rows[0];

    if (!playlist) throw new NotFoundError(`No playlist: ${handle}`);
  }
}


export default Playlist;
