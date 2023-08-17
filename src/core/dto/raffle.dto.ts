import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { BaseDto } from 'src/core/dto/base.dto';
import { EventDto } from 'src/core/dto/event.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrizeDto } from './prize.dto';
import { RaffleWinnersDto } from './raffleWinners.dto';

@Entity({ tableName: 'raffles' })
export class RaffleDto extends BaseDto {
    @PrimaryKey()
    id: string = uuidv4();

    @Property()
    name: string;

    @Property()
    useWeight: boolean;

    @Property()
    key: number;

    @ManyToOne(() => EventDto, {
        joinColumn: 'eventId',
        onDelete: 'cascade'
    })
    event?: EventDto;

    @OneToMany(() => PrizeDto, prize => prize.raffle)
    prizes? = new Collection<PrizeDto>(this);

    @Property()
    status?: string;

    @OneToMany(() => RaffleWinnersDto, rw => rw.raffle)
    winners? = new Collection<RaffleWinnersDto>(this);
}
