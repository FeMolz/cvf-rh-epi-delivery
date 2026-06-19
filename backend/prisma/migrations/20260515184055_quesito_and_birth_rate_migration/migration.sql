-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'COLABORADOR';

-- DropIndex
DROP INDEX "RoleQuesito_quesitoId_idx";

-- DropIndex
DROP INDEX "RoleQuesito_roleId_idx";
