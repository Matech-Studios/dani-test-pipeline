import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CollectibleImage {
    @ApiProperty()
    @IsString()
    mimetype: string;

    @ApiProperty()
    @IsString()
    fieldname: string;

    @ApiProperty()
    buffer: ArrayBufferLike;
}
