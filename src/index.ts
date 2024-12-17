import express, { Express } from "express";
import mongoose from "mongoose";
import cors from "cors";
import { validateJWT } from "./middleware/auth";
import routes from "./routes";
import logger from "./logs/logger";
import config from "./config";

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (
    req.path === `/${config.apiVersion}/api/auth/login` ||
    req.path === `/${config.apiVersion}/api/auth/register`
  ) {
    return next();
  }
  validateJWT(req, res, next);
});

// mongoose
//   .connect(config.mongoUri)
//   .then(() => {
//     logger.info("Connected to MongoDB successfully");
//   })
//   .catch((error) => {
//     logger.critical(`MongoDB connection error: ${error.message}`);
//     process.exit(1);
//   });

app.use(`/${config.apiVersion}/api`, routes);

app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});

process.on("uncaughtException", (error) => {
  logger.critical(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});
