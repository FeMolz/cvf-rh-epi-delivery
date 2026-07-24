-- AlterTable
ALTER TABLE "Candidatura" ADD COLUMN "reativadoEm" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Candidatura_reativadoEm_idx" ON "Candidatura"("reativadoEm");
