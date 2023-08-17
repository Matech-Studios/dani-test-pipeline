import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { BaseDto } from 'src/core/dto/base.dto';
import { RaffleDto } from 'src/core/dto/raffle.dto';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'raffle_prizes' })
export class PrizeDto extends BaseDto {
    @PrimaryKey()
    id: string = uuidv4();

    @Property({ nullable: false })
    order: number;

    @Property()
    details: string;

    @Property()
    quantity: number;

    @ManyToOne(() => RaffleDto, {
        joinColumn: 'raffleId',
        onDelete: 'cascade',
        hidden: true
    })
    raffle: RaffleDto;
}
