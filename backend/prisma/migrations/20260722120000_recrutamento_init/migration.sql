-- CreateEnum
CREATE TYPE "StatusAnuncioVaga" AS ENUM ('ATIVA', 'INATIVA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "TipoContratacaoVaga" AS ENUM ('CLT', 'PJ', 'ESTAGIO', 'TEMPORARIO', 'APRENDIZ', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusCadastroContratacao" AS ENUM ('AGUARDANDO_PREENCHIMENTO', 'AGUARDANDO_ANALISE_RH', 'CONTRATADO', 'DESCONTINUADO');

-- CreateTable
CREATE TABLE "AnuncioVaga" (
    "id" TEXT NOT NULL,
    "tituloVaga" TEXT NOT NULL,
    "apresentacaoEmpresa" TEXT NOT NULL,
    "sobreVaga" TEXT NOT NULL,
    "responsabilidades" TEXT NOT NULL,
    "requisitos" TEXT NOT NULL,
    "beneficios" TEXT NOT NULL,
    "localTrabalho" TEXT NOT NULL,
    "tipoContratacao" "TipoContratacaoVaga" NOT NULL,
    "jornadaTrabalho" TEXT NOT NULL,
    "faixaSalarial" TEXT,
    "roleId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "setorId" TEXT NOT NULL,
    "status" "StatusAnuncioVaga" NOT NULL DEFAULT 'INATIVA',
    "criadoPorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnuncioVaga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidatura" (
    "id" TEXT NOT NULL,
    "anuncioVagaId" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cpf" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "linkedinUrl" TEXT,
    "pretensaoSalarial" TEXT,
    "disponibilidadeInicio" TEXT,
    "mensagemCandidato" TEXT,
    "curriculoConteudo" BYTEA NOT NULL,
    "curriculoNomeArquivo" TEXT NOT NULL,
    "curriculoTipoMime" TEXT NOT NULL,
    "curriculoTamanhoBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CadastroContratacao" (
    "id" TEXT NOT NULL,
    "candidaturaId" TEXT NOT NULL,
    "tokenAcesso" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "setorId" TEXT NOT NULL,
    "status" "StatusCadastroContratacao" NOT NULL DEFAULT 'AGUARDANDO_PREENCHIMENTO',
    "name" TEXT,
    "cpf" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "birthDate" TIMESTAMP(3),
    "admissionDate" TIMESTAMP(3),
    "nacionalidade" TEXT,
    "estadoCivil" "EstadoCivil",
    "racaCor" "RacaCor",
    "filiacao" TEXT,
    "grauInstrucao" "GrauInstrucao",
    "numeroCtps" TEXT,
    "serieCtps" TEXT,
    "numeroDependentes" INTEGER,
    "pis" TEXT,
    "chavePix" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numeroEndereco" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "valeTransporte" BOOLEAN,
    "valeAlimentacao" BOOLEAN,
    "planoSaude" BOOLEAN,
    "employeeId" TEXT,
    "analisadoPorUserId" TEXT,
    "analisadoEm" TIMESTAMP(3),
    "enviadoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CadastroContratacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnuncioVaga_status_idx" ON "AnuncioVaga"("status");

-- CreateIndex
CREATE INDEX "AnuncioVaga_createdAt_idx" ON "AnuncioVaga"("createdAt");

-- CreateIndex
CREATE INDEX "Candidatura_anuncioVagaId_idx" ON "Candidatura"("anuncioVagaId");

-- CreateIndex
CREATE INDEX "Candidatura_createdAt_idx" ON "Candidatura"("createdAt");

-- CreateIndex
CREATE INDEX "Candidatura_email_idx" ON "Candidatura"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CadastroContratacao_candidaturaId_key" ON "CadastroContratacao"("candidaturaId");

-- CreateIndex
CREATE UNIQUE INDEX "CadastroContratacao_tokenAcesso_key" ON "CadastroContratacao"("tokenAcesso");

-- CreateIndex
CREATE UNIQUE INDEX "CadastroContratacao_employeeId_key" ON "CadastroContratacao"("employeeId");

-- CreateIndex
CREATE INDEX "CadastroContratacao_status_idx" ON "CadastroContratacao"("status");

-- CreateIndex
CREATE INDEX "CadastroContratacao_tokenAcesso_idx" ON "CadastroContratacao"("tokenAcesso");

-- AddForeignKey
ALTER TABLE "AnuncioVaga" ADD CONSTRAINT "AnuncioVaga_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioVaga" ADD CONSTRAINT "AnuncioVaga_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioVaga" ADD CONSTRAINT "AnuncioVaga_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnuncioVaga" ADD CONSTRAINT "AnuncioVaga_criadoPorUserId_fkey" FOREIGN KEY ("criadoPorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidatura" ADD CONSTRAINT "Candidatura_anuncioVagaId_fkey" FOREIGN KEY ("anuncioVagaId") REFERENCES "AnuncioVaga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CadastroContratacao" ADD CONSTRAINT "CadastroContratacao_candidaturaId_fkey" FOREIGN KEY ("candidaturaId") REFERENCES "Candidatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CadastroContratacao" ADD CONSTRAINT "CadastroContratacao_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CadastroContratacao" ADD CONSTRAINT "CadastroContratacao_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CadastroContratacao" ADD CONSTRAINT "CadastroContratacao_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CadastroContratacao" ADD CONSTRAINT "CadastroContratacao_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CadastroContratacao" ADD CONSTRAINT "CadastroContratacao_analisadoPorUserId_fkey" FOREIGN KEY ("analisadoPorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
