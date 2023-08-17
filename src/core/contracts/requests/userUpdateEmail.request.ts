import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserUpdateEmailRequest {
    @ApiProperty({ type: 'string', format: 'email' })
    @IsEmail()
    @IsNotEmpty()
    newEmail: string;
}
