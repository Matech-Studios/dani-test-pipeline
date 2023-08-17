import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator';

export class CreateRafflePrizeRequest {
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    order: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    details: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsString()
    quantity: number;

    @ApiProperty()
    @IsString()
    showOrder: string;
}

export class UpsertRaffleRequest {
    @ApiProperty({ nullable: true })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    key: number;

    @ApiProperty({ type: Boolean })
    @IsNotEmpty()
    @IsBoolean()
    useWeight: boolean;

    @ApiProperty({ type: [CreateRafflePrizeRequest], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested()
    @Type(() => CreateRafflePrizeRequest)
    prizes: CreateRafflePrizeRequest[];
}

export class UpsertRafflesRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    eventId: string;

    @ApiProperty({ type: [UpsertRaffleRequest] })
    @IsArray()
    @ArrayMinSize(0)
    @ValidateNested()
    @Type(() => UpsertRaffleRequest)
    raffles: UpsertRaffleRequest[];
}
