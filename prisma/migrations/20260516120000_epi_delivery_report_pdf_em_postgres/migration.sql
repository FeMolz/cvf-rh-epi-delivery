-- Relatorios antigos apontavam apenas para arquivo em disco; nao ha migracao automatica do binario.
-- Reemita relatorios se precisar do historico apos esta alteracao.
DELETE FROM "EpiDeliveryReport";

ALTER TABLE "EpiDeliveryReport" DROP COLUMN "pdfFileRelativePath";

ALTER TABLE "EpiDeliveryReport" ADD COLUMN "pdfConteudo" BYTEA NOT NULL;
