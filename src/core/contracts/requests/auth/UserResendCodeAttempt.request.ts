import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum ResendCodeType {
    ResetPassword = 'ResetPassword',
    VerificationEmail = 'EmailVerification'
}

export class UserResendCodeAttemptRequest {
    @ApiProperty()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ enum: ResendCodeType })
    @IsNotEmpty()
    @IsEnum(ResendCodeType)
    type: ResendCodeType;
}
