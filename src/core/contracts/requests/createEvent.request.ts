import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    ValidateIf
} from 'class-validator';
import {
    IsMultiDay,
    IsVirtual
} from 'src/core/contracts/requests/validations/eventRequest.validation';

export class CreateEventRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ maximum: 255 })
    @Length(0, 255)
    @IsString()
    description: string;

    @ApiProperty()
    @IsVirtual('virtual')
    city: string | null;

    @ApiProperty()
    @IsVirtual('virtual')
    country: string | null;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    startDate: number;

    @ApiProperty({ type: Number })
    @ValidateIf((object, value) => value !== null)
    @IsNumber({}, { message: 'endDate must be numeric or null' })
    endDate: number | null;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    @IsMultiDay(['endDate', 'startDate'])
    multiDay: boolean;

    @ApiProperty({ type: Boolean })
    @IsBoolean()
    @IsNotEmpty()
    virtual: boolean;

    @ApiProperty({ type: Number })
    @IsOptional()
    @IsNumber()
    poapsQuantity: number;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    attendees: number;
}
