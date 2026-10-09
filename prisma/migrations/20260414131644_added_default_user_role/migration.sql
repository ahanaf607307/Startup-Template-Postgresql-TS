-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'user';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';
