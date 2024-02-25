import db from "../db";
import User from "../models/user";
import Playlist from "../models/playlist";
import Song from "../models/song";
import { createToken } from "../helpers/tokens";

const testSongIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM playlists");

  await Playlist.create(
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        logoUrl: "http://c1.img",
      });
  await Playlist.create(
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        logoUrl: "http://c2.img",
      });
  await Playlist.create(
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        logoUrl: "http://c3.img",
      });

  testSongIds[0] = (await Song.create(
      { title: "Song1", artist: "ArtistA", link: "soundcloud.com", playlistHandle: "c1" })).id;
  testSongIds[1] = (await Song.create(
      { title: "Song2", artist: "ArtistB", link: "soundcloud.com", playlistHandle: "c1" })).id;
  testSongIds[2] = (await Song.create(
      { title: "Song3", artist: "ArtistB", link: "soundcloud.com", playlistHandle: "c1" })).id;

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
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


const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });


export {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testSongIds,
  u1Token,
  u2Token,
  adminToken,
};
