import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { CollectibleDto } from 'src/core/dto/collectible.dto';
import { v4 as uuidv4 } from 'uuid';
import { BaseDto } from './base.dto';
import { CompanyDto } from './company.dto';
import { RaffleDto } from './raffle.dto';

@Entity({ tableName: 'events' })
export class EventDto extends BaseDto {
    @PrimaryKey()
    id: string = uuidv4();

    @Property()
    name: string;

    @Property()
    description: string;

    @Property({ nullable: true })
    city?: string;

    @Property({ nullable: true })
    country?: string;

    @Property({ type: 'bigint' })
    startDate: number;

    @Property({ type: 'bigint', nullable: true })
    endDate?: number;

    @Property()
    multiDay: boolean;

    @Property()
    virtual: boolean;

    @Property({ nullable: true })
    poapsQuantity?: number;

    @ManyToOne(() => CompanyDto, {
        joinColumn: 'companyId',
        onDelete: 'set null',
        hidden: true
    })
    companyId?: string;

    @OneToMany(() => CollectibleDto, collectible => collectible.event)
    collectibles? = new Collection<CollectibleDto>(this);

    @OneToMany(() => RaffleDto, raffle => raffle.event)
    raffles? = new Collection<RaffleDto>(this);

    @Property()
    attendees: number;
}
