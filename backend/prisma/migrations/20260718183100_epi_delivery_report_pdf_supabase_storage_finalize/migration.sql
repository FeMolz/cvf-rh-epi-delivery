-- Etapa 2: remove binario legado apos migrar PDFs para o Supabase Storage.

DELETE FROM "EpiDeliveryReport" WHERE "pdfStoragePath" IS NULL;

ALTER TABLE "EpiDeliveryReport" DROP COLUMN "pdfConteudo";

ALTER TABLE "EpiDeliveryReport" ALTER COLUMN "pdfStoragePath" SET NOT NULL;
ALTER TABLE "EpiDeliveryReport" ALTER COLUMN "pdfTamanhoBytes" SET NOT NULL;
