import { NotFoundError, BadRequestError } from "../expressError";
import db from "../db";
import Song from "./song";
import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testSongIds,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  let newSong = {
    playlistHandle: "c1",
    title: "Test",
    artist: "test",
    link: "test.com",
  };

  test("works", async function () {
    let song = await Song.create(newSong);
    expect(song).toEqual({
      ...newSong,
      id: expect.any(Number),
    });
  });

  test("not found if no such playlist", async function () {
    try {
      await Song.create({...newSong, playlistHandle: "nope"});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let songs = await Song.findAll();
    expect(songs).toEqual([
      {
        id: testSongIds[0],
        title: "Song1",
        artist: "ArtistA",
        link: "soundcloud.com",
        playlistHandle: "c1",
        playlistName: "C1",
      },
      {
        id: testSongIds[1],
        title: "Song2",
        artist: "ArtistA",
        link: "soundcloud.com",
        playlistHandle: "c1",
        playlistName: "C1",
      },
      {
        id: testSongIds[2],
        title: "Song3",
        artist: "ArtistA",
        link: "soundcloud.com",
        playlistHandle: "c1",
        playlistName: "C1",
      },
      {
        id: testSongIds[3],
        title: "Song4",
        artist: "ArtistB",
        link: "soundcloud.com",
        playlistHandle: "c1",
        playlistName: "C1",
      },
    ]);
  });

  test("works: by name", async function () {
    let songs = await Song.findAll({ title: "Song1" });
    expect(songs).toEqual([
      {
        id: testSongIds[0],
        title: "Song1",
        artist: "ArtistA",
        link: "soundcloud.com",
        playlistHandle: "c1",
        playlistName: "C1",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let song = await Song.get(testSongIds[0]);
    expect(song).toEqual({
      id: testSongIds[0],
      title: "Song1",
      artist: "ArtistA",
      link: "soundcloud.com",
      playlist: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        logoUrl: "http://c1.img",
      },
    });
  });

  test("not found if no such song", async function () {
    try {
      await Song.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  let updateData = {
    title: "New",
    artist: "ArtistA",
    link: "soundcloud.com",
  };
  test("works", async function () {
    let song = await Song.update(testSongIds[0], updateData);
    expect(song).toEqual({
      id: testSongIds[0],
      playlistHandle: "c1",
      ...updateData,
    });
  });

  test("not found if no such song", async function () {
    try {
      await Song.update(0, {
        title: "test",
      });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Song.update(testSongIds[0], {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Song.remove(testSongIds[0]);
    const res = await db.query(
        "SELECT id FROM songs WHERE id=$1", [testSongIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such song", async function () {
    try {
      await Song.remove(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
