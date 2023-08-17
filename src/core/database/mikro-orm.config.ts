import * as dotenv from 'dotenv';
import { EntityCaseNamingStrategy, Options } from '@mikro-orm/core';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { databaseConfig } from 'src/core/database';

dotenv.config();

let dbConfig: Options;
switch (process.env.NODE_ENV) {
    case 'development':
        dbConfig = databaseConfig.development;
        break;
    case 'test':
        dbConfig = databaseConfig.test;
        break;
    case 'production':
        dbConfig = databaseConfig.production;
        break;
    default:
        dbConfig = databaseConfig.development;
}

export const MikroOrmconfig = {
    entities: ['dist/**/*.dto.js'],
    entitiesTs: ['src/**/*.dto.ts'],
    ...dbConfig,
    type: 'postgresql',
    highlighter: new SqlHighlighter(),
    debug: ['info', 'schema'],
    metadataProvider: TsMorphMetadataProvider,
    namingStrategy: EntityCaseNamingStrategy,
    migrations: {
        tableName: 'migrations', // name of database table with log of executed transactions
        path: './src/core/database/migrations', // path to the folder with migrations
        pattern: /^[\w-]+\d+\.ts$/, // regex pattern for the migration files
        transactional: true, // wrap each migration in a transaction
        disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
        allOrNothing: true, // wrap all migrations in master transaction
        dropTables: true, // allow to disable table dropping
        safe: false, // allow to disable table and column dropping
        emit: 'ts' // migration generation mode
    },
    seeder: {
        path: './src/core/database/seeders', // path to the folder with seeders
        pathTs: undefined, // path to the folder with TS seeders (if used, we should put path to compiled files in `path`)
        defaultSeeder: 'DatabaseSeeder', // default seeder class name
        glob: '!(*.d).{js,ts}', // how to match seeder files (all .js and .ts files, but not .d.ts)
        emit: 'ts', // seeder generation mode
        fileName: (className: string) => className // seeder file naming convention
    }
} as Options;

export default MikroOrmconfig;
