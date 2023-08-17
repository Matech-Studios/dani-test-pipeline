import { Migration } from '@mikro-orm/migrations';

export class Migration20230315171759 extends Migration {
    async up(): Promise<void> {
        this.addSql(`
            ALTER TABLE IF EXISTS "raffles"
                DROP CONSTRAINT "raffle_unique_name";

            ALTER TABLE IF EXISTS "raffle_prizes"
                DROP CONSTRAINT "raffle_prizes_unique_name";`);
    }

    async down(): Promise<void> {
        this.addSql(`
            ALTER TABLE IF EXISTS "raffle_prizes"
                ADD CONSTRAINT raffle_prizes_unique_name UNIQUE ("details", "raffleId");
            
            ALTER TABLE IF EXISTS "raffles"
                ADD CONSTRAINT "raffle_unique_name" UNIQUE ("name", "eventId");`);
    }
}
