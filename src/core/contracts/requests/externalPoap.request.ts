import {
    IsBoolean,
    IsDate,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsString,
    IsUrl,
    MaxLength,
    ValidateIf
} from 'class-validator';

export class ExternalPoapRequest {
    @IsNotEmpty()
    name: string;

    @MaxLength(1500)
    @IsNotEmpty()
    description: string;

    @ValidateIf(o => o.virtualEvent === false)
    @MaxLength(256)
    @IsNotEmpty()
    @IsString()
    city?: string;

    @ValidateIf(o => o.virtualEvent === false)
    @MaxLength(256)
    @IsNotEmpty()
    @IsString()
    country?: string;

    @IsNotEmpty()
    @IsDate({ message: 'Expected format: YYYY-MM-DD' })
    startDate: string;

    @IsNotEmpty()
    @IsDate({ message: 'Expected format: YYYY-MM-DD' })
    endDate: string;

    @IsNotEmpty()
    @IsBoolean()
    virtualEvent: boolean;

    @IsNotEmpty()
    @IsNumber()
    eventTemplateId: number;

    @IsNotEmpty()
    @IsBoolean()
    privateEvent: boolean;

    @IsNotEmpty()
    image: string;

    @IsDate({ message: 'Expected format: YYYY-MM-DD' })
    @IsNotEmpty()
    expiryDate: string;

    @IsUrl()
    @IsNotEmpty()
    eventUrl: string;

    @IsNumber()
    @IsNotEmpty()
    secretCode: number;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNumber()
    @IsNotEmpty()
    requestedCodes: number;
}
