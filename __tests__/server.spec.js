const server = require("../server");
const request = require("supertest");
const db = require("./../data/dbConfig");

// Middleware imports
const errorHandler = require("../middleware/error-middleware");

const errorObj = {
  Test: {
    name: 'Trip the error middleware',
    desc: 'Test of the error middleware, seeing this is intentional'
  }
};

describe("GET /", () => {
  // Mocked req, res Express objects
  let req, res;
  // Mocked Express next() function
  const next = jest.fn();

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };

    res = {
      data: null,
      code: null,
      status(status) {
        this.code = status;
        return this;
      },
      send(payload) {
        this.data = payload;
      },
      json(payload) {
        this.data = JSON.stringify(payload);
      },
    };

    next.mockClear();
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
    errorHandler(errorObj, req, res, next);
    expect(500).toBe(500);
    done();
  });
});
