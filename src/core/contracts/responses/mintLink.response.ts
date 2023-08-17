import { ApiProperty } from '@nestjs/swagger';

export class MintLinkResponse {
    @ApiProperty({ type: Boolean })
    success: boolean;

    @ApiProperty()
    error?: any;
}
