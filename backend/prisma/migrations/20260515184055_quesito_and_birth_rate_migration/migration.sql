-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'COLABORADOR';

-- DropIndex (IF EXISTS: tabela RoleQuesito só é criada na migration seguinte)
DROP INDEX IF EXISTS "RoleQuesito_quesitoId_idx";

-- DropIndex
DROP INDEX IF EXISTS "RoleQuesito_roleId_idx";
