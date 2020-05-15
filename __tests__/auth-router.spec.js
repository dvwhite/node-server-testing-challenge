const router = require("../routes/auth/auth-router");
const request = require("supertest");
const db = require("./../data/dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Test user credentials
const defaultPW = "123456";
const hash = bcrypt.hashSync(defaultPW, Number(process.env.HASHES));

const testUser = {
  username: "test User",
  password: hash,
  role: 1
};

describe("/register", () => {
  beforeEach(async done => {    
    try {
      await db("users").truncate();
      done();
    } catch (err) {
      console.log("Unable to truncate the database", err);
      done(err);
    }
  });

  it("inserts a new user into the db with /register", (done) => {
    request(router)
      .post("/register")
      .send(testUser)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  afterAll(async done => {
    try {
      await db.destroy();
      done()
    } catch (err) {
      console.log("Unable to close the database connection", err)
      done(err)
    }
  });

});
