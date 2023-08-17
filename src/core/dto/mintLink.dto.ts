import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { BaseDto } from './base.dto';
import { CollectibleDto } from './collectible.dto';

@Unique({ properties: ['qrHash', 'collectible'] })
@Entity({ tableName: 'mint_links' })
export class MintLinkDto extends BaseDto {
    @PrimaryKey({ onCreate: () => uuidv4() })
    id: string;

    @Property()
    qrHash: string;

    @Property()
    claimed: boolean;

    @Property({ nullable: true })
    beneficiary?: string;

    @ManyToOne(() => CollectibleDto, {
        joinColumn: 'collectibleId',
        onDelete: 'cascade'
    })
    collectible: CollectibleDto;
}
