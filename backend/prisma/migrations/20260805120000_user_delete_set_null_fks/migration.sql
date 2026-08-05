-- Allow deleting users while preserving EPI delivery and related history.
ALTER TABLE "EpiDelivery" ALTER COLUMN "deliveredById" DROP NOT NULL;

ALTER TABLE "EpiDelivery" DROP CONSTRAINT IF EXISTS "EpiDelivery_deliveredById_fkey";
ALTER TABLE "EpiDelivery" ADD CONSTRAINT "EpiDelivery_deliveredById_fkey"
    FOREIGN KEY ("deliveredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EpiDeliveryReport" DROP CONSTRAINT IF EXISTS "EpiDeliveryReport_generatedByUserId_fkey";
ALTER TABLE "EpiDeliveryReport" ADD CONSTRAINT "EpiDeliveryReport_generatedByUserId_fkey"
    FOREIGN KEY ("generatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CadastroContratacao" DROP CONSTRAINT IF EXISTS "CadastroContratacao_analisadoPorUserId_fkey";
ALTER TABLE "CadastroContratacao" ADD CONSTRAINT "CadastroContratacao_analisadoPorUserId_fkey"
    FOREIGN KEY ("analisadoPorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AnuncioVaga" ALTER COLUMN "criadoPorUserId" DROP NOT NULL;

ALTER TABLE "AnuncioVaga" DROP CONSTRAINT IF EXISTS "AnuncioVaga_criadoPorUserId_fkey";
ALTER TABLE "AnuncioVaga" ADD CONSTRAINT "AnuncioVaga_criadoPorUserId_fkey"
    FOREIGN KEY ("criadoPorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
