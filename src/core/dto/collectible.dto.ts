import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { IsNumber, IsOptional } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { BaseDto } from './base.dto';
import { EventDto } from './event.dto';
import { MintLinkDto } from './mintLink.dto';
import { QuestionnaireQuestionDto } from './questionnaireQuestion.dto';

@Entity({ tableName: 'collectibles' })
export class CollectibleDto extends BaseDto {
    @PrimaryKey()
    id: string = uuidv4();

    @Property()
    name: string;

    @Property()
    description?: string;

    @Property({ nullable: true })
    website?: string;

    @Property({ nullable: true })
    image?: string;

    @Property({ persist: false })
    get fullImagePath() {
        return `${process.env.AWS_BASE_URL}${this.image}`;
    }

    @Property()
    attendees?: number;

    @Property()
    @IsNumber()
    @IsOptional()
    externalPoapId?: number;

    @Property({ hidden: true })
    @IsNumber()
    @IsOptional()
    secretCode?: number;

    @Property({ hidden: true, onCreate: () => 'Pending' })
    poapStatus?: 'Pending' | 'Submitted' | 'Approved';

    @ManyToOne(() => EventDto, {
        joinColumn: 'eventId',
        onDelete: 'cascade'
    })
    event?: EventDto;

    @OneToMany(() => QuestionnaireQuestionDto, question => question.collectible)
    questions? = new Collection<QuestionnaireQuestionDto>(this);

    @OneToMany(() => MintLinkDto, mintLink => mintLink.collectible)
    mintLinks? = new Collection<MintLinkDto>(this);
}
