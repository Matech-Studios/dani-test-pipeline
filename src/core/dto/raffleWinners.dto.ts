import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { BaseDto } from 'src/core/dto/base.dto';
import { RaffleDto } from 'src/core/dto/raffle.dto';
import { v4 as uuidv4 } from 'uuid';
import { RafflesParticipantsDto } from './rafflesParticipants.dto';

@Entity({ tableName: 'raffles_winners' })
export class RaffleWinnersDto extends BaseDto {
    @PrimaryKey()
    id: string = uuidv4();

    @Property()
    beneficiary: string;

    @Property()
    order?: number;

    @ManyToOne(() => RaffleDto, {
        joinColumn: 'raffleId',
        onDelete: 'cascade'
    })
    raffle: RaffleDto;

    @ManyToOne(() => RafflesParticipantsDto, {
        joinColumn: 'raffleParticipantId',
        onDelete: 'no action'
    })
    raffleParticipant?: RafflesParticipantsDto;
}
