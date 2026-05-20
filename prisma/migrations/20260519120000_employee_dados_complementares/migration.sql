-- CreateEnum
CREATE TYPE "EstadoCivil" AS ENUM ('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'SEPARADO', 'VIUVO', 'UNIAO_ESTAVEL');

-- CreateEnum
CREATE TYPE "RacaCor" AS ENUM ('BRANCA', 'PRETA', 'PARDA', 'AMARELA', 'INDIGENA', 'NAO_DECLARADO');

-- CreateEnum
CREATE TYPE "GrauInstrucao" AS ENUM (
    'ANALFABETO',
    'FUNDAMENTAL_INCOMPLETO',
    'FUNDAMENTAL_COMPLETO',
    'MEDIO_INCOMPLETO',
    'MEDIO_COMPLETO',
    'SUPERIOR_INCOMPLETO',
    'SUPERIOR_COMPLETO',
    'POS_GRADUACAO',
    'MESTRADO',
    'DOUTORADO'
);

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN "email" TEXT,
ADD COLUMN "telefone" TEXT,
ADD COLUMN "nacionalidade" TEXT,
ADD COLUMN "estadoCivil" "EstadoCivil",
ADD COLUMN "racaCor" "RacaCor",
ADD COLUMN "filiacao" TEXT,
ADD COLUMN "grauInstrucao" "GrauInstrucao",
ADD COLUMN "numeroCtps" TEXT,
ADD COLUMN "serieCtps" TEXT,
ADD COLUMN "numeroDependentes" INTEGER,
ADD COLUMN "pis" TEXT,
ADD COLUMN "chavePix" TEXT,
ADD COLUMN "cep" TEXT,
ADD COLUMN "logradouro" TEXT,
ADD COLUMN "numeroEndereco" TEXT,
ADD COLUMN "complemento" TEXT,
ADD COLUMN "bairro" TEXT,
ADD COLUMN "cidade" TEXT,
ADD COLUMN "estado" TEXT,
ADD COLUMN "valeTransporte" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "valeAlimentacao" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "planoSaude" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Employee"
SET
    "email" = CONCAT('pendente-', "id", '@rh-system.local'),
    "telefone" = '00000000000'
WHERE "email" IS NULL;

ALTER TABLE "Employee" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "telefone" SET NOT NULL;

CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
