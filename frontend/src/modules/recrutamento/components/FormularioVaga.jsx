import { useEffect, useState } from 'react';

import { listarCargos } from '../../cargos/services/cargosApi.js';
import { listarEmpresas } from '../../empresas/services/empresasApi.js';
import { listarSetores } from '../../setores/services/setoresApi.js';
import {
    MODOS_TRABALHO_VAGA,
    TIPOS_CONTRATACAO_VAGA
} from '../constants/recrutamentoConstantes.js';
import { obterRotuloModoTrabalho, obterRotuloTipoContratacao } from '../utils/formatarRecrutamento.js';

const CAMPOS_TEXTO_LONGO = [
    { nome: 'apresentacaoEmpresa', rotulo: 'Apresentação da empresa', obrigatorio: true },
    { nome: 'sobreVaga', rotulo: 'Sobre a vaga', obrigatorio: true },
    { nome: 'responsabilidades', rotulo: 'Responsabilidades', obrigatorio: true },
    { nome: 'requisitos', rotulo: 'Requisitos', obrigatorio: true },
    { nome: 'beneficios', rotulo: 'Benefícios', obrigatorio: true }
];

/**
 * @param {{
 *   valoresIniciais?: object,
 *   token?: string,
 *   carregando?: boolean,
 *   exibirBotaoSalvar?: boolean,
 *   somenteLeitura?: boolean,
 *   linkVoltar?: import('react').ReactNode,
 *   onSubmit: (dados: object) => void | Promise<void>
 * }} props
 */
