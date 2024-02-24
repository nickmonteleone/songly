
import bcrypt from "bcrypt";

import db from "../db";
import { BCRYPT_WORK_FACTOR } from "../config";

const testSongIds = [];

async function commonBeforeAll() {

  await db.query("DELETE FROM songs");
  await db.query("DELETE FROM playlists");
  await db.query("DELETE FROM users");

  await db.query(`
      INSERT INTO playlists(handle, name, description, logo_url)
      VALUES ('c1', 'C1', 'Desc1', 'http://c1.img'),
             ('c2', 'C2', 'Desc2', 'http://c2.img'),
             ('c3', 'C3', 'Desc3', 'http://c3.img')`);

  const resultsSongs = await db.query(`
    INSERT INTO songs (title, artist, link, playlist_handle)
    VALUES ('Song1', 'ArtistA', 'soundcloud.com', 'c1'),
           ('Song2', 'ArtistA', 'soundcloud.com', 'c1'),
           ('Song3', 'ArtistA', 'soundcloud.com', 'c1'),
           ('Song4', 'ArtistB', 'soundcloud.com', 'c1')
    RETURNING id`);
  testSongIds.splice(0, 0, ...resultsSongs.rows.map(r => r.id));

  await db.query(`
      INSERT INTO users(username,
                        password,
                        first_name,
                        last_name,
                        email)
      VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
             ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
      RETURNING username`, [
    await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
    await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
  ]);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


export {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testSongIds,
};