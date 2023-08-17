import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { BaseDto } from './base.dto';
import { CollectibleDto } from './collectible.dto';
import { RaffleDto } from './raffle.dto';

@Entity({ tableName: 'collectibles_raffles' })
export class CollectibleRaffleDto extends BaseDto {
    @PrimaryKey()
    id: string = uuidv4();

    @ManyToOne(() => CollectibleDto, {
        joinColumn: 'collectibleId',
        onDelete: 'cascade'
    })
    collectibleId?: CollectibleDto;

    @ManyToOne(() => RaffleDto, {
        joinColumn: 'raffleId',
        onDelete: 'cascade'
    })
    raffleId?: RaffleDto;

    @Property({ nullable: true })
    score: number;
}
