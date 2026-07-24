-- AlterTable
ALTER TABLE "EpiDelivery" ADD COLUMN "vencimentoSuspenso" TIMESTAMP(3),
ADD COLUMN "periodicidadePausadaEm" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "EventoAuditoriaSeguranca" (
    "id" TEXT NOT NULL,
    "tipoEvento" TEXT NOT NULL,
    "detalhes" JSONB NOT NULL DEFAULT '{}',
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoAuditoriaSeguranca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventoAuditoriaSeguranca_tipoEvento_idx" ON "EventoAuditoriaSeguranca"("tipoEvento");

-- CreateIndex
CREATE INDEX "EventoAuditoriaSeguranca_registradoEm_idx" ON "EventoAuditoriaSeguranca"("registradoEm");
