const server = require("../server");
const request = require("supertest");
const db = require("./../data/dbConfig");

afterAll(async () => {
  await db.destroy();
})

describe("GET /", () => {
  it("returns a 200 status code", () => {
    return request(server).get("/")
      .expect(200)
      .expect("Content-Type", /json/)
      .then(res => {
        expect(res.body.message).toBe("API up")
      })
  })
});