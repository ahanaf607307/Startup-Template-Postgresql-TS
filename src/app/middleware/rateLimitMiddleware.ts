import { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/redis.config.js";

/**
 * Rate Limit logic:
 * - IP -> total fails limit 50 per minute. If > 50, IP block for 15 mins.
 * - Email -> fails limit 5. If > 5, Email block for 15 mins.
 */

async function recordFailure(ip: string, email: string) {
  try {
    const ipFailKey = `fail:ip:${ip}`;
    const emailFailKey = `fail:email:${email}`;

    const blockIpKey = `block:ip:${ip}`;
    const blockEmailKey = `block:email:${email}`;

    // Increment IP failures
    const ipCount = await redisClient.incr(ipFailKey);
    if (ipCount === 1) {
      await redisClient.expire(ipFailKey, 60); // 1 minute window
    }

    if (ipCount >= 50) {
      await redisClient.set(blockIpKey, "1", { EX: 15 * 60 }); // Block for 15 minutes
      await redisClient.del(ipFailKey); // Reset count
    }

    // Increment Email failures
    if (email && email !== "unknown_email") {
      const emailCount = await redisClient.incr(emailFailKey);
      if (emailCount === 1) {
        await redisClient.expire(emailFailKey, 15 * 60); // 15 min window
      }

      if (emailCount >= 5) {
        await redisClient.set(blockEmailKey, "1", { EX: 15 * 60 }); // Block for 15 minutes
        await redisClient.del(emailFailKey); // Reset count
      }
    }
  } catch (error) {
    console.error("Redis Rate Limiter Error:", error);
  }
}

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || "unknown_ip";
    
    // Extract email from body or user object
    let email = "unknown_email";
    if (req.body && req.body.email) {
      email = req.body.email;
    } else if ((req as any).user && (req as any).user.email) {
      email = (req as any).user.email;
    }

    const blockIpKey = `block:ip:${ip}`;
    const blockEmailKey = `block:email:${email}`;

    // 1. Check if blocked
    const [isIpBlocked, isEmailBlocked] = await Promise.all([
      redisClient.get(blockIpKey),
      redisClient.get(blockEmailKey),
    ]);

    if (isIpBlocked) {
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts from this IP. Blocked for 15 minutes.",
      });
    }

    if (isEmailBlocked && email !== "unknown_email") {
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts for this email. Blocked for 15 minutes.",
      });
    }

    // Intercept response finish event to track failures
    res.on("finish", () => {
      // Consider 400-499 status codes as failures
      if (res.statusCode >= 400 && res.statusCode < 500) {
        recordFailure(ip, email);
      }
    });

    next();
  } catch (error) {
    console.error("Rate Limiter Middleware Error:", error);
    next(); // Proceed even if Redis fails to avoid blocking legitimate requests
  }
};
