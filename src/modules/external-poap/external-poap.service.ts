import { EntityManager } from '@mikro-orm/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import axios from 'axios';
import FormData from 'form-data';
import { JwtPayload } from 'jsonwebtoken';
import mime from 'mime-types';
import { now } from 'moment';
import path from 'path';
import { ExternalPoapRequest } from 'src/core/contracts';
import {
    ExternalClaimResponse,
    ExternalMintLinkRootResponse,
    ExternalPoapResponse
} from 'src/core/contracts/responses';
import { PoapSettingsDto } from 'src/core/dto/poapSettings.dto';
import { CustomLogger, isEmail } from 'src/core/utils';
import { S3ManagerService } from '../s3';

@Injectable()
export class ExternalPoapService {
    private readonly poapBaseUrl = 'https://api.poap.tech';
    private readonly poapAuthUrl = 'https://poapauth.auth0.com/oauth/token';

    constructor(
        private readonly s3Service: S3ManagerService,
        private logger: CustomLogger,
        private readonly em: EntityManager
    ) {}

    public async submit(externalPoapEntity: ExternalPoapRequest): Promise<ExternalPoapResponse> {
        try {
            const { AWS_BUCKET, POAP_API_TOKEN, NODE_ENV } = process.env;
            const fileKey = externalPoapEntity.image;
            const image: S3.GetObjectOutput = await this.s3Service.getFile(fileKey, AWS_BUCKET);
            const fileName = path.basename(fileKey);
            const contentType = mime.contentType(fileName) as string;

            const form = new FormData();

            const bufferImage = image.Body as Buffer;

            form.append('image', bufferImage, {
                filename: fileName,
                contentType: contentType
            });

            form.append('virtual_event', externalPoapEntity.virtualEvent.toString());
            form.append('event_template_id', externalPoapEntity.eventTemplateId);
            form.append('description', externalPoapEntity.description);
            form.append('city', externalPoapEntity.city ?? '');
            form.append('country', externalPoapEntity.country ?? '');
            form.append('start_date', externalPoapEntity.startDate);
            form.append('end_date', externalPoapEntity.endDate);
            form.append('expiry_date', externalPoapEntity.expiryDate);
            form.append('event_url', externalPoapEntity.eventUrl);
            form.append('secret_code', externalPoapEntity.secretCode.toString());
            form.append('email', externalPoapEntity.email);

            if (NODE_ENV === 'production') {
                form.append('private_event', externalPoapEntity.privateEvent.toString());
                form.append('requested_codes', externalPoapEntity.requestedCodes.toString());
                form.append('name', externalPoapEntity.name);
            } else {
                form.append('private_event', 'true');
                form.append('requested_codes', '5');
                form.append('name', `test-${externalPoapEntity.name}-${Date.now()}`);
            }

            const response = await axios.post('/events', form, {
                baseURL: this.poapBaseUrl,
                headers: {
                    ...form.getHeaders(),
                    'x-api-key': POAP_API_TOKEN,
                    accept: 'application/json',
                    'content-type': 'multipart/form-data'
                }
            });

            return {
                success: response.status === 200,
                poapId: response.data?.id,
                secretCode: externalPoapEntity.secretCode
            };
        } catch (error) {
            this.logger.error(`Error submitting POAP: ${error}`, ExternalPoapService.name);

            const errorMessage = error.response?.data?.message ?? error.message;
            if (errorMessage) {
                this.logger.error(errorMessage, ExternalPoapService.name);
            }

            return {
                success: false,
                error: errorMessage || error
            };
        }
    }

