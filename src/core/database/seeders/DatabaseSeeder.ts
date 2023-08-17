import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

export class DatabaseSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        //Example how to use it
        // em.create(EntityDto, {
        //     column1: 'data',
        //     column2: 'data'
        // });
    }
}
