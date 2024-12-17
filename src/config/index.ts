import dotenv from "dotenv";

dotenv.config();

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // MongoDB configuration
  mongoUri:
    process.env.MONGO_URI || "mongodb://localhost:27017/my-db",
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",

  // Logging configuration
  logPath: process.env.LOG_PATH || "src/logs/logs",
  logLevel: process.env.LOG_LEVEL || "info",

  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || "*",

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // API versioning
  apiVersion: process.env.API_VERSION || "v1",
};

export default config;
