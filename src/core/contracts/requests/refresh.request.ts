import { IsNotEmpty } from 'class-validator';

export class RefreshTokenRequest {
    @IsNotEmpty()
    accessToken: string;
}
