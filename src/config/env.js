import dotenv from 'dotenv/config';

const env = {
    PORT: process.env.PORT || 3000,
    DATABASE_URL: process.env.DATABASE_URL,
    DB_HOST: process.env.DB_HOST,
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN
}

if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

export default env;