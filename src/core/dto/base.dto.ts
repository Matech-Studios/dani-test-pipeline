import { ManyToOne, Property } from '@mikro-orm/core';
import { UserDto } from './user.dto';

export class BaseDto {
    @ManyToOne(() => UserDto, { joinColumn: 'createdBy', onDelete: 'set null' })
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
