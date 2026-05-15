import './carregarAmbienteRaiz.js';

import jwt from 'jsonwebtoken';

// Script utilitário para gerar um token de teste durante o desenvolvimento.
// Como não temos a criação de usuários finalizada, esse script permite
// contornar a autenticação de forma segura gerando um token válido com as Roles necessárias.

const segredoJwt = process.env.JWT_SECRET;

if (!segredoJwt) {
    console.error(
        'JWT_SECRET nao encontrada. Defina no arquivo .env na raiz do repositorio (ao lado de package.json).'
    );
    process.exit(1);
}

const token = jwt.sign(
    {
        id: 'dev-user-id',
        role: 'ADMIN' // Altere para a Role que deseja testar
    },
    segredoJwt,
    { expiresIn: '7d' }
);

console.log('\n--- SEU TOKEN DE TESTE ---');
console.log('Bearer ' + token);
console.log('--------------------------\n');
