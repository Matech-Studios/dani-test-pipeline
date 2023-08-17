import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { CollectibleDto } from './collectible.dto';

@Entity({ tableName: 'questionnaire_responses' })
export class QuestionnaireAttendeeResponseDto {
    @PrimaryKey()
    id: string = uuidv4();

    @Property()
    beneficiary: string;

    @Property()
    question: string;

    @Property({ length: 1100 })
    answer: string;

    @Property({ onCreate: () => Date.now(), type: 'bigint', hidden: true })
    createdAt: number;

    @ManyToOne({
        joinColumn: 'collectibleId',
        onDelete: 'cascade',
        hidden: true
    })
    collectible: CollectibleDto;
}
