import { envVars } from "../../config/env.js";
import DevBuildError from "../../lib/DevBuildError.js";
import bcrypt from "bcrypt";
import { Role } from "../../utils/role.js";

export const UserService = {

  // BASIC FIND METHODS

  findByEmail: async (prisma: any, email: string) =>
    prisma.user.findUnique({ where: { email } }),

  findByUsername: async (prisma: any, username: string) =>
    prisma.user.findUnique({ where: { username } }),

  findById: async (prisma: any, id: string) =>
    prisma.user.findUnique({ where: { id } }),


  // ✅ ONLY USER INFO (NO PROFILE)

  findUserInfoById: async (prisma: any, id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }),


  // UPDATE / DELETE

  update: async (prisma: any, id: string, data: any) =>
    prisma.user.update({
      where: { id },
      data,
    }),

  delete: async (prisma: any, id: string) =>
    prisma.user.delete({
      where: { id },
    }),


  // USER + FULL PROFILE

  findByIdWithProfile: async (prisma: any, id: string) =>
    prisma.user.findUnique({
      where: { id },
    }),

  findAllWithProfile: async (prisma: any) =>
    prisma.user.findMany({}),

  updateAvatar: async (prisma: any, id: string, avatarUrl: string, avatarUrlPath: string) =>
    prisma.user.update({
      where: { id },
      data: { avatarUrl, avatarUrlPath },
    }),
};


export const createUserService = async (payload: any) => {
  const { prisma, email, password, picture, role, ...rest } = payload;

  if (!email || !password) {
    throw new DevBuildError("Email and password are required", 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new DevBuildError("User already exists", 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    password,
    Number((envVars as any).BCRYPT_SALT_ROUND || 10)
  );

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      avatarUrl: picture?.url,
      avatarUrlPath: picture?.path,
      isVerified: false,
      role: Role.CUSTOMER, // Default role
      oauthProvider: "email",
      ...rest,
    },
  });

  return user;
};



