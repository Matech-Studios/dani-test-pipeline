import { Inject, Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { ERROR_CODES } from 'src/core/constants';
import { CreateUserEntity, UserEntity, UserUpdateEmailEntity } from 'src/core/entities';
import { ExternalAuthService } from 'src/core/interfaces';
import { throwCustomError } from 'src/core/utils';
import { CompanyService } from 'src/modules/companies';
import { UsersService } from 'src/modules/users';

@Injectable()
export class AuthService {
    constructor(
        @Inject('ExternalAuthService')
        private externalAuthService: ExternalAuthService,
        private companyService: CompanyService,
        private userService: UsersService
    ) {}

    public async signUp(userEntity: CreateUserEntity): Promise<void> {
        try {
            const userRole = 'User';

            const externalUserId = await this.externalAuthService.createUser(userEntity, userRole);

            await this.createDataBaseUser({
                ...userEntity,
                externalUserId: externalUserId
            });
        } catch (error) {
            throwCustomError(error, `${AuthService.name} - signUp`);
        }
    }

    public async updateEmail(userUpdateEmail: UserUpdateEmailEntity) {
        try {
            await this.userService.updateEmail(userUpdateEmail);
            await this.externalAuthService.updateEmail(userUpdateEmail);
        } catch (error) {
            throwCustomError(error, `${AuthService.name} - updateEmail`);
        }
    }

    public async sendVerificationEmail(email: string) {
        await this.externalAuthService.sendVerificationEmail(email);
    }

    private async createDataBaseUser(userEntity: CreateUserEntity) {
        let companyId = null;

        try {
            const { id } = await this.companyService.create(userEntity.company?.name);

            companyId = id;

            const user: UserEntity = await this.userService.create(userEntity);

            // Company is updated to link it with the user that created it.
            // When the Company is created, we don't have that information.
            await this.companyService.update({
                id: companyId,
                name: userEntity.company.name,
                createdBy: user.id,
                updatedBy: user.id
            });
        } catch (error) {
            if (companyId != null) {
                await this.companyService.deleteCompanyById(companyId);
            }

            if (error.errorCode === ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION) {
                const i18n = I18nContext.current();
                error.message = i18n.t('UserServiceErrors.emailAlreadyInUse');
            }

            // At this point, the user has been created in the User Management Service
            // so we need to delete it.
            await this.externalAuthService.deleteUser(userEntity.externalUserId);

            throwCustomError(error, `${AuthService.name} - createDataBaseUser`);
        }
    }

    public async saveCodeAttempt(email: string, type: string): Promise<number> {
        try {
            return await this.userService.saveCodeAttempt(email, type);
        } catch (error) {
            throwCustomError(error, `${AuthService.name} - saveCodeAttempt`);
        }
    }

    async getCodeAttemptRemainingTime(email: string, type: string): Promise<number> {
        try {
            return await this.userService.getCodeAttemptRemainingTimeByType(email, type);
        } catch (error) {
            throwCustomError(error, `${AuthService.name} - getCodeAttemptRemainingTime`);
        }
    }
}
