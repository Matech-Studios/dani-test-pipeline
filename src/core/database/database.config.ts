import * as dotenv from 'dotenv';
import { Options } from '@mikro-orm/core';

dotenv.config();

export const databaseConfig: {
    development: Options;
    test: Options;
    production: Options;
} = {
    development: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT)
    },
    test: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT)
    },
    production: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME,
        host: process.env.DB_HOST
    }
};
