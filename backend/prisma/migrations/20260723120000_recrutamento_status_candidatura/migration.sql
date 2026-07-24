-- CreateEnum
CREATE TYPE "ModoTrabalhoVaga" AS ENUM ('PRESENCIAL', 'REMOTO', 'HIBRIDO');

-- CreateEnum
CREATE TYPE "StatusCandidatura" AS ENUM ('PENDENTE', 'PROXIMA_FASE', 'DESCARTADO');

-- AlterTable
ALTER TABLE "AnuncioVaga" ADD COLUMN "modoTrabalho" "ModoTrabalhoVaga" NOT NULL DEFAULT 'PRESENCIAL';

-- AlterTable
ALTER TABLE "Candidatura" ADD COLUMN "userId" TEXT,
ADD COLUMN "status" "StatusCandidatura" NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN "descartadoEm" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "telefone" DROP NOT NULL,
ALTER COLUMN "cidade" DROP NOT NULL,
ALTER COLUMN "estado" DROP NOT NULL,
ALTER COLUMN "curriculoConteudo" DROP NOT NULL,
ALTER COLUMN "curriculoNomeArquivo" DROP NOT NULL,
ALTER COLUMN "curriculoTipoMime" DROP NOT NULL,
ALTER COLUMN "curriculoTamanhoBytes" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Candidatura_status_idx" ON "Candidatura"("status");

-- CreateIndex
CREATE INDEX "Candidatura_descartadoEm_idx" ON "Candidatura"("descartadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Candidatura_anuncioVagaId_userId_key" ON "Candidatura"("anuncioVagaId", "userId");

-- AddForeignKey
ALTER TABLE "Candidatura" ADD CONSTRAINT "Candidatura_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
