import { Migration } from '@mikro-orm/migrations';

export class Migration20230403201726 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table "raffles_participants" ("id" varchar(255) not null, "ticketNumber" int not null, "beneficiary" varchar(255) not null, "eventId" varchar(255) not null, "createdAt" bigint not null, constraint "raffles_participants_pkey" primary key ("id"));'
        );
        this.addSql(
            'alter table "raffles_participants" add constraint "raffles_participants_beneficiary_eventId_unique" unique ("beneficiary", "eventId");'
        );

        this.addSql(
            'alter table "raffles_participants" add constraint "raffles_participants_eventId_foreign" foreign key ("eventId") references "events" ("id") on update cascade on delete no action;'
        );
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "raffles_participants" cascade;');
    }
}
