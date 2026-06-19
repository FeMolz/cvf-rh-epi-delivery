const ETAPAS = [
    { numero: 1, rotulo: 'Dados pessoais' },
    { numero: 2, rotulo: 'Endereço' },
    { numero: 3, rotulo: 'Benefícios' }
];

/**
 * @param {{ etapaAtual: number }} props
 */
export function IndicadorEtapasCadastro({ etapaAtual }) {
    return (
        <ol className="cadastro-etapas" aria-label="Etapas do cadastro">
            {ETAPAS.map((etapa) => {
                const concluida = etapa.numero < etapaAtual;
                const ativa = etapa.numero === etapaAtual;

                return (
                    <li
                        key={etapa.numero}
                        className={[
                            'cadastro-etapas__item',
                            concluida ? 'cadastro-etapas__item--concluida' : '',
                            ativa ? 'cadastro-etapas__item--ativa' : ''
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        <span className="cadastro-etapas__numero">{etapa.numero}</span>
                        <span className="cadastro-etapas__rotulo">{etapa.rotulo}</span>
                    </li>
                );
            })}
        </ol>
    );
}
