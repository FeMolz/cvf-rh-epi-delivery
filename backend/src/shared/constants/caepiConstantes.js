export const URL_PADRAO_CAEPI_API = 'http://localhost:8080';

export const TIMEOUT_PADRAO_VERIFICACAO_CAEPI_MS = 10_000;

export const INTERVALO_AGUARDAR_CAEPI_MS = 2_000;

export const MAX_TENTATIVAS_AGUARDAR_CAEPI = 30;

/** CA usado apenas para probe de disponibilidade (200 ou 404 = API no ar). */
export const NUMERO_CA_PROBE_DISPONIBILIDADE_CAEPI = '11070';

export const IMAGEM_DOCKER_CAEPI_API = 'joaoaugustomv/api_base_ca_epi:2.0';

export const PORTA_HOST_CAEPI_API = 8080;

export const ROTA_BUSCA_CAEPI_POR_NOME = '/pesquisarPorNomeEquipamento';

export const MENSAGEM_CAEPI_INDISPONIVEL =
    'API CAEPI indisponível. Execute npm run docker:apoio:up -w backend e confira CAEPI_API_URL.';

export const MENSAGEM_CAEPI_BUSCA_POR_NOME_INDISPONIVEL =
    'Busca por nome indisponível na API CAEPI em execução. A imagem padrão não possui esse endpoint — execute npm run docker:apoio:up -w backend para subir a imagem customizada.';
