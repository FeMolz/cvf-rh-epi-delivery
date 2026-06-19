-- AlterTable: data de nascimento obrigatoria (registros existentes recebem data de admissao como valor inicial)
ALTER TABLE "Employee" ADD COLUMN "birthDate" TIMESTAMP(3);

UPDATE "Employee" SET "birthDate" = "admissionDate" WHERE "birthDate" IS NULL;

ALTER TABLE "Employee" ALTER COLUMN "birthDate" SET NOT NULL;
