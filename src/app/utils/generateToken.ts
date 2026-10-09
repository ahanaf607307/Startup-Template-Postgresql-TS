import jwt from "jsonwebtoken";
import { envVars } from "../config/env.js";


// JWT Token Generate Function
export const generateTokens = (user: any) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
       envVars.JWT_SECRET_TOKEN as string,
        { expiresIn:envVars.JWT_EXPIRES_IN as any }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
       envVars.JWT_REFRESH_TOKEN as string,
        { expiresIn:envVars.JWT_REFRESH_EXPIRES_IN as any }
    );

    return { accessToken, refreshToken };
};