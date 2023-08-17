import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignInRequest {
    @ApiProperty({ type: 'string', format: 'email' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ minimum: 8 })
    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password: string;
}
