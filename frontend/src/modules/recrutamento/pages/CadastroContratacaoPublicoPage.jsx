import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AreaMensagensFeedback } from '../../../shared/components/MensagemFeedback.jsx';
import { CampoDataBr } from '../../../shared/components/CampoDataBr.jsx';
import {
    aplicarMascaraCpf,
    aplicarMascaraTelefone,
    cpfEstaCompleto,
    telefoneEstaCompleto
} from '../../../shared/utils/formatadoresBrasil.js';
import {
    OPCOES_ESTADO_CIVIL,
    OPCOES_GRAU_INSTRUCAO,
    OPCOES_RACA_COR
} from '../../funcionarios/utils/listagemFuncionarios.js';
import {
    obterCadastroContratacaoPublico,
    submeterCadastroContratacaoPublico
} from '../services/recrutamentoApi.js';
import './recrutamento.css';

const CAMPOS_TEXTO_OBRIGATORIOS = [
    ['name', 'Nome completo'],
    ['nacionalidade', 'Nacionalidade'],
    ['filiacao', 'Filiação'],
    ['numeroCtps', 'Número CTPS'],
    ['serieCtps', 'Série CTPS'],
    ['pis', 'PIS'],
    ['chavePix', 'Chave Pix'],
    ['cep', 'CEP'],
    ['logradouro', 'Logradouro'],
    ['numeroEndereco', 'Número'],
    ['bairro', 'Bairro'],
    ['cidade', 'Cidade'],
    ['estado', 'UF']
];

