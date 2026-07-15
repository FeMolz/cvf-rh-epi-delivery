import { useMemo, useState } from 'react';

import { CampoDataBr } from '../../../shared/components/CampoDataBr.jsx';
import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import {
    aplicarMascaraCpf,
    aplicarMascaraTelefone,
    cpfEstaCompleto,
    telefoneEstaCompleto
} from '../../../shared/utils/formatadoresBrasil.js';
import {
    OPCOES_ESTADO_CIVIL,
    OPCOES_GRAU_INSTRUCAO,
    OPCOES_RACA_COR,
    OPCOES_STATUS_FUNCIONARIO,
    STATUS_FUNCIONARIO_COM_DATA_DESLIGAMENTO,
    STATUS_FUNCIONARIO_COM_DATA_RETORNO_AFASTAMENTO,
    STATUS_FUNCIONARIO_ENCERRADOS
} from '../utils/listagemFuncionarios.js';

/**
 * @param {{
 *   valoresIniciais?: Record<string, unknown>,
 *   cargos?: Array<{ id: string, name: string }>,
 *   empresas?: Array<{ id: string, name: string }>,
 *   setores?: Array<{ id: string, nome: string }>,
 *   exibirStatus?: boolean,
 *   rotuloContinuar?: string,
 *   carregando?: boolean,
 *   onContinuar: (dados: Record<string, unknown>) => void,
 *   onCancelar?: () => void,
 *   onSalvar?: (dados: Record<string, unknown>) => void,
 *   rotuloSalvar?: string
 * }} props
 */
