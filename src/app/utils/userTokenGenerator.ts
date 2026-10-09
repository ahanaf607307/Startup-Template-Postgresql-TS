import { StatusCodes } from "http-status-codes";
import { envVars } from "../config/env.js";

import { generateToken, verifyToken } from "./jwt.js";
import DevBuildError from "../lib/DevBuildError.js";

//  CREATE USER TOKENS

export const createUserTokens = (user: any) => {
  const jwtPayload = {
    id: user.id, // Standardized to 'id'
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_SECRET_TOKEN as string,
    envVars.JWT_EXPIRES_IN as any
  );

  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_TOKEN as string,
    envVars.JWT_REFRESH_EXPIRES_IN as any
  );

  return { accessToken, refreshToken };
};
//  CREATE NEW ACCESS TOKEN USING REFRESH TOKEN

export const createNewAccessTokenUsingRefreshToken = async (
  prisma: any,
  refreshToken: string
) => {
  const verifyRefreshToken: any = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_TOKEN as string
  );

  const isUser = await prisma.user.findUnique({
    where: { email: verifyRefreshToken.email },
  });

  if (!isUser) {
    throw new DevBuildError(
      "User does not exist",
      StatusCodes.BAD_REQUEST
    );
  }

  const jwtPayload = {
    id: isUser.id,
    email: isUser.email,
    role: isUser.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_SECRET_TOKEN as string,
    envVars.JWT_EXPIRES_IN as any
  );

  return accessToken;
};
