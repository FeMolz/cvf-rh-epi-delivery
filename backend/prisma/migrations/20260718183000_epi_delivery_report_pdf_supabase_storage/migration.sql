-- Etapa 1: adiciona colunas de referencia ao Supabase Storage.
-- Execute prisma/scripts/migrar-pdfs-epi-para-supabase.mjs antes da migration seguinte
-- quando houver registros com pdfConteudo em producao.

ALTER TABLE "EpiDeliveryReport" ADD COLUMN "pdfStoragePath" TEXT;
ALTER TABLE "EpiDeliveryReport" ADD COLUMN "pdfTamanhoBytes" INTEGER;
