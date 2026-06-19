-- CreateTable
CREATE TABLE "EpiDeliveryReport" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "periodStartDate" TIMESTAMP(3) NOT NULL,
    "periodEndDate" TIMESTAMP(3) NOT NULL,
    "pdfFileRelativePath" TEXT NOT NULL,
    "foiImpresso" BOOLEAN NOT NULL DEFAULT false,
    "foiEncaminhado" BOOLEAN NOT NULL DEFAULT false,
    "foiAssinado" BOOLEAN NOT NULL DEFAULT false,
    "generatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EpiDeliveryReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EpiDeliveryReport_employeeId_idx" ON "EpiDeliveryReport"("employeeId");

CREATE INDEX "EpiDeliveryReport_foiAssinado_idx" ON "EpiDeliveryReport"("foiAssinado");

ALTER TABLE "EpiDeliveryReport" ADD CONSTRAINT "EpiDeliveryReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EpiDeliveryReport" ADD CONSTRAINT "EpiDeliveryReport_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
