import request from "supertest";

import app from "../app";

import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testSongIds,
  u1Token,
  adminToken,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /playlists */

describe("POST /playlists", function () {
  const newPlaylist = {
    handle: "new",
    name: "New",
    logoUrl: "http://new.img",
    description: "DescNew",
  };

  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/playlists")
        .send(newPlaylist)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      playlist: newPlaylist,
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .post("/playlists")
        .send(newPlaylist)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/playlists")
        .send({
          handle: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data - admin", async function () {
    const resp = await request(app)
        .post("/playlists")
        .send({
          ...newPlaylist,
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauth with invalid data - non-admin", async function () {
    const resp = await request(app)
        .post("/playlists")
        .send({
          ...newPlaylist,
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth with invalid data - anon", async function () {
    const resp = await request(app)
        .post("/playlists")
        .send({
          ...newPlaylist,
          logoUrl: "not-a-url",
        });
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /playlists */

describe("GET /playlists", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/playlists");
    expect(resp.body).toEqual({
      playlists:
          [
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
          ],
    });
  });

  test("works: filtering on all filters", async function () {
    const resp = await request(app)
        .get("/playlists")
        .query({ nameLike: "3" });
    expect(resp.body).toEqual({
      playlists: [
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          logoUrl: "http://c3.img",
        },
      ],
    });
  });

  test("bad request if invalid filter key", async function () {
    const resp = await request(app)
        .get("/playlists")
        .query({ nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /playlists/:handle */

describe("GET /playlists/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/playlists/c1`);
    expect(resp.body).toEqual({
      playlist: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        logoUrl: "http://c1.img",
        songs: [
          { id: testSongIds[0], title: "Song1", artist: "ArtistA", link: "soundcloud.com" },
          { id: testSongIds[1], title: "Song2", artist: "ArtistB", link: "soundcloud.com" },
          { id: testSongIds[2], title: "Song3", artist: "ArtistB", link: "soundcloud.com" },
        ],
      },
    });
  });

  test("works for anon: playlist w/o songs", async function () {
    const resp = await request(app).get(`/playlists/c2`);
    expect(resp.body).toEqual({
      playlist: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        logoUrl: "http://c2.img",
        songs: [],
      },
    });
  });

  test("not found for no such playlist", async function () {
    const resp = await request(app).get(`/playlists/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /playlists/:handle */

describe("PATCH /playlists/:handle", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/playlists/c1`)
        .send({
          name: "C1-new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      playlist: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        logoUrl: "http://c1.img",
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .patch(`/playlists/c1`)
        .send({
          name: "C1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/playlists/c1`)
        .send({
          name: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such playlist - admin", async function () {
    const resp = await request(app)
        .patch(`/playlists/nope`)
        .send({
          name: "new nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/playlists/c1`)
        .send({
          handle: "c1-new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data - admin", async function () {
    const resp = await request(app)
        .patch(`/playlists/c1`)
        .send({
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauth on invalid data - non-admin", async function () {
    const resp = await request(app)
        .patch(`/playlists/c1`)
        .send({
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth on invalid data - anon", async function () {
    const resp = await request(app)
        .patch(`/playlists/c1`)
        .send({
          logoUrl: "not-a-url",
        });
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** DELETE /playlists/:handle */

describe("DELETE /playlists/:handle", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/playlists/c1`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "c1" });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .delete(`/playlists/c1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/playlists/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such playlist - admin", async function () {
    const resp = await request(app)
        .delete(`/playlists/nope`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("unauth for no such playlist - non-admin", async function () {
    const resp = await request(app)
        .delete(`/playlists/nope`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for no such playlist - anon", async function () {
    const resp = await request(app)
        .delete(`/playlists/nope`);
    expect(resp.statusCode).toEqual(401);
  });
});
