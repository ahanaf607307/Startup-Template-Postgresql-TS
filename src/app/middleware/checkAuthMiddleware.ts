

import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { envVars } from "../config/env.js";
import { redisClient } from "../config/redis.config.js";

export const checkAuthMiddleware =
  (...allowedRoles: string[]) =>
    async (req: any, res: any, next: any) => {
      console.log("🔥 Auth middleware hit:", req.originalUrl);

      try {
        let token = req.headers.authorization;

        if (!token) {
          return res.status(401).json({
            success: false,
            message: "No token provided",
          });
        }

        const jwtToken = token.replace(/^Bearer\s*/i, "");

        // 🛡️ JWT Blacklist Check
        const isBlacklisted = await redisClient.get(`blacklist:${jwtToken}`);
        if (isBlacklisted) {
          return res.status(401).json({
            success: false,
            message: "Token is invalidated (logged out)",
          });
        }

        const decoded: any = jwt.verify(jwtToken, envVars.JWT_SECRET_TOKEN as string);

        // Determine which table to search based on the role or route
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
        });


        if (!user) {
          return res.status(401).json({
            success: false,
            message: "User not found",
          });
        }

        if (allowedRoles.length && !allowedRoles.includes(user.role)) {
          return res.status(403).json({
            success: false,
            message: "Forbidden",
          });
        }

        const isResetRoute = req.originalUrl.includes("/reset-password");

        if (!user.isVerified && !isResetRoute) {
          return res.status(403).json({
            success: false,
            message: "User is not verified. Please verify your email.",
          });
        }

        req.user = user;
        next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
      }
    };
