import nodemailer from 'nodemailer';

import env from '../../../config/env.js';
import {
    MENSAGEM_FALHA_ENVIO_EMAIL,
    MENSAGEM_MAIL_NAO_CONFIGURADO
} from './constants/mailConstantes.js';

class MailProvider {
    #transporte = null;

    /**
     * @returns {import('nodemailer').Transporter}
     */
    #obterTransporte() {
        if (!env.GMAIL_USER || !env.GMAIL_PASS) {
            throw new Error(MENSAGEM_MAIL_NAO_CONFIGURADO);
        }

        if (!this.#transporte) {
            this.#transporte = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: env.GMAIL_USER,
                    pass: env.GMAIL_PASS
                }
            });
        }

        return this.#transporte;
    }

    /**
     * @param {{ para: string, assunto: string, html: string, texto?: string }} parametros
     */
    async enviar(parametros) {
        const { para, assunto, html, texto } = parametros;

        if (!para || !assunto || !html) {
            throw new Error(MENSAGEM_FALHA_ENVIO_EMAIL);
        }

        try {
            const transporte = this.#obterTransporte();
            await transporte.sendMail({
                from: env.GMAIL_USER,
                to: para,
                subject: assunto,
                html,
                text: texto || undefined
            });
        } catch (erro) {
            if (erro?.message === MENSAGEM_MAIL_NAO_CONFIGURADO) {
                throw erro;
            }

            const detalhe = erro?.message ? ` ${erro.message}` : '';
            throw new Error(`${MENSAGEM_FALHA_ENVIO_EMAIL}${detalhe}`);
        }
    }
}

export default new MailProvider();
