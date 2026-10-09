import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import xssClean from "xss-clean";
import hpp from "hpp";

import { notFound } from "./app/middleware/notFound.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandeler.js";
import { router } from "./app/router/index.js";
import passport from "passport";
import "./app/config/passport.config.js";
import { envVars } from "./app/config/env.js";

dotenv.config();

const app = express();

// Global Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: envVars.FRONT_END_URL,
    credentials: true,
  })
);
app.use(xssClean());
app.use(hpp());

// Body & Cookie parsers
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api", router);
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// 404 handler (must be after routes)
app.use(notFound);

// Global error handler (always last)
app.use(globalErrorHandler);

export default app;


