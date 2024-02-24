import db from "../db";
import { BadRequestError, NotFoundError } from "../expressError";
import Playlist from "./playlist";
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
  const newPlaylist = {
    handle: "new",
    name: "New",
    description: "New Description",
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let playlist = await Playlist.create(newPlaylist);
    expect(playlist).toEqual(newPlaylist);

    const result = await db.query(
          `SELECT handle, name, description, logo_url
           FROM playlists
           WHERE handle = 'new'`);
    expect(result.rows).toEqual([
      {
        handle: "new",
        name: "New",
        description: "New Description",
        logo_url: "http://new.img",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Playlist.create(newPlaylist);
      await Playlist.create(newPlaylist);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** _filterWhereBuilder */

describe("_filterWhereBuilder", function () {
  test("works with no filter criteria", function () {
    const criteria = {};

    expect(Playlist._filterWhereBuilder(criteria)).toEqual({
      where: "",
      vals: [],
    });
  });

  test("works when all criteria options supplied", function () {
    const criteria = {
      nameLike: "Apple",
    };

    expect(Playlist._filterWhereBuilder(criteria)).toEqual({
      where:
          "WHERE name ILIKE $1",
      vals: ["%Apple%"],
    });
  });
});

/************************************** findAll */

// NOTE: Some of the find all tests are already handled now that we're testing
// the filter criteria at a lower level with _filterWhereBuilder.
//
// We've decided these tests are still useful and all should continue to pass.

describe("findAll", function () {
  test("works: all", async function () {
    let playlists = await Playlist.findAll();
    expect(playlists).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        logoUrl: "http://c3.img",
      },
    ]);
  });

  test("works: by name", async function () {
    let playlists = await Playlist.findAll({ nameLike: "1" });
    expect(playlists).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        logoUrl: "http://c1.img",
      },
    ]);
  });

  test("works: empty list on nothing found", async function () {
    let playlists = await Playlist.findAll({ nameLike: "nope" });
    expect(playlists).toEqual([]);
  });

});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let playlist = await Playlist.get("c1");
    expect(playlist).toEqual({
      handle: "c1",
      name: "C1",
      description: "Desc1",
      logoUrl: "http://c1.img",
      songs: [
        { id: testSongIds[0], title: "Song1", artist: "ArtistA", link: "soundcloud.com" },
        { id: testSongIds[1], title: "Song2", artist: "ArtistA", link: "soundcloud.com" },
        { id: testSongIds[2], title: "Song3", artist: "ArtistA", link: "soundcloud.com" },
        { id: testSongIds[3], title: "Song4", artist: "ArtistB", link: "soundcloud.com"  },
      ],
    });
  });

  test("not found if no such playlist", async function () {
    try {
      await Playlist.get("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    name: "New",
    description: "New Description",
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let playlist = await Playlist.update("c1", updateData);
    expect(playlist).toEqual({
      handle: "c1",
      ...updateData,
    });

    const result = await db.query(
          `SELECT handle, name, description, logo_url
           FROM playlists
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      logo_url: "http://new.img",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "New",
      description: "New Description",
      logoUrl: null,
    };

    let playlist = await Playlist.update("c1", updateDataSetNulls);
    expect(playlist).toEqual({
      handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT handle, name, description, logo_url
           FROM playlists
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      logo_url: null,
    }]);
  });

  test("not found if no such playlist", async function () {
    try {
      await Playlist.update("nope", updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Playlist.update("c1", {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Playlist.remove("c1");
    const res = await db.query(
        "SELECT handle FROM playlists WHERE handle='c1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such playlist", async function () {
    try {
      await Playlist.remove("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
