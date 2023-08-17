import {
    Collection,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryKey,
    Property,
    Unique
} from '@mikro-orm/core';
import { IsEmail, IsEmpty, IsNotEmpty } from 'class-validator';
import { CompanyDto } from 'src/core/dto/company.dto';
import { UserResendCodeAttemptDto } from 'src/core/dto/userResendCodeAttempt.dto';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'users' })
export class UserDto {
    @PrimaryKey()
    id: string = uuidv4();

    @Property()
    @Unique()
    externalUserId: string;

    @IsEmpty()
    @Property()
    name: string;

    @IsNotEmpty()
    @Property()
    lastName: string;

    @Property()
    @Unique()
    @IsEmail()
    email: string;

    @OneToOne(() => CompanyDto, {
        joinColumn: 'companyId',
        onDelete: 'set null'
    })
    company: CompanyDto;

    @Property({ onCreate: () => Date.now(), hidden: true })
    createdAt: number;

    @Property({ onUpdate: () => Date.now(), hidden: true })
    updatedAt?: number;

    @OneToMany(
        () => UserResendCodeAttemptDto,
        userResendCodeAttempts => userResendCodeAttempts.userId
    )
    userResendCodeAttempts = new Collection<UserResendCodeAttemptDto>(this);
}
