import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Script utilitário para gerar um token de teste durante o desenvolvimento.
// Como não temos a criação de usuários finalizada, esse script permite
// contornar a autenticação de forma segura gerando um token válido com as Roles necessárias.

const token = jwt.sign(
    { 
        id: 'dev-user-id', 
        role: 'ADMIN' // Altere para a Role que deseja testar
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
);

console.log('\n--- SEU TOKEN DE TESTE ---');
console.log('Bearer ' + token);
console.log('--------------------------\n');
