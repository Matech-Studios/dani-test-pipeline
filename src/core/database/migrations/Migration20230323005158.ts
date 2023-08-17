import { Migration } from '@mikro-orm/migrations';

export class Migration20230323005158 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table "raffles_winners" ("id" varchar(255) not null, "order" int not null, "beneficiaries" varchar(255) not null, "raffleId" varchar(255) not null, "createdBy" varchar(255) not null, "updatedBy" varchar(255) null, "createdAt" bigint not null, "updatedAt" bigint null,  constraint "raffles_winners_pkey" primary key ("id"));'
        );

        this.addSql(
            'alter table "raffles_winners" add constraint "raffles_winners_createdBy_foreign" foreign key ("createdBy") references "users" ("id") on update cascade on delete set null;'
        );
        this.addSql(
            'alter table "raffles_winners" add constraint "raffles_winners_updatedBy_foreign" foreign key ("updatedBy") references "users" ("id") on update cascade on delete set null;'
        );
        this.addSql(
            'alter table "raffles_winners" add constraint "raffles_winners_raffleId_foreign" foreign key ("raffleId") references "raffles" ("id") on update cascade on delete cascade;'
        );
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "raffles_winners" cascade;');
    }
}
