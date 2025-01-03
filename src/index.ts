import express, { Express } from "express";
import mongoose from "mongoose";
import cors from "cors";
import { validateJWT } from "./middleware/auth";
import routes from "./routes";
import logger from "./logs/logger";
import config from "./config";
import { startDataUpdate } from "./service";

const server: Express = express();

server.use(cors());
server.use(express.json());

server.use((req, res, next) => {
  if (
    req.path === `/api/${config.apiVersion}/auth/login` ||
    req.path === `/api/${config.apiVersion}/auth/register` ||
    req.path === `/api/${config.apiVersion}/auth/logout` ||
    req.path === `/api/${config.apiVersion}/test`
  ) {
    return next();
  }
  validateJWT(req, res, next);
});

/********* db **************/
mongoose
  .connect(config.mongoUri)
  .then(() => {
    logger.info("🚀 Connected to MongoDB successfully");
  })
  .catch((error) => {
    logger.critical(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  });

server.use(`/api/${config.apiVersion}`, routes);
startDataUpdate();

server.get("/api/v1/test", (req, res) => {
  res.send("Hello, World!");
});

server.listen(config.serverPort, () => {
  logger.info(`🚀 Server is running on port ${config.serverPort}`);
});

process.on("uncaughtException", (error) => {
  logger.critical(`Uncaught Exception: ${error.message}`);
  // process.exit(1); // Dont stop backend if uncaught exception
});
