import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { accessSync, readFileSync } from 'fs';
import mustache from 'mustache';
import * as admin from 'firebase-admin';
import { UserRecord, getAuth } from 'firebase-admin/auth';
import { CreateUserEntity, UserUpdateEmailEntity } from 'src/core/entities';
import { ExternalAuthService } from 'src/core/interfaces';
import { CustomLogger, throwCustomError } from 'src/core/utils';
import { MailService } from 'src/modules/mail';
import { join } from 'path';

@Injectable()
export class FirebaseService implements ExternalAuthService {
    private firebaseAuth: admin.auth.Auth;

    constructor(
        @Inject(CustomLogger)
        private readonly logger: CustomLogger,
        private readonly mailService: MailService
    ) {
        this.firebaseAuth = admin.auth();
    }

    public async deleteUser(uid: string): Promise<void> {
        try {
            await this.firebaseAuth.deleteUser(uid);
        } catch (error) {
            throwCustomError(error, `${FirebaseService.name} - deleteUser`);
        }
    }

    public async updateEmail(updateEmail: UserUpdateEmailEntity): Promise<void> {
        const { email: externalUserId, newEmail } = updateEmail;
        await this.firebaseAuth
            .updateUser(externalUserId, {
                email: newEmail,
                emailVerified: false
            })
            .catch(error => {
                throwCustomError(error, `${FirebaseService.name} - updateEmail`);
            });
    }

    public async createUser(userEntity: CreateUserEntity, role: string): Promise<string> {
        const result = await getAuth()
            .createUser({
                email: userEntity.email,
                displayName: `${userEntity.name} ${userEntity.lastName}`,
                emailVerified: false,
                password: userEntity.password
            })
            .then(async (userRecord: UserRecord) => {
                await getAuth()
                    .setCustomUserClaims(userRecord.uid, {
                        roles: [role]
                    })
                    .then(() => {
                        this.logger.log(`User role set to: ${role}`);
                    });

                this.logger.log(
                    `Successfully created new user: ${userRecord.uid}`,
                    `${FirebaseService.name} - createUser`
                );

                this.sendVerificationEmailToUser(userRecord);

                return {
                    success: true,
                    uid: userRecord.uid,
                    error: null
                };
            })
            .catch(error => {
                return {
                    success: false,
                    uid: null,
                    error
                };
            });

        if (result.success === false) {
            throwCustomError(result.error, `${FirebaseService.name} - createUser`);
        }

        return result.uid;
    }

    public async sendVerificationEmail(email: string): Promise<boolean> {
        const userData = await this.getUserByEmail(email);

        if (userData.success === false) {
            throwCustomError(userData.error, `${FirebaseService.name} - sendVerificationEmail`);
        }

        if (userData.user.emailVerified) {
            this.logger.warn(`Email '${email}' already verified, skipping.`);
            return true;
        }

        return this.sendVerificationEmailToUser(userData.user);
    }

    public async getUserByEmail(
        email: string
    ): Promise<{ success: boolean; user: UserRecord; error: any }> {
        return await getAuth()
            .getUserByEmail(email)
            .then((userRecord: UserRecord) => {
                return {
                    success: true,
                    user: userRecord,
                    error: null
                };
            })
            .catch(error => {
                return {
                    success: false,
                    user: null,
                    error
                };
            });
    }

    private async sendVerificationEmailToUser(userRecord: UserRecord): Promise<boolean> {
        const emailResult = await getAuth()
            .generateEmailVerificationLink(userRecord.email)
            .then(async link => {
                const filePath = join(
                    process.cwd(),
                    'dist/src/core/emailTemplates/verifyEmail.html'
                );

                try {
                    accessSync(filePath);
                } catch (error) {
                    this.logger.error('Email template does not exist.');

                    return {
                        success: false,
                        error
                    };
                }

                const htmlTemplateContent = readFileSync(filePath, 'utf-8');

                const templateData = {
                    formattedUserFirstName: userRecord.displayName,
                    formattedVerifyLink: link,
                    formattedLogoUrl: process.env.MEMENTO_LOGO_URL
                };

                const htmlFormattedTemplate = mustache.render(htmlTemplateContent, templateData);

                const emailResult = await this.mailService.sendMail({
                    toEmailAddress: userRecord.email,
                    emailSubject: 'Welcome to Memento! Please verify your email address',
                    htmlBody: htmlFormattedTemplate
                });

                return {
                    success: emailResult,
                    error: null
                };
            })
            .catch(error => {
                return {
                    success: false,
                    error
                };
            });

        if (emailResult.success === false) {
            const errorMessage = emailResult.error?.message || emailResult.error;

            if (errorMessage.indexOf('TOO_MANY_ATTEMPTS_TRY_LATER') > -1) {
                throw new BadRequestException('Too many attempts, try later.');
            }

            throwCustomError(
                emailResult.error,
                `${FirebaseService.name} - sendVerificationEmailToUser`
            );
        }

        return emailResult.success;
    }
}
