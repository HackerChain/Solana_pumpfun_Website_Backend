import dotenv from "dotenv";

dotenv.config();

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // MongoDB configuration
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/my-db",
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",

  // Logging configuration
  logPath: "src/logs/logs",
  logLevel: "info",

  // API versioning
  apiVersion: process.env.API_VERSION || "v1",

  // admin crediential
  adminEmail: process.env.ADMIN_EMAIL,
  adminPwd: process.env.ADMIN_PWD,
};

export default config;
