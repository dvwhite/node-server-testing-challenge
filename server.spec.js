const server = require("./server");
const request = require("supertest");

describe("GET /", () => {
  it("returns a 200 status code", () => {
    return request(server).get("/")
      .expect(200)
      .expect("Content-Type", /json/)
      .then(res => {
        expect(res.body.message).toBe("API up")
      })
  })
})