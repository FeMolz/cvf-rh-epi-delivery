/**
 * Gera um nome legível a partir do identificador de e-mail.
 * @param {string} email
 */
export function derivarNomeDoEmail(email) {
    const local = email.split('@')[0]?.trim();

    if (!local) {
        return 'Usuário';
    }

    return local
        .replace(/[._-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (caractere) => caractere.toUpperCase());
}
