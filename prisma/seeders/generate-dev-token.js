import './carregarAmbienteRaiz.js';

import jwt from 'jsonwebtoken';

import env from '../../src/config/env.js';

if (env.NODE_ENV === 'production') {
    console.error('Este script não pode ser executado em produção.');
    process.exit(1);
}

const token = jwt.sign(
    {
        id: 'dev-user-id',
        role: 'ADMIN',
        email: 'dev@rhsystem.local'
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
);

console.log('\n--- SEU TOKEN DE TESTE (somente desenvolvimento) ---');
console.log('Bearer ' + token);
console.log('----------------------------------------------------\n');
