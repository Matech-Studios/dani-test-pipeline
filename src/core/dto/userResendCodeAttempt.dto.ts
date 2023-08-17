import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { IsNotEmpty } from 'class-validator';
import { UserDto } from 'src/core/dto/user.dto';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'user_resend_code_attempts' })
@Unique({ properties: ['userId', 'type'] })
export class UserResendCodeAttemptDto {
    @PrimaryKey()
    id: string = uuidv4();

    @ManyToOne(() => UserDto, {
        joinColumn: 'userId',
        onDelete: 'cascade'
    })
    userId: string;

    @Property({ length: 50 })
    @IsNotEmpty()
    type: string;

    @Property({ onCreate: () => Date.now(), type: 'bigint' })
    timestamp: number;

    @Property({ onCreate: () => Date.now(), type: 'bigint', hidden: true })
    createdAt: number;

    @Property({
        onUpdate: () => Date.now(),
        type: 'bigint',
        nullable: true,
        hidden: true
    })
    updatedAt?: number;
}
