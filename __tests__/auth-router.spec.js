const server = require("../server");
const request = require("supertest");
const db = require("./../data/dbConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Test helpers
const dbHasNoUsers = async () => {
  // Verifies that the database has noUsers
  try {
    const users = await find();
    return users && users.length ? false : true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const verifyProperties = (obj, props) => {
  // Verifies that the object has the required properties
  objKeys = Object.keys(obj);
  return props.every((key) => objKeys.includes(key));
};

// Db helpers
const { find } = require("../routes/users/users-model");

// Test user credentials
const defaultPW = "123456";
const hash = bcrypt.hashSync(defaultPW, Number(process.env.HASHES));

const testUser = {
  username: "test User",
  password: hash,
  role: 1,
  department: "engineering"
};

const testUserLogin = {
  username: testUser.username,
  password: testUser.password,
};

const authError = {
  message: "Invalid Credentials",
  validation: [],
  data: {},
};

const serverError = {
  message: "There was a problem completing the required operation",
  validation: [],
  data: {},
};

describe("the auth route", () => {
  describe("/register", () => {
    beforeEach(async (done) => {
      try {
        await db("users").truncate();
        done();
      } catch (err) {
        console.log("Unable to truncate the database", err);
        done(err);
      }
    });

    it("inserts a new user into the db", async () => {
      // Ensure users have been truncated properly
      const noUsers = await dbHasNoUsers();
      expect(noUsers).toBe(true);
      // Test the endpoint
      const res = await request(server).post("/api/register").send(testUser);
      expect(res.statusCode).toBe(201);
      expect(res.type).toBe("application/json");
      expect(verifyProperties(res.body.data, ["username", "role"])).toBe(true);
      expect(res.body.data.username).toBe(testUser.username);
      expect(res.body.data.role).toBe(testUser.role);
    });

    it("doesn't insert an existing user into the database", async (done) => {
      // Ensure users have been truncated properly
      let noUsers = await dbHasNoUsers();
      expect(noUsers).toBe(true);
      // Test the endpoint by registering a user
      const res = await request(server).post("/api/register").send(testUser);
      noUsers = await dbHasNoUsers();
      expect(noUsers).toBe(false);
      try {
        // Register a second user without truncating the dbase
        const res = await request(server).post("/api/register").send(testUser);
        // It should throw an error
        expect(res.statusCode).toBe(500);
        expect(res.type).toBe("application/json");
        expect(JSON.parse(res.text)).toEqual(serverError);
        // There should still only be 1 user in the dbase
        const users = await find();
        expect(users).toHaveLength(1);
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  describe("the /login route", () => {
    beforeEach(async (done) => {
      try {
        await db("users").truncate();
        done();
      } catch (err) {
        console.log("Unable to truncate the database", err);
        done(err);
      }
    });

    it("it authenticates a correct username and password", async (done) => {
      // Ensure users have been truncated properly
      let noUsers = await dbHasNoUsers();
      expect(noUsers).toBe(true);

      try {
        // Register a user so that login can happen
        const regRes = await request(server).post("/api/register").send(testUser);
        expect(regRes.statusCode).toBe(201);
        const loginRes = await request(server)
          .post("/api/login")
          .send(testUserLogin);
        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.type).toBe("application/json");
        expect(loginRes.headers['set-cookie']).toBeDefined(); // token cookie
        expect(loginRes.body.data.user.username).toBe(testUser.username);
        expect(loginRes.body.data.user.role).toBe(testUser.role);
        // verify the JWT
        const token = loginRes.body.data.token;
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          expect(err).toBeNull();
          expect(decoded.role).toBe(testUser.role);
          expect(decoded.department).toBe(testUser.department);
        });
        done();
      } catch (err) {
        console.log(err);
        done(err);
      }
    });
  });

  afterAll(async (done) => {
    try {
      await db.destroy();
      done();
    } catch (err) {
      console.log("Unable to close the database connection", err);
      done(err);
    }
  });
});
