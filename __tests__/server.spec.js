const server = require("../server");
const request = require("supertest");
const db = require("./../data/dbConfig");

// Middleware imports
const errorHandler = require("../middleware/error-middleware");

const testError = {
  Test: {
    name: 'Trip the error middleware',
    desc: 'Test of the error middleware, seeing this is intentional'
  }
};

describe("GET /", () => {
  // Mocked req, res, next Express objects/functions
  let req, res;
  const next = jest.fn();

  beforeEach(() => {
    req = {
      cookies: {},
      query: {},
      params: {},
      body: {},
    };

    res = {
      data: {},
      code: null,
      status(status) {
        this.type = status;
        return this;
      },
      json(payload) {
        this.data = JSON.stringify(payload);
      },
    };
  });

  afterAll(async () => {
    await db.destroy();
  });

  it("returns a 200 status code", () => {
    return request(server)
      .get("/")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((res) => {
        expect(res.body.message).toBe("API up");
      });
  });

  it("returns a 404 status code for routes that don't exist", () => {
    return request(server).get("/doesntexist").expect(404);
  });

  it("returns a 500 status code when there's an error", async (done) => {
    errorHandler(testError, req, res, next);
    expect(res.type).toBe(500);
    expect(res.type).not.toBe(200)
    done();
  });
});