export function FormularioFuncionarioEtapa1({
    valoresIniciais = {},
    cargos = [],
    empresas = [],
    setores = [],
    exibirStatus = false,
    rotuloContinuar = 'Continuar para endereço',
    rotuloSalvar = 'Salvar alterações',
    carregando = false,
    onContinuar,
    onCancelar,
    onSalvar
}) {
    const [dados, setDados] = useState({
        name: String(valoresIniciais.name || ''),
        cpf: aplicarMascaraCpf(valoresIniciais.cpf || ''),
        email: String(valoresIniciais.email || ''),
        telefone: aplicarMascaraTelefone(valoresIniciais.telefone || ''),
        birthDate: String(valoresIniciais.birthDate || '').slice(0, 10),
        admissionDate: String(valoresIniciais.admissionDate || new Date().toISOString()).slice(0, 10),
        companyId: String(valoresIniciais.companyId || ''),
        roleId: String(valoresIniciais.roleId || ''),
        setorId: String(valoresIniciais.setorId || ''),
        nacionalidade: String(valoresIniciais.nacionalidade || ''),
        estadoCivil: String(valoresIniciais.estadoCivil || ''),
        racaCor: String(valoresIniciais.racaCor || ''),
        filiacao: String(valoresIniciais.filiacao || ''),
        grauInstrucao: String(valoresIniciais.grauInstrucao || ''),
        numeroCtps: String(valoresIniciais.numeroCtps || ''),
        serieCtps: String(valoresIniciais.serieCtps || ''),
        numeroDependentes: String(valoresIniciais.numeroDependentes ?? ''),
        pis: String(valoresIniciais.pis || ''),
        chavePix: String(valoresIniciais.chavePix || ''),
        status: String(valoresIniciais.status || 'ATIVO'),
        resignationDate: String(valoresIniciais.resignationDate || '').slice(0, 10),
        leaveReturnDate: String(valoresIniciais.leaveReturnDate || '').slice(0, 10)
    });
    const [erro, setErro] = useState('');

    const cargosParaSelecao = useMemo(() => {
        const contratoEncerrado = STATUS_FUNCIONARIO_ENCERRADOS.includes(dados.status);

        return cargos.filter((cargo) => {
            if (cargo.deletedAt) {
                return contratoEncerrado && String(cargo.id) === String(dados.roleId);
            }

            return true;
        });
    }, [cargos, dados.status, dados.roleId]);

    function atualizarCampo(campo, valor) {
        setDados((atual) => {
            const proximo = { ...atual, [campo]: valor };

            if (campo === 'status' && !STATUS_FUNCIONARIO_COM_DATA_RETORNO_AFASTAMENTO.includes(valor)) {
                proximo.leaveReturnDate = '';
            }

            if (campo === 'status' && !STATUS_FUNCIONARIO_COM_DATA_DESLIGAMENTO.includes(valor)) {
                proximo.resignationDate = '';
            }

            return proximo;
        });
    }

    function validarDados() {
        const obrigatorios = [
            ['name', 'Nome'],
            ['cpf', 'CPF'],
            ['email', 'E-mail'],
            ['telefone', 'Telefone'],
            ['birthDate', 'Data de nascimento'],
            ['companyId', 'Empresa'],
            ['roleId', 'Cargo'],
            ['setorId', 'Setor']
        ];

        const faltando = obrigatorios.find(([campo]) => !String(dados[campo] || '').trim());

        if (faltando) {
            return `Preencha o campo obrigatório: ${faltando[1]}.`;
        }

        if (!cpfEstaCompleto(dados.cpf)) {
            return 'Informe um CPF completo no formato 000.000.000-00.';
        }

        if (!telefoneEstaCompleto(dados.telefone)) {
            return 'Informe um telefone completo no formato (00) 00000-0000 ou (00) 0000-0000.';
        }

        if (
            STATUS_FUNCIONARIO_COM_DATA_RETORNO_AFASTAMENTO.includes(dados.status) &&
            !String(dados.leaveReturnDate || '').trim()
        ) {
            return 'Informe a data prevista de retorno para férias ou licenças.';
        }

        if (
            STATUS_FUNCIONARIO_COM_DATA_DESLIGAMENTO.includes(dados.status) &&
            !String(dados.resignationDate || '').trim()
        ) {
            return 'Informe a data de desligamento para demissão, rescisão ou aposentadoria.';
        }

        return null;
    }

    function aoEnviar(evento) {
        evento.preventDefault();
        setErro('');

        const erroValidacao = validarDados();

        if (erroValidacao) {
            setErro(erroValidacao);
            return;
        }

        onContinuar(dados);
    }

    function aoSalvar() {
        setErro('');

        const erroValidacao = validarDados();

        if (erroValidacao) {
            setErro(erroValidacao);
            return;
        }

        onSalvar?.(dados);
    }

    return (
        <form className="formulario" onSubmit={aoEnviar}>
            <AreaMensagensFeedback erro={erro} onLimparErro={() => setErro('')} />

            <fieldset className="formulario__grupo">
                <legend>Dados obrigatórios</legend>

                <div className="formulario__grade">
                    <div className="campo">
                        <label htmlFor="funcionario-nome">Nome completo</label>
                        <input
                            id="funcionario-nome"
                            type="text"
                            value={dados.name}
                            onChange={(evento) => atualizarCampo('name', evento.target.value)}
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-cpf">CPF</label>
                        <input
                            id="funcionario-cpf"
                            type="text"
                            inputMode="numeric"
                            value={dados.cpf}
                            onChange={(evento) =>
                                atualizarCampo('cpf', aplicarMascaraCpf(evento.target.value))
                            }
                            placeholder="000.000.000-00"
                            maxLength={14}
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-email">E-mail</label>
                        <input
                            id="funcionario-email"
                            type="email"
                            value={dados.email}
                            onChange={(evento) => atualizarCampo('email', evento.target.value)}
                            required
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-telefone">Telefone</label>
                        <input
                            id="funcionario-telefone"
                            type="text"
                            inputMode="tel"
                            value={dados.telefone}
                            onChange={(evento) =>
                                atualizarCampo('telefone', aplicarMascaraTelefone(evento.target.value))
                            }
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                            required
                        />
                    </div>

                    <CampoDataBr
                        id="funcionario-nascimento"
                        rotulo="Data de nascimento"
                        value={dados.birthDate}
                        onChange={(valor) => atualizarCampo('birthDate', valor)}
                        required
                    />

                    <CampoDataBr
                        id="funcionario-admissao"
                        rotulo="Data de admissão"
                        value={dados.admissionDate}
                        onChange={(valor) => atualizarCampo('admissionDate', valor)}
                    />

                    <div className="campo">
                        <label htmlFor="funcionario-empresa">Empresa</label>
                        <select
                            id="funcionario-empresa"
                            value={dados.companyId}
                            onChange={(evento) => atualizarCampo('companyId', evento.target.value)}
                            required
                        >
                            <option value="">Selecione…</option>
                            {empresas.map((empresa) => (
                                <option key={empresa.id} value={empresa.id}>
                                    {empresa.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-cargo">Cargo</label>
                        <select
                            id="funcionario-cargo"
                            value={dados.roleId}
                            onChange={(evento) => atualizarCampo('roleId', evento.target.value)}
                            required
                        >
                            <option value="">Selecione…</option>
                            {cargosParaSelecao.map((cargo) => (
                                <option key={cargo.id} value={cargo.id}>
                                    {cargo.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-setor">Setor</label>
                        <select
                            id="funcionario-setor"
                            value={dados.setorId}
                            onChange={(evento) => atualizarCampo('setorId', evento.target.value)}
                            required
                        >
                            <option value="">Selecione…</option>
                            {setores.map((setor) => (
                                <option key={setor.id} value={setor.id}>
                                    {setor.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </fieldset>

            {exibirStatus ? (
                <fieldset className="formulario__grupo">
                    <legend>Situação do funcionário</legend>

                    <div className="formulario__grade">
                        <div className="campo">
                            <label htmlFor="funcionario-status">Status</label>
                            <select
                                id="funcionario-status"
                                value={dados.status}
                                onChange={(evento) => atualizarCampo('status', evento.target.value)}
                                required
                            >
                                {OPCOES_STATUS_FUNCIONARIO.map((opcao) => (
                                    <option key={opcao.valor} value={opcao.valor}>
                                        {opcao.rotulo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {STATUS_FUNCIONARIO_COM_DATA_DESLIGAMENTO.includes(dados.status) ? (
                            <CampoDataBr
                                id="funcionario-desligamento"
                                rotulo="Data de desligamento"
                                value={dados.resignationDate}
                                onChange={(valor) => atualizarCampo('resignationDate', valor)}
                                required
                            />
                        ) : null}

                        {STATUS_FUNCIONARIO_COM_DATA_RETORNO_AFASTAMENTO.includes(dados.status) ? (
                            <CampoDataBr
                                id="funcionario-retorno-afastamento"
                                rotulo="Data prevista de retorno"
                                value={dados.leaveReturnDate}
                                onChange={(valor) => atualizarCampo('leaveReturnDate', valor)}
                                required
                            />
                        ) : null}
                    </div>
                </fieldset>
            ) : null}

            <fieldset className="formulario__grupo">
                <legend>Dados opcionais</legend>

                <div className="formulario__grade">
                    <div className="campo">
                        <label htmlFor="funcionario-nacionalidade">Nacionalidade</label>
                        <input
                            id="funcionario-nacionalidade"
                            type="text"
                            value={dados.nacionalidade}
                            onChange={(evento) => atualizarCampo('nacionalidade', evento.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-estado-civil">Estado civil</label>
                        <select
                            id="funcionario-estado-civil"
                            value={dados.estadoCivil}
                            onChange={(evento) => atualizarCampo('estadoCivil', evento.target.value)}
                        >
                            <option value="">Selecione…</option>
                            {OPCOES_ESTADO_CIVIL.map((opcao) => (
                                <option key={opcao.valor} value={opcao.valor}>
                                    {opcao.rotulo}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-raca-cor">Raça/cor</label>
                        <select
                            id="funcionario-raca-cor"
                            value={dados.racaCor}
                            onChange={(evento) => atualizarCampo('racaCor', evento.target.value)}
                        >
                            <option value="">Selecione…</option>
                            {OPCOES_RACA_COR.map((opcao) => (
                                <option key={opcao.valor} value={opcao.valor}>
                                    {opcao.rotulo}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-grau-instrucao">Grau de instrução</label>
                        <select
                            id="funcionario-grau-instrucao"
                            value={dados.grauInstrucao}
                            onChange={(evento) => atualizarCampo('grauInstrucao', evento.target.value)}
                        >
                            <option value="">Selecione…</option>
                            {OPCOES_GRAU_INSTRUCAO.map((opcao) => (
                                <option key={opcao.valor} value={opcao.valor}>
                                    {opcao.rotulo}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo campo--largura-total">
                        <label htmlFor="funcionario-filiacao">Filiação</label>
                        <input
                            id="funcionario-filiacao"
                            type="text"
                            value={dados.filiacao}
                            onChange={(evento) => atualizarCampo('filiacao', evento.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-ctps">Número CTPS</label>
                        <input
                            id="funcionario-ctps"
                            type="text"
                            value={dados.numeroCtps}
                            onChange={(evento) => atualizarCampo('numeroCtps', evento.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-serie-ctps">Série CTPS</label>
                        <input
                            id="funcionario-serie-ctps"
                            type="text"
                            value={dados.serieCtps}
                            onChange={(evento) => atualizarCampo('serieCtps', evento.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-dependentes">Número de dependentes</label>
                        <input
                            id="funcionario-dependentes"
                            type="number"
                            min="0"
                            value={dados.numeroDependentes}
                            onChange={(evento) => atualizarCampo('numeroDependentes', evento.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-pis">PIS</label>
                        <input
                            id="funcionario-pis"
                            type="text"
                            value={dados.pis}
                            onChange={(evento) => atualizarCampo('pis', evento.target.value)}
                        />
                    </div>

                    <div className="campo">
                        <label htmlFor="funcionario-pix">Chave Pix</label>
                        <input
                            id="funcionario-pix"
                            type="text"
                            value={dados.chavePix}
                            onChange={(evento) => atualizarCampo('chavePix', evento.target.value)}
                        />
                    </div>
                </div>
            </fieldset>

            <div
                className={
                    onSalvar ? 'formulario__acoes formulario__acoes--multiplas' : 'formulario__acoes'
                }
            >
                {onCancelar ? (
                    <button
                        className="botao botao--secundario"
                        type="button"
                        disabled={carregando}
                        onClick={onCancelar}
                    >
                        Cancelar
                    </button>
                ) : null}
                {onSalvar ? (
                    <button
                        className="botao botao--secundario"
                        type="button"
                        disabled={carregando}
                        onClick={aoSalvar}
                    >
                        {carregando ? 'Salvando…' : rotuloSalvar}
                    </button>
                ) : null}
                <button className="botao botao--primario" type="submit" disabled={carregando}>
                    {rotuloContinuar}
                </button>
            </div>
        </form>
    );
}
