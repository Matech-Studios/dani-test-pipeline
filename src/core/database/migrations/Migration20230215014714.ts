import { Migration } from '@mikro-orm/migrations';

export class Migration20230215014714 extends Migration {

    async up(): Promise<void> {
        this.addSql('create table "collectibles" ("id" varchar(255) not null, "name" varchar(140) not null, "description" varchar(500) not null, "website" varchar(255) null, "attendees" int not null, "eventId" varchar(255) not null, "createdBy" varchar(255) not null, "updatedBy" varchar(255) null, "createdAt" bigint null, "updatedAt" bigint null, constraint "collectibles_pkey" primary key ("id"));');
        this.addSql('ALTER TABLE "collectibles" ADD CONSTRAINT collectibles_unique_name UNIQUE ("name");');
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "collectibles" cascade;');
    }
}
