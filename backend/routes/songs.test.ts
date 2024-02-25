import request from "supertest");

import app from "../app");

import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testSongIds,
  u1Token,
  adminToken,
} from "./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /songs */

describe("POST /songs", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .post(`/songs`)
        .send({
          playlistHandle: "c1",
          title: "J-new",
          salary: 10,
          equity: "0.2",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      song: {
        id: expect.any(Number),
        title: "J-new",
        salary: 10,
        equity: "0.2",
        playlistHandle: "c1",
      },
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .post(`/songs`)
        .send({
          playlistHandle: "c1",
          title: "J-new",
          salary: 10,
          equity: "0.2",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such playlist", async function () {
    const resp = await request(app)
        .post(`/songs`)
        .send({
          playlistHandle: "nope",
          title: "J-new",
          salary: 10,
          equity: "0.2",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post(`/songs`)
        .send({
          playlistHandle: "c1",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data - admin", async function () {
    const resp = await request(app)
        .post(`/songs`)
        .send({
          playlistHandle: "c1",
          title: "J-new",
          salary: "not-a-number",
          equity: "0.2",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauth with invalid data - non-admin", async function () {
    const resp = await request(app)
        .post(`/songs`)
        .send({
          playlistHandle: "c1",
          title: "J-new",
          salary: "not-a-number",
          equity: "0.2",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth with invalid data - anon", async function () {
    const resp = await request(app)
        .post(`/songs`)
        .send({
          playlistHandle: "c1",
          title: "J-new",
          salary: "not-a-number",
          equity: "0.2",
        });
    expect(resp.statusCode).toEqual(401);
  });

});

/************************************** GET /songs */

describe("GET /songs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get(`/songs`);
    expect(resp.body).toEqual({
          songs: [
            {
              id: expect.any(Number),
              title: "J1",
              salary: 1,
              equity: "0.1",
              playlistHandle: "c1",
              playlistName: "C1",
            },
            {
              id: expect.any(Number),
              title: "J2",
              salary: 2,
              equity: "0.2",
              playlistHandle: "c1",
              playlistName: "C1",
            },
            {
              id: expect.any(Number),
              title: "J3",
              salary: 3,
              equity: null,
              playlistHandle: "c1",
              playlistName: "C1",
            },
          ],
        },
    );
  });

  test("works: filtering", async function () {
    const resp = await request(app)
        .get(`/songs`)
        .query({ hasEquity: true });
    expect(resp.body).toEqual({
          songs: [
            {
              id: expect.any(Number),
              title: "J1",
              salary: 1,
              equity: "0.1",
              playlistHandle: "c1",
              playlistName: "C1",
            },
            {
              id: expect.any(Number),
              title: "J2",
              salary: 2,
              equity: "0.2",
              playlistHandle: "c1",
              playlistName: "C1",
            },
          ],
        },
    );
  });

  test("works: filtering on 2 filters", async function () {
    const resp = await request(app)
        .get(`/songs`)
        .query({ minSalary: 2, title: "3" });
    expect(resp.body).toEqual({
          songs: [
            {
              id: expect.any(Number),
              title: "J3",
              salary: 3,
              equity: null,
              playlistHandle: "c1",
              playlistName: "C1",
            },
          ],
        },
    );
  });

  test("bad request on invalid filter key", async function () {
    const resp = await request(app)
        .get(`/songs`)
        .query({ minSalary: 2, nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /songs/:id */

describe("GET /songs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/songs/${testSongIds[0]}`);
    expect(resp.body).toEqual({
      song: {
        id: testSongIds[0],
        title: "J1",
        salary: 1,
        equity: "0.1",
        playlist: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
      },
    });
  });

  test("not found for no such song", async function () {
    const resp = await request(app).get(`/songs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /songs/:id */

describe("PATCH /songs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/songs/${testSongIds[0]}`)
        .send({
          title: "J-New",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      song: {
        id: expect.any(Number),
        title: "J-New",
        salary: 1,
        equity: "0.1",
        playlistHandle: "c1",
      },
    });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .patch(`/songs/${testSongIds[0]}`)
        .send({
          title: "J-New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such song", async function () {
    const resp = await request(app)
        .patch(`/songs/0`)
        .send({
          handle: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/songs/${testSongIds[0]}`)
        .send({
          handle: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data - admin", async function () {
    const resp = await request(app)
        .patch(`/songs/${testSongIds[0]}`)
        .send({
          salary: "not-a-number",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauth with invalid data - non-admin", async function () {
    const resp = await request(app)
        .patch(`/songs/${testSongIds[0]}`)
        .send({
          salary: "not-a-number",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth with invalid data - anon", async function () {
    const resp = await request(app)
        .patch(`/songs/${testSongIds[0]}`)
        .send({
          salary: "not-a-number",
        });
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** DELETE /songs/:id */

describe("DELETE /songs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/songs/${testSongIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testSongIds[0] });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .delete(`/songs/${testSongIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/songs/${testSongIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such song - admin", async function () {
    const resp = await request(app)
        .delete(`/songs/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("unauth for no such song - non-admin", async function () {
    const resp = await request(app)
        .delete(`/songs/0`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for no such song - anon", async function () {
    const resp = await request(app).delete(`/songs/0`);
    expect(resp.statusCode).toEqual(401);
  });
});
