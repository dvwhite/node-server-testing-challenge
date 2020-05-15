const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router({ mergeParams: true });

// Subroute for /users
const restricted = require("./restricted-middleware");
// const userRoute = require("../users/users-router");
// router.use("/users", userRoute);

// Db helper fns
const { findBy, insert } = require("./../users/users-model");

router.post("/register", async (req, res) => {
  try {
    const user = req.body;
    const hash = bcrypt.hashSync(req.body.password, Number(process.env.HASHES));
    user.password = hash;
    const newUser = await insert(user);
    res.status(201).json({
      message: `Registered ${newUser.username} successfully`,
      validation: [],
      data: newUser,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

function errDetail(res, err) {
  console.log(err);
  return res.status(500).json({
    message: "There was a problem completing the required operation",
    validation: [],
    data: {},
  });
}

module.exports = router;