export function CadastroContratacaoPublicoPage() {
    const { token } = useParams();
    const [formulario, setFormulario] = useState(null);
    const [dados, setDados] = useState({});
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregando(true);
            setErro('');

            try {
                const resposta = await obterCadastroContratacaoPublico(token);
                if (!ativo) {
                    return;
                }

                setFormulario(resposta);
                const sugestao = resposta.sugestaoPreenchimento || {};
                const preenchidos = resposta.dadosPreenchidos || {};

                setDados({
                    name: preenchidos.name || sugestao.name || '',
                    cpf: aplicarMascaraCpf(preenchidos.cpf || sugestao.cpf || ''),
                    email: preenchidos.email || sugestao.email || '',
                    telefone: aplicarMascaraTelefone(preenchidos.telefone || sugestao.telefone || ''),
                    birthDate: String(preenchidos.birthDate || '').slice(0, 10),
                    nacionalidade: preenchidos.nacionalidade || '',
                    estadoCivil: preenchidos.estadoCivil || '',
                    racaCor: preenchidos.racaCor || '',
                    filiacao: preenchidos.filiacao || '',
                    grauInstrucao: preenchidos.grauInstrucao || '',
                    numeroCtps: preenchidos.numeroCtps || '',
                    serieCtps: preenchidos.serieCtps || '',
                    numeroDependentes: String(preenchidos.numeroDependentes ?? ''),
                    pis: preenchidos.pis || '',
                    chavePix: preenchidos.chavePix || '',
                    cep: preenchidos.cep || '',
                    logradouro: preenchidos.logradouro || '',
                    numeroEndereco: preenchidos.numeroEndereco || '',
                    complemento: preenchidos.complemento || '',
                    bairro: preenchidos.bairro || '',
                    cidade: preenchidos.cidade || '',
                    estado: preenchidos.estado || ''
                });
            } catch (erroCapturado) {
                if (ativo) {
                    setErro(erroCapturado.message || 'Link de cadastro inválido ou expirado.');
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, [token]);

    function atualizarCampo(campo, valor) {
        setDados((atual) => ({ ...atual, [campo]: valor }));
    }

    function validar() {
        for (const [campo, rotulo] of CAMPOS_TEXTO_OBRIGATORIOS) {
            if (!String(dados[campo] || '').trim()) {
                return `Preencha o campo obrigatório: ${rotulo}.`;
            }
        }

        if (!dados.estadoCivil) {
            return 'Preencha o campo obrigatório: Estado civil.';
        }

        if (!dados.racaCor) {
            return 'Preencha o campo obrigatório: Raça/cor.';
        }

        if (!dados.grauInstrucao) {
            return 'Preencha o campo obrigatório: Grau de instrução.';
        }

        if (!dados.birthDate) {
            return 'Preencha o campo obrigatório: Data de nascimento.';
        }

        if (dados.numeroDependentes === '' || dados.numeroDependentes === null) {
            return 'Preencha o campo obrigatório: Número de dependentes.';
        }

        if (!cpfEstaCompleto(dados.cpf)) {
            return 'Informe um CPF completo no formato 000.000.000-00.';
        }

        if (!telefoneEstaCompleto(dados.telefone)) {
            return 'Informe um telefone completo.';
        }

        return null;
    }

    async function enviar(evento) {
        evento.preventDefault();
        setErro('');
        setSucesso('');

        const erroValidacao = validar();
        if (erroValidacao) {
            setErro(erroValidacao);
            return;
        }

        setEnviando(true);

        try {
            await submeterCadastroContratacaoPublico(token, {
                ...dados,
                numeroDependentes: Number(dados.numeroDependentes)
            });
            setSucesso(
                'Dados enviados com sucesso. O RH analisará seu cadastro e entrará em contato.'
            );
            setFormulario(null);
        } catch (erroCapturado) {
            setErro(erroCapturado.message || 'Não foi possível enviar o cadastro.');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main className="cadastro-contratacao-publico">
            <header className="cadastro-contratacao-publico__cabecalho">
                <h1>Cadastro para contratação</h1>
                <p>
                    Preencha seus dados para que o RH possa cadastrá-lo(a) no sistema. Todos os
                    campos visíveis são obrigatórios, exceto o complemento.
                </p>
            </header>

            <AreaMensagensFeedback
                erro={erro}
                sucesso={sucesso}
                onLimparErro={() => setErro('')}
                onLimparSucesso={() => setSucesso('')}
            />

            {carregando ? <p className="estado-carregando">Carregando formulário…</p> : null}

            {!carregando && formulario ? (
                <form className="formulario cadastro-contratacao-publico__formulario" onSubmit={enviar}>
                    <fieldset className="formulario__grupo">
                        <legend>Vínculos (definidos pela vaga)</legend>
                        <div className="formulario__grade">
                            <div className="campo">
                                <label>Empresa</label>
                                <input type="text" value={formulario.empresa?.name || ''} disabled />
                            </div>
                            <div className="campo">
                                <label>Cargo</label>
                                <input type="text" value={formulario.cargo?.name || ''} disabled />
                            </div>
                            <div className="campo">
                                <label>Setor</label>
                                <input type="text" value={formulario.setor?.nome || ''} disabled />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="formulario__grupo">
                        <legend>Dados pessoais</legend>
                        <div className="formulario__grade">
                            <div className="campo">
                                <label htmlFor="cadastro-nome">Nome completo</label>
                                <input
                                    id="cadastro-nome"
                                    type="text"
                                    value={dados.name || ''}
                                    onChange={(e) => atualizarCampo('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-cpf">CPF</label>
                                <input
                                    id="cadastro-cpf"
                                    type="text"
                                    value={dados.cpf || ''}
                                    onChange={(e) =>
                                        atualizarCampo('cpf', aplicarMascaraCpf(e.target.value))
                                    }
                                    maxLength={14}
                                    required
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-email">E-mail</label>
                                <input
                                    id="cadastro-email"
                                    type="email"
                                    value={dados.email || ''}
                                    onChange={(e) => atualizarCampo('email', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-telefone">Telefone</label>
                                <input
                                    id="cadastro-telefone"
                                    type="text"
                                    value={dados.telefone || ''}
                                    onChange={(e) =>
                                        atualizarCampo(
                                            'telefone',
                                            aplicarMascaraTelefone(e.target.value)
                                        )
                                    }
                                    maxLength={15}
                                    required
                                />
                            </div>
                            <CampoDataBr
                                id="cadastro-nascimento"
                                rotulo="Data de nascimento"
                                value={dados.birthDate || ''}
                                onChange={(valor) => atualizarCampo('birthDate', valor)}
                                required
                            />
                            <div className="campo">
                                <label htmlFor="cadastro-nacionalidade">Nacionalidade</label>
                                <input
                                    id="cadastro-nacionalidade"
                                    type="text"
                                    value={dados.nacionalidade || ''}
                                    onChange={(e) => atualizarCampo('nacionalidade', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-estado-civil">Estado civil</label>
                                <select
                                    id="cadastro-estado-civil"
                                    value={dados.estadoCivil || ''}
                                    onChange={(e) => atualizarCampo('estadoCivil', e.target.value)}
                                    required
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
                                <label htmlFor="cadastro-raca">Raça/cor</label>
                                <select
                                    id="cadastro-raca"
                                    value={dados.racaCor || ''}
                                    onChange={(e) => atualizarCampo('racaCor', e.target.value)}
                                    required
                                >
                                    <option value="">Selecione…</option>
                                    {OPCOES_RACA_COR.map((opcao) => (
                                        <option key={opcao.valor} value={opcao.valor}>
                                            {opcao.rotulo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="campo campo--largura-total">
                                <label htmlFor="cadastro-filiacao">Filiação</label>
                                <input
                                    id="cadastro-filiacao"
                                    type="text"
                                    value={dados.filiacao || ''}
                                    onChange={(e) => atualizarCampo('filiacao', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-grau">Grau de instrução</label>
                                <select
                                    id="cadastro-grau"
                                    value={dados.grauInstrucao || ''}
                                    onChange={(e) => atualizarCampo('grauInstrucao', e.target.value)}
                                    required
                                >
                                    <option value="">Selecione…</option>
                                    {OPCOES_GRAU_INSTRUCAO.map((opcao) => (
                                        <option key={opcao.valor} value={opcao.valor}>
                                            {opcao.rotulo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-ctps">Número CTPS</label>
                                <input
                                    id="cadastro-ctps"
                                    type="text"
                                    value={dados.numeroCtps || ''}
                                    onChange={(e) => atualizarCampo('numeroCtps', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-serie">Série CTPS</label>
                                <input
                                    id="cadastro-serie"
                                    type="text"
                                    value={dados.serieCtps || ''}
                                    onChange={(e) => atualizarCampo('serieCtps', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-dependentes">Nº de dependentes</label>
                                <input
                                    id="cadastro-dependentes"
                                    type="number"
                                    min={0}
                                    value={dados.numeroDependentes}
                                    onChange={(e) =>
                                        atualizarCampo('numeroDependentes', e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-pis">PIS</label>
                                <input
                                    id="cadastro-pis"
                                    type="text"
                                    value={dados.pis || ''}
                                    onChange={(e) => atualizarCampo('pis', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-pix">Chave Pix</label>
                                <input
                                    id="cadastro-pix"
                                    type="text"
                                    value={dados.chavePix || ''}
                                    onChange={(e) => atualizarCampo('chavePix', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="formulario__grupo">
                        <legend>Endereço</legend>
                        <div className="formulario__grade">
                            <div className="campo">
                                <label htmlFor="cadastro-cep">CEP</label>
                                <input
                                    id="cadastro-cep"
                                    type="text"
                                    value={dados.cep || ''}
                                    onChange={(e) => atualizarCampo('cep', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-uf">UF</label>
                                <input
                                    id="cadastro-uf"
                                    type="text"
                                    maxLength={2}
                                    value={dados.estado || ''}
                                    onChange={(e) =>
                                        atualizarCampo('estado', e.target.value.toUpperCase())
                                    }
                                    required
                                />
                            </div>
                            <div className="campo campo--largura-total">
                                <label htmlFor="cadastro-logradouro">Logradouro</label>
                                <input
                                    id="cadastro-logradouro"
                                    type="text"
                                    value={dados.logradouro || ''}
                                    onChange={(e) => atualizarCampo('logradouro', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-numero">Número</label>
                                <input
                                    id="cadastro-numero"
                                    type="text"
                                    value={dados.numeroEndereco || ''}
                                    onChange={(e) => atualizarCampo('numeroEndereco', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-complemento">Complemento (opcional)</label>
                                <input
                                    id="cadastro-complemento"
                                    type="text"
                                    value={dados.complemento || ''}
                                    onChange={(e) => atualizarCampo('complemento', e.target.value)}
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-bairro">Bairro</label>
                                <input
                                    id="cadastro-bairro"
                                    type="text"
                                    value={dados.bairro || ''}
                                    onChange={(e) => atualizarCampo('bairro', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="campo">
                                <label htmlFor="cadastro-cidade">Cidade</label>
                                <input
                                    id="cadastro-cidade"
                                    type="text"
                                    value={dados.cidade || ''}
                                    onChange={(e) => atualizarCampo('cidade', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </fieldset>

                    <div className="formulario__acoes">
                        <button className="botao botao--primario" type="submit" disabled={enviando}>
                            {enviando ? 'Enviando…' : 'Enviar dados para o RH'}
                        </button>
                    </div>
                </form>
            ) : null}
        </main>
    );
}
