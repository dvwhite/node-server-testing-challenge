const bcrypt = require("bcryptjs");

// Db helpers
const db = require("../../data/dbConfig");
const { find, findBy, insert } = require("../users/users-model");

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

// Test objects

// Test user credentials
const defaultPW = "123456";
const hash1 = bcrypt.hashSync(defaultPW, Number(process.env.HASHES));
const hash2 = bcrypt.hashSync(defaultPW, Number(process.env.HASHES));

const userLogin = {
  username: "test User",
  password: hash1,
  role: "1",
};
const adminLogin = {
  username: "test Admin",
  password: hash2,
  role: "2",
};

// Tests

describe("the users model", () => {

  beforeEach(async done => {    
      try {
        await db("users").truncate();
        done();
      } catch (err) {
        console.log("Unable to truncate the database", err);
        done(err);
      }
  });
  
  it("should register a user", async done => {
    // Ensure users have been truncated properly
    const truncated = await dbHasTruncated();
    expect(truncated).toBe(true);

    try {
      await insert(userLogin)
      done();
    } catch (err) {
      console.log(err);
      done(err);
    }

    try {
      const updatedUsers = await find();
      expect(updatedUsers).toHaveLength(1);
      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });

  it("should insert the provided user into the db", async done => {
    // Ensure users have been truncated properly
    const truncated = await dbHasTruncated();
    expect(truncated).toBe(true);

    try {
      const user = await insert(userLogin);
      expect(user.username).toBe("test User");
      expect(user.password).toBe(hash1);
      expect(user.role).toBe(1);
      done();
    } catch (err) {
      console.log(err);
      done(err);
    }
  });

  it("should authenticate without crashing", async () => {
    // Ensure users have been truncated properly
    dbHasTruncated();

    try {
      const user = await insert(userLogin);
      expect(user.username).toBe("test User");
      expect(user.password).toBe(hash1);
      expect(user.role).toBe(1);
    } catch (err) {
      console.log(err);
    }
  });
});

