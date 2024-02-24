import db from "../db";
import { NotFoundError } from "../expressError";
import { sqlForPartialUpdate } from "../helpers/sql";


/** Related functions for playlists. */

class Song {
  /** Create a song (from data), update db, return new song data.
   *
   * data should be { title, artist, link, playlistHandle }
   *
   * Throws NotFoundError if the playlist does not exist.
   *
   * Returns { id, title, artist, link, playlistHandle }
   **/

  static async create(data) {
    const playlistPreCheck = await db.query(`
                SELECT handle
                FROM playlists
                WHERE handle = $1`,
        [data.playlistHandle]);
    const playlist = playlistPreCheck.rows[0];

    if (!playlist) throw new NotFoundError(`No playlist: ${data.playlistHandle}`);

    const result = await db.query(`
        INSERT INTO songs (title,
                          artist,
                          link,
                          playlist_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            title,
            artist,
            link,
            playlist_handle AS "playlistHandle"`, [
      data.title,
      data.artist,
      data.link,
      data.playlistHandle,
    ]);
    const song = result.rows[0];

    return song;
  }

  /** Create WHERE clause for filters, to be used by functions that query
   * with filters.
   *
   * searchFilters (all optional):
   * - title (will find case-insensitive, partial matches)
   *
   * Returns {
   *  where: "WHERE title ILIKE $1",
   *  vals: ['%Closer%']
   * }
   */

  static _filterWhereBuilder({ title }) {
    let whereParts = [];
    let vals = [];

    if (title !== undefined) {
      vals.push(`%${title}%`);
      whereParts.push(`title ILIKE $${vals.length}`);
    }

    const where = (whereParts.length > 0) ?
        "WHERE " + whereParts.join(" AND ")
        : "";

    return { where, vals };
  }

  /** Find all songs (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - title (will find case-insensitive, partial matches)
   *
   * Returns [{ id, title, artist, link, playlistHandle, playlistName }, ...]
   * */

  static async findAll({ title }:any = {}) {

    const { where, vals } = this._filterWhereBuilder({ title });

    const songsRes = await db.query(`
        SELECT j.id,
               j.title,
               j.artist,
               j.link,
               j.playlist_handle AS "playlistHandle",
               c.name           AS "playlistName"
        FROM songs j
                 LEFT JOIN playlists AS c ON c.handle = j.playlist_handle
            ${where}`, vals);

    return songsRes.rows;
  }

  /** Given a song id, return data about song.
   *
   * Returns { id, title, artist, link, playlistHandle, playlist }
   *   where playlist is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const songRes = await db.query(`
        SELECT id,
               title,
               artist,
               link,
               playlist_handle AS "playlistHandle"
        FROM songs
        WHERE id = $1`, [id]);

    const song = songRes.rows[0];

    if (!song) throw new NotFoundError(`No song: ${id}`);

    const playlistsRes = await db.query(`
        SELECT handle,
               name,
               description,
               logo_url      AS "logoUrl"
        FROM playlists
        WHERE handle = $1`, [song.playlistHandle]);

    delete song.playlistHandle;
    song.playlist = playlistsRes.rows[0];

    return song;
  }

  /** Update song data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { title, artist, link }
   *
   * Returns { id, title, artist, link, playlistHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE songs
        SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING id,
            title,
            artist,
            link,
            playlist_handle AS "playlistHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const song = result.rows[0];

    if (!song) throw new NotFoundError(`No song: ${id}`);

    return song;
  }

  /** Delete given song from database; returns undefined.
   *
   * Throws NotFoundError if playlist not found.
   **/

  static async remove(id) {
    const result = await db.query(
        `DELETE
         FROM songs
         WHERE id = $1
         RETURNING id`, [id]);
    const song = result.rows[0];

    if (!song) throw new NotFoundError(`No song: ${id}`);
  }
}

export default Song;
