const router = require("../routes/auth/auth-router");
const request = require("supertest");
const db = require("./../data/dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Test helpers
const dbHasTruncated = async () => {
  try {
    const users = await find();
    return (users && users.length ? false : true);
  } catch (err) {
    console.log(err);
    return false;
  }
}

// Db helpers
const { find } = require("../routes/users/users-model");

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

  it("inserts a new user into the db with /register", async () => {
    // Ensure users have been truncated properly
    const truncated = await dbHasTruncated();
    expect(truncated).toBe(true);

    const res = await request(router).post("/register", testUser)
    console.log(res);
    
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
