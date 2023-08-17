import { Property, Entity, PrimaryKey, ManyToOne } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { UserDto } from 'src/core/dto/user.dto';

@Entity({ tableName: 'companies' })
export class CompanyDto {
    @PrimaryKey()
    id: string = uuidv4();

    @Property()
    name: string;

    @ManyToOne(() => UserDto, { joinColumn: 'createdBy', onDelete: 'set null', nullable: true })
    createdBy?: string;

    @ManyToOne(() => UserDto, { joinColumn: 'updatedBy', onDelete: 'set null', nullable: true })
    updatedBy?: string;

    @Property({ onCreate: () => Date.now(), hidden: true })
    createdAt: number;

    @Property({ onUpdate: () => Date.now(), hidden: true, nullable: true })
    updatedAt?: number;
}
