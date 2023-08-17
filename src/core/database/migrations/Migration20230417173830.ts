import { Migration } from '@mikro-orm/migrations';

export class Migration20230417173830 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "raffles_winners" add column "raffleParticipantId" varchar(255) null;');
    this.addSql('alter table "raffles_winners" add constraint "raffles_winners_raffleParticipantId_foreign" foreign key ("raffleParticipantId") references "raffles_participants" ("id") on update cascade on delete no action;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "raffles_winners" drop constraint "raffles_winners_raffleParticipantId_foreign";');

    this.addSql('alter table "raffles_winners" drop column "raffleParticipantId";');
  }

}
