import { EntityManager } from '@mikro-orm/core';
import { HttpStatus, Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { resendCodeIntervalMinutes } from 'src/core/constants';
import { UserResponse, UserUpdateEmailRequest } from 'src/core/contracts';
import { UserResendCodeAttemptDto } from 'src/core/dto';
import { UserDto } from 'src/core/dto/user.dto';
import { CreateUserEntity, UserEntity, UserUpdateEmailEntity } from 'src/core/entities';
import { throwCustomError } from 'src/core/utils';

@Injectable()
export class UsersService {
    constructor(private readonly em: EntityManager) {}

    public async create(createUserEntity: CreateUserEntity): Promise<UserEntity> {
        try {
            const userDto: UserDto = this.em.create(UserDto, createUserEntity);

            await this.em.persistAndFlush(userDto);

            const user: UserEntity = userDto;

            return user;
        } catch (error) {
            throwCustomError(error, `${UsersService.name} - create`);
        }
    }

    public async updateEmail(userUpdateEmailRequest: UserUpdateEmailEntity): Promise<void> {
        try {
            const newEmail = userUpdateEmailRequest.newEmail;

            const i18n = I18nContext.current();

            await this.checkIfNewEmailExists(newEmail);

            const dbUser = await this.findOneByEmail(userUpdateEmailRequest.email);
            if (newEmail == dbUser.email)
                throw Error(i18n.t('UserServiceErrors.updateEmailMatchPrevious'), {
                    cause: HttpStatus.NOT_MODIFIED
                });
            dbUser.email = newEmail;
            await this.em.persistAndFlush(dbUser);
        } catch (error) {
            throwCustomError(error, `${UsersService.name} - updateEmail on DB`);
        }
    }

    public async findOneByEmail(email: string): Promise<UserEntity> {
        try {
            const userDto: UserDto = await this.em.findOne(UserDto, { email }, { populate: true });

            if (!userDto) {
                throw new Error(`Incorrect username or password: ${email}`, {
                    cause: HttpStatus.NOT_FOUND
                });
            }

            return userDto;
        } catch (error) {
            throwCustomError(error, `${UsersService.name} - findOneByEmail`);
        }
    }

    public async findOneByExternalId(externalUserId: string): Promise<UserResponse> {
        try {
            const i18n = I18nContext.current();

            const user: UserDto = await this.em.findOne(UserDto, {
                externalUserId
            });

            if (!user) {
                throw new Error(i18n.t('OrmErrors.notFound'), {
                    cause: HttpStatus.NOT_FOUND
                });
            }
            return user;
        } catch (error) {
            throwCustomError(error, `${UsersService.name} - findOneByExternalId`);
        }
    }

    public async saveCodeAttempt(email: string, type: string): Promise<number> {
        try {
            const { existingResendCode, user } = await this.getCodeAttemptByEmail(email, type);

            const newTimestamp: number = new Date().getTime();

            if (existingResendCode) {
                existingResendCode.timestamp = newTimestamp;
                await this.em.flush();
            } else {
                const resendCode = new UserResendCodeAttemptDto();
                resendCode.userId = user.id;
                resendCode.type = type;
                resendCode.timestamp = newTimestamp;

                await this.em.persistAndFlush(resendCode);
            }

            return this.calculateRemainingTime(newTimestamp);
        } catch (error) {
            throwCustomError(error, `${UsersService.name} - createResendCodeAttempt`);
        }
    }

    public async getCodeAttemptRemainingTimeByType(email: string, type: string): Promise<number> {
        try {
            const { existingResendCode } = await this.getCodeAttemptByEmail(email, type);

            if (existingResendCode) {
                return this.calculateRemainingTime(existingResendCode.timestamp);
            } else {
                return 0;
            }
        } catch (error) {
            throwCustomError(error, `${UsersService.name} - getResendCodeRemainingTimeByType`);
        }
    }

    private async getCodeAttemptByEmail(email: string, type: string) {
        const user = await this.findOneByEmail(email);

        const existingResendCode = await this.em.findOne(UserResendCodeAttemptDto, {
            userId: user.id,
            type
        });
        return { existingResendCode, user };
    }

    private calculateRemainingTime(timestamp: number): number {
        const elapsedTime = Date.now() - timestamp;
        const remainingTime = Math.max(resendCodeIntervalMinutes * 60 * 1000 - elapsedTime, 0);
        return remainingTime;
    }

    private async checkIfNewEmailExists(newEmail: string) {
        const i18n = I18nContext.current();

        const user = await this.em.findOne(UserDto, {
            email: newEmail
        });

        if (user)
            throw Error(i18n.t('UserServiceErrors.emailAlreadyInUse'), {
                cause: HttpStatus.CONFLICT
            });
    }
}
