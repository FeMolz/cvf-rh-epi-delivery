class EpiProvider {
    /**
     * Busca dados do EPI na API pública
     * @param {string|number} caNumber 
     * @returns {Promise<Object|null>}
     */
    async getEpiByCa(caNumber) {
        const baseUrl = process.env.CAEPI_API_URL || 'http://localhost:8080';
        
        try {
            const response = await fetch(`${baseUrl}/CA/${caNumber}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    return null; // EPI não encontrado
                }
                throw new Error(`Erro na API externa: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Tratamento da "DataValidade" (geralmente vem DD/MM/YYYY)
            let expirationDate;
            if (data.DataValidade) {
                const parts = data.DataValidade.split('/');
                if (parts.length === 3) {
                    expirationDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`);
                } else {
                    expirationDate = new Date(data.DataValidade);
                }
            } else {
                expirationDate = new Date(); // Fallback
            }

            return {
                caNumber: String(data.RegistroCA || caNumber),
                name: data.NomeEquipamento || 'EPI Sem Nome',
                expirationDate,
                isActive: data.Situacao !== 'VENCIDO',
                rawData: data // Preserva os dados originais caso o sistema precise futuramente
            };

        } catch (error) {
            console.error('[EpiProvider] Erro ao consultar a API baseCAEPI:', error.message);
            throw new Error('Erro interno ao tentar consultar o EPI.');
        }
    }
}

export default new EpiProvider();
