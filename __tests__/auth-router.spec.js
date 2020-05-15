const server = require("../server");
const request = require("supertest");
const db = require("./../data/dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Test helpers
const dbHasTruncated = async () => {
  // Verifies that the database has truncated
  try {
    const users = await find();
    return (users && users.length ? false : true);
  } catch (err) {
    console.log(err);
    return false;
  }
}

const verifyProperties = (obj, props) => {
  // Verifies that the object has the required properties
  objKeys = Object.keys(obj);
  return props.every(key => objKeys.includes(key));
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
    // Test the endpoint
    const res = await request(server).post("/api/register").send(testUser)
    expect(res.statusCode).toBe(201);
    expect(res.type).toBe("application/json");
    expect(verifyProperties(res.body.data, ["username", "role"])).toBe(true);
    expect(res.body.data.username).toBe(testUser.username);
    expect(res.body.data.role).toBe(testUser.role);
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
