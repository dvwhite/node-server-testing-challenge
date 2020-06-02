const express = require("express");
const server = express();

// Middleware
const cors = require("cors");
const helmet = require("helmet");
const authRoute = require("./routes/auth/auth-router");
const errorHandler = require("./middleware/error-middleware");

server.use(helmet());
server.use(express.json());
server.use(cors());

// Routes
server.use("/api", authRoute);

// Error middleware
server.use(errorHandler);

server.get("/", (req, res) => {
  return res.status(200).json({ message: "API up", validation: [], data: {} });
});

module.exports = server;
