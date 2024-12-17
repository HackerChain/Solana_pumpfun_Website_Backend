import express, { Express } from "express";
import mongoose from "mongoose";
import cors from "cors";
import { validateJWT } from "./middleware/auth";
import routes from "./routes";
import logger from "./logs/logger";
import config from "./config";

const server: Express = express();

server.use(cors());
server.use(express.json());

server.use((req, res, next) => {
  if (
    req.path === `/${config.apiVersion}/api/auth/login` ||
    req.path === `/${config.apiVersion}/api/auth/register`
  ) {
    return next();
  }
  validateJWT(req, res, next);
});

/********* C L I E N T *************/
const client = express();
const path = require("path");

// Serve static files from frontend dist
client.use(express.static(path.join(__dirname, "../../frontend/dist")));

const client_http = require("http").Server(client);
client_http.listen(config.clientPort, () => {
  console.log(`🚀 Client is running or port ${config.clientPort}`);
});

// Handle all routes by serving index.html
client.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});


/********* db **************/
// mongoose
//   .connect(config.mongoUri)
//   .then(() => {
//     logger.info("🚀 Connected to MongoDB successfully");
//   })
//   .catch((error) => {
//     logger.critical(`MongoDB connection error: ${error.message}`);
//     process.exit(1);
//   });

server.use(`/${config.apiVersion}/api`, routes);

server.listen(config.serverPort, () => {
  logger.info(`🚀 Server is running on port ${config.serverPort}`);
});

process.on("uncaughtException", (error) => {
  logger.critical(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});