export function FormularioVaga({
    valoresIniciais = {},
    token,
    carregando = false,
    exibirBotaoSalvar = true,
    somenteLeitura = false,
    linkVoltar = null,
    onSubmit
}) {
    const [formulario, setFormulario] = useState({
        tituloVaga: '',
        apresentacaoEmpresa: '',
        sobreVaga: '',
        responsabilidades: '',
        requisitos: '',
        beneficios: '',
        localTrabalho: '',
        modoTrabalho: MODOS_TRABALHO_VAGA.PRESENCIAL,
        tipoContratacao: TIPOS_CONTRATACAO_VAGA.CLT,
        jornadaTrabalho: '',
        faixaSalarial: '',
        roleId: '',
        companyId: '',
        setorId: '',
        ...valoresIniciais
    });
    const [cargos, setCargos] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [setores, setSetores] = useState([]);
    const [carregandoReferencias, setCarregandoReferencias] = useState(true);

    useEffect(() => {
        setFormulario((estadoAtual) => ({ ...estadoAtual, ...valoresIniciais }));
    }, [valoresIniciais]);

    useEffect(() => {
        if (!token) {
            return;
        }

        async function carregarReferencias() {
            setCarregandoReferencias(true);

            try {
                const [listaCargos, listaEmpresas, listaSetores] = await Promise.all([
                    listarCargos(token),
                    listarEmpresas(token),
                    listarSetores(token)
                ]);

                setCargos(listaCargos);
                setEmpresas(listaEmpresas);
                setSetores(listaSetores);
            } finally {
                setCarregandoReferencias(false);
            }
        }

        carregarReferencias();
    }, [token]);

    function atualizarCampo(nome, valor) {
        setFormulario((estadoAtual) => ({ ...estadoAtual, [nome]: valor }));
    }

    async function enviarFormulario(evento) {
        evento.preventDefault();
        await onSubmit(formulario);
    }

    return (
        <form className="formulario" onSubmit={enviarFormulario}>
            <fieldset className="formulario__grupo">
                <legend>Dados da vaga</legend>

                <div className="formulario__grade">
                    <div className="campo campo--largura-total">
                        <label htmlFor="vaga-titulo">Título da vaga</label>
                        <input
                            id="vaga-titulo"
                            type="text"
                            value={formulario.tituloVaga}
                            onChange={(evento) => atualizarCampo('tituloVaga', evento.target.value)}
                            required
                            disabled={somenteLeitura}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="vaga-local">Local de trabalho</label>
                        <input
                            id="vaga-local"
                            type="text"
                            value={formulario.localTrabalho}
                            onChange={(evento) => atualizarCampo('localTrabalho', evento.target.value)}
                            required
                            disabled={somenteLeitura}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="vaga-modo">Modo de trabalho</label>
                        <select
                            id="vaga-modo"
                            value={formulario.modoTrabalho}
                            onChange={(evento) => atualizarCampo('modoTrabalho', evento.target.value)}
                            disabled={somenteLeitura}
                        >
                            {Object.values(MODOS_TRABALHO_VAGA).map((modo) => (
                                <option key={modo} value={modo}>
                                    {obterRotuloModoTrabalho(modo)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo">
                        <label htmlFor="vaga-contratacao">Tipo de contratação</label>
                        <select
                            id="vaga-contratacao"
                            value={formulario.tipoContratacao}
                            onChange={(evento) => atualizarCampo('tipoContratacao', evento.target.value)}
                            disabled={somenteLeitura}
                        >
                            {Object.values(TIPOS_CONTRATACAO_VAGA).map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {obterRotuloTipoContratacao(tipo)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo">
                        <label htmlFor="vaga-jornada">Jornada de trabalho</label>
                        <input
                            id="vaga-jornada"
                            type="text"
                            value={formulario.jornadaTrabalho}
                            onChange={(evento) => atualizarCampo('jornadaTrabalho', evento.target.value)}
                            required
                            disabled={somenteLeitura}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="vaga-salario">Faixa salarial</label>
                        <input
                            id="vaga-salario"
                            type="text"
                            value={formulario.faixaSalarial || ''}
                            onChange={(evento) => atualizarCampo('faixaSalarial', evento.target.value)}
                            placeholder="A combinar"
                            disabled={somenteLeitura}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="vaga-cargo">Cargo</label>
                        <select
                            id="vaga-cargo"
                            value={formulario.roleId}
                            onChange={(evento) => atualizarCampo('roleId', evento.target.value)}
                            required
                            disabled={somenteLeitura || carregandoReferencias}
                        >
                            <option value="">Selecione</option>
                            {cargos.map((cargo) => (
                                <option key={cargo.id} value={cargo.id}>
                                    {cargo.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo">
                        <label htmlFor="vaga-empresa">Empresa</label>
                        <select
                            id="vaga-empresa"
                            value={formulario.companyId}
                            onChange={(evento) => atualizarCampo('companyId', evento.target.value)}
                            required
                            disabled={somenteLeitura || carregandoReferencias}
                        >
                            <option value="">Selecione</option>
                            {empresas.map((empresa) => (
                                <option key={empresa.id} value={empresa.id}>
                                    {empresa.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo">
                        <label htmlFor="vaga-setor">Setor</label>
                        <select
                            id="vaga-setor"
                            value={formulario.setorId}
                            onChange={(evento) => atualizarCampo('setorId', evento.target.value)}
                            required
                            disabled={somenteLeitura || carregandoReferencias}
                        >
                            <option value="">Selecione</option>
                            {setores.map((setor) => (
                                <option key={setor.id} value={setor.id}>
                                    {setor.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </fieldset>

            <fieldset className="formulario__grupo">
                <legend>Conteúdo do anúncio</legend>

                <div className="formulario__grade">
                    {CAMPOS_TEXTO_LONGO.map((campo) => (
                        <div key={campo.nome} className="campo campo--largura-total">
                            <label htmlFor={`vaga-${campo.nome}`}>{campo.rotulo}</label>
                            <textarea
                                id={`vaga-${campo.nome}`}
                                rows={4}
                                value={formulario[campo.nome]}
                                onChange={(evento) => atualizarCampo(campo.nome, evento.target.value)}
                                required={campo.obrigatorio}
                                disabled={somenteLeitura}
                            />
                        </div>
                    ))}
                </div>
            </fieldset>

            {exibirBotaoSalvar && linkVoltar ? (
                <div className="detalhe-usuario__acoes">
                    <div className="detalhe-usuario__acoes-principais">
                        <button className="botao botao--primario" type="submit" disabled={carregando}>
                            {carregando ? 'Salvando…' : 'Salvar vaga'}
                        </button>
                    </div>
                    <div className="detalhe-usuario__acoes-secundarias">{linkVoltar}</div>
                </div>
            ) : null}

            {exibirBotaoSalvar && !linkVoltar ? (
                <div className="formulario__acoes">
                    <button className="botao botao--primario" type="submit" disabled={carregando}>
                        {carregando ? 'Salvando…' : 'Salvar vaga'}
                    </button>
                </div>
            ) : null}
        </form>
    );
}