    public async getMintLinks(
        poapId: number,
        secretCode: number
    ): Promise<ExternalMintLinkRootResponse> {
        if (!poapId || !secretCode) {
            throw new BadRequestException('Invalid POAP id or secret code');
        }

        const { POAP_API_TOKEN } = process.env;
        const token = await this.getApiToken();

        try {
            const response = await axios.post(
                `/event/${poapId}/qr-codes`,
                {
                    secret_code: secretCode
                },
                {
                    baseURL: this.poapBaseUrl,
                    headers: {
                        'x-api-key': POAP_API_TOKEN,
                        authorization: `Bearer ${token}`,
                        accept: 'application/json',
                        'content-type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                return {
                    success: true,
                    externalMintLinResponse: response.data
                };
            } else {
                return {
                    success: true,
                    error: response.data.message
                };
            }
        } catch (error) {
            this.logger.error(`Error submitting POAP: ${error}`, ExternalPoapService.name);

            const errorMessage = error.response?.data?.Message;
            if (errorMessage) {
                this.logger.error(errorMessage, ExternalPoapService.name);
            }

            return {
                success: false,
                error: errorMessage || error
            };
        }
    }

    public async claimPoapOnBehalfOfAttendee(
        qrHash: string,
        beneficiary: string
    ): Promise<ExternalClaimResponse> {
        if (!qrHash) {
            return {
                success: false,
                error: 'Invalid qrHash'
            };
        }

        const { POAP_API_TOKEN } = process.env;
        const token = await this.getApiToken();

        try {
            /**
             * 1st part of the workflow:
             * verify if the POAP is availble
             */

            const claimInfoResponse = await axios.get(`/actions/claim-qr?qr_hash=${qrHash}`, {
                baseURL: this.poapBaseUrl,
                headers: {
                    'x-api-key': POAP_API_TOKEN,
                    authorization: `Bearer ${token}`,
                    accept: 'application/json',
                    'content-type': 'application/json'
                }
            });

            if (claimInfoResponse.status === 200) {
                if (claimInfoResponse.data.claimed == true) {
                    return {
                        success: false,
                        error: 'Mint link taken',
                        beneficiary: claimInfoResponse.data.beneficiary
                    };
                }

                /**
                 * 2nd part of the workflow:
                 * claim POAP
                 */
                const sendEmail = isEmail(beneficiary);
                const mintClaimResponse = await axios.post(
                    `/actions/claim-qr`,
                    {
                        address: beneficiary,
                        qr_hash: qrHash,
                        secret: claimInfoResponse.data.secret,
                        sendEmail
                    },
                    {
                        baseURL: this.poapBaseUrl,
                        headers: {
                            'x-api-key': POAP_API_TOKEN,
                            authorization: `Bearer ${token}`,
                            accept: 'application/json',
                            'content-type': 'application/json'
                        }
                    }
                );

                if (mintClaimResponse.status === 200) {
                    return {
                        success: true
                    };
                }
            } else {
                return {
                    success: false,
                    beneficiary: claimInfoResponse.data.beneficiary,
                    error: claimInfoResponse.data.message
                };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.Message || error.response?.data?.message;

            if (errorMessage) {
                this.logger.error(errorMessage, ExternalPoapService.name);
            }

            return {
                success: false,
                error: errorMessage || error
            };
        }
    }

    private async getApiToken(): Promise<string> {
        const poapSettingsDto = await this.em.findOne(PoapSettingsDto, {
            name: 'API_TOKEN'
        });

        if (!this.apiTokenExpired(poapSettingsDto?.value)) {
            this.logger.log(
                `Valid POAP access token found, will not request a new one.`,
                ExternalPoapService.name
            );

            return poapSettingsDto.value;
        }

        const { POAP_AUDIENCE, POAP_CLIENT_ID, POAP_CLIENT_SECRET } = process.env;

        this.logger.log(`Requesting new POAP access token.`, ExternalPoapService.name);

        try {
            const response = await axios.post(
                this.poapAuthUrl,
                {
                    audience: POAP_AUDIENCE,
                    grant_type: 'client_credentials',
                    client_id: POAP_CLIENT_ID,
                    client_secret: POAP_CLIENT_SECRET
                },
                {
                    headers: {
                        'content-type': 'application/json'
                    }
                }
            );

            if (!poapSettingsDto?.id) {
                const poapSetting = this.em.create(PoapSettingsDto, {
                    name: 'API_TOKEN',
                    value: response.data?.access_token
                });

                this.em.persist(poapSetting);
            } else {
                poapSettingsDto.value = response.data?.access_token;
            }

            await this.em.flush();

            this.logger.log(`POAP access token requested successfully.`, ExternalPoapService.name);

            return response.data?.access_token;
        } catch (error) {
            this.logger.error(
                `Error generating POAP access token: ${error}`,
                ExternalPoapService.name
            );

            return '';
        }
    }

    private apiTokenExpired(jwtToken: string): boolean {
        if (!jwtToken) {
            return true;
        }

        try {
            const base64Payload = jwtToken.split('.')[1];
            const payloadBuffer = Buffer.from(base64Payload, 'base64');
            const updatedJwtPayload: JwtPayload = JSON.parse(
                payloadBuffer.toString()
            ) as JwtPayload;

            // We "force" the token to expire 1 hour before
            const hourInSeconds = 3600;
            const expires = updatedJwtPayload.exp - hourInSeconds;

            const nowMoment = now() / 1000;
            return nowMoment > expires;
        } catch (error) {
            this.logger.error(`Error decoding access token: ${error}`, ExternalPoapService.name);

            return true;
        }
    }
}
