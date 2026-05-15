-- CreateTable
CREATE TABLE "Quesito" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "bloco" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quesito_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Quesito_nome_key" ON "Quesito"("nome");

CREATE INDEX "Quesito_bloco_idx" ON "Quesito"("bloco");

-- CreateTable
CREATE TABLE "RoleQuesito" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "quesitoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleQuesito_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RoleQuesito_roleId_quesitoId_key" ON "RoleQuesito"("roleId", "quesitoId");

CREATE INDEX "RoleQuesito_roleId_idx" ON "RoleQuesito"("roleId");

CREATE INDEX "RoleQuesito_quesitoId_idx" ON "RoleQuesito"("quesitoId");

ALTER TABLE "RoleQuesito" ADD CONSTRAINT "RoleQuesito_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoleQuesito" ADD CONSTRAINT "RoleQuesito_quesitoId_fkey" FOREIGN KEY ("quesitoId") REFERENCES "Quesito"("id") ON DELETE CASCADE ON UPDATE CASCADE;
