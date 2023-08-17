import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { EventDto } from './event.dto';

@Entity({ tableName: 'raffles_participants' })
@Unique({ properties: ['beneficiary', 'event'] })
export class RafflesParticipantsDto {
    @PrimaryKey()
    @Unique()
    id: string = uuidv4();

    @Property()
    ticketNumber: number;

    @Property()
    beneficiary: string;

    @ManyToOne(() => EventDto, {
        joinColumn: 'eventId',
        onDelete: 'no action'
    })
    event: EventDto;

    @Property({
        onCreate: () => Date.now(),
        type: 'bigint',
        hidden: true
    })
    createdAt: number;
}
