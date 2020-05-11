const router = require("./auth-router");
const express = require("express")

// Middleware
const bodyParser = require("body-parser");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Db helpers
const db = require("./../../data/dbConfig");
const {
  find,
  findBy,
  insert
} = require("./../users/test/test-model");

// Env
const dotenv = require("dotenv").config({path: "./.env"});

// Tests
describe("The /login route", () => {
  // Access JWTs
  let userToken;
  let adminToken;

  // Test user credentials
  const defaultPW = "123456";
  const hash = bcrypt.hashSync(defaultPW, Number(process.env.HASHES));
  console.log("hash:", hash)

  const userLogin = {
    username: "testUser",
    password: hash,
    role: 1
  }
  const adminLogin = {
    username: "testAdmin",
    password: hash,
    role: 2
  }

  // Set up the JWTs 
  beforeEach(async() => {
    const users = await db("users").where({ username: userLogin.username });
    if (!users.includes(userLogin.username)) {
      request(router).post("/register")
        .send({ username: user.login, password: defaultPW })
        .then(res => {
          console.log("Added:", res)
        });
    };
  });

  it('should return something on res.body when called', function (done) {
    const app = express();

    app.use(bodyParser());

    app.post("/login", async (req, res) => {
      const authError = {
        message: "Invalid Credentials",
        validation: [],
        data: {},
      };
    
      try {
        const { username, password } = req.body;
        const user = await findBy({ username });
    
        if (!user) {
          return res.status(401).json(authError);
        }
    
        // Auth in
        const authenticated = bcrypt.compareSync(password, user.password);
        if (!authenticated) {
          res.status(401).json(authError);
        }
        delete user.password; // This is no longer needed
        console.log(user)

        // Create the JWT token
        const payload = {
          userId: user.id,
          userRole: user.role_id
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET);
    
        // Send the data back, including the token
        res.status(200).json({
          message: `Welcome, ${user.username}!`,
          validation: [],
          data: {
            user,
            token
          }
        });
    
      } catch (err) {
        console.log("Error 500", err)
        res.status(500).json({ message: "An unexpected error occurred"});
      }
    });

    const { username, password } = userLogin;
    request(app)
      .post('/login')
      .send({ username, password })
      .expect(200, done);
  })

});
