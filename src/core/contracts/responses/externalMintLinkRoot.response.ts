import { ExternalMintLinkResponse } from './externalMintLink.response';

export class ExternalMintLinkRootResponse {
    success: boolean;
    error?: any;
    externalMintLinResponse?: ExternalMintLinkResponse[];
}
