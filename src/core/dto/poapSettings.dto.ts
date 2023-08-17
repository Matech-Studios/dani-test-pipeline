import { Property, Entity, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { BaseDto } from './base.dto';
import { v4 as uuidv4 } from 'uuid';
import { UserDto } from './user.dto';

@Entity({ tableName: 'poap_settings' })
export class PoapSettingsDto extends BaseDto {
    @PrimaryKey()
    id: string = uuidv4();

    @Property()
    name: string;

    @Property({ length: 5000 })
    value: string;

    @ManyToOne(() => UserDto, {
        joinColumn: 'createdBy',
        nullable: true,
        onDelete: 'set null'
    })
    createdBy: string;

    @ManyToOne(() => UserDto, {
        joinColumn: 'updatedBy',
        nullable: true,
        onDelete: 'set null'
    })
    updatedBy?: string;

    @Property({
        onCreate: () => Date.now(),
        type: 'bigint',
        hidden: true
    })
    createdAt: number;

    @Property({
        onUpdate: () => Date.now(),
        type: 'bigint',
        nullable: true,
        hidden: true
    })
    updatedAt?: number;
}
