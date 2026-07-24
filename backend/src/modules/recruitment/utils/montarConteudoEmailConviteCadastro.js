/**
 * @param {{ nomeCandidato: string, urlCadastro: string }} parametros
 */
export function montarConteudoEmailConviteCadastro({ nomeCandidato, urlCadastro }) {
    const nome = nomeCandidato?.trim() || 'candidato(a)';
    const texto = [
        `Olá, ${nome}!`,
        '',
        'Parabéns pela continuidade no processo de contratação.',
        '',
        'O link abaixo permite que você preencha seus dados para que o RH possa cadastrá-lo(a) no sistema:',
        urlCadastro,
        '',
        'Se você não esperava este e-mail, ignore esta mensagem.'
    ].join('\n');

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /></head>
<body style="font-family: Arial, sans-serif; color: #1a1a1a; line-height: 1.5;">
  <p>Olá, <strong>${escaparHtml(nome)}</strong>!</p>
  <p>Parabéns pela continuidade no processo de contratação.</p>
  <p>O link abaixo serve para que você preencha suas informações e o RH consiga cadastrá-lo(a) no sistema:</p>
  <p><a href="${escaparAtributoHtml(urlCadastro)}" style="color: #0b5fff;">${escaparHtml(urlCadastro)}</a></p>
  <p style="color: #555; font-size: 0.9em;">Se você não esperava este e-mail, ignore esta mensagem.</p>
</body>
</html>`.trim();

    return { texto, html };
}

/**
 * @param {string} valor
 */
function escaparHtml(valor) {
    return String(valor)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}

/**
 * @param {string} valor
 */
function escaparAtributoHtml(valor) {
    return escaparHtml(valor).replaceAll("'", '&#39;');
}
