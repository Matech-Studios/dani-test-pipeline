import { Test, TestingModule } from '@nestjs/testing';
import {
    companyDtoMock,
    createUserEntityMock,
    updateUserEmailEntityMock,
    userEntityMock
} from 'src/core/testsMocks';
import { AuthService } from 'src/modules/auth/auth.service';
import { FirebaseStrategy } from 'src/modules/auth/strategies';
import { CompanyService } from 'src/modules/companies';
import { UsersService } from 'src/modules/users';

describe('AuthService', () => {
    let authService: AuthService;
    const mockExternalAuthService = {
        deleteUser: jest.fn(),
        logoutUser: jest.fn(),
        updateEmail: jest.fn(),
        createUser: jest.fn(),
        sendVerificationEmail: jest.fn()
    };

    const mockCompanyService = {
        create: jest.fn().mockReturnValue(companyDtoMock),
        update: jest.fn(),
        deleteCompanyById: jest.fn()
    };

    const mockUsersService = {
        findOneByExternalId: jest.fn().mockResolvedValue(userEntityMock),
        create: jest.fn().mockReturnValue(userEntityMock),
        updateEmail: jest.fn(),
        deleteUserById: jest.fn(),
        saveCodeAttempt: jest.fn().mockReturnValue(300000),
        getCodeAttemptRemainingTimeByType: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: 'ExternalAuthService',
                    useValue: mockExternalAuthService
                },
                {
                    provide: CompanyService,
                    useValue: mockCompanyService
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService
                },
                {
                    provide: FirebaseStrategy,
                    useValue: jest.fn().mockReturnValue(true)
                }
            ]
        }).compile();

        authService = module.get(AuthService);
    });

    describe('signUp', () => {
        it('should create a new user and update the company', async () => {
            const createSpy = jest.spyOn(mockCompanyService, 'create');
            const updateSpy = jest.spyOn(mockCompanyService, 'update');
            const createUserSpy = jest.spyOn(mockUsersService, 'create');

            await authService.signUp(createUserEntityMock);

            expect(createSpy).toHaveBeenCalledWith('Matech Studios');
            expect(updateSpy).toHaveBeenCalled();
            expect(createUserSpy).toHaveBeenCalled();
        });

        it('should throw an error when an exception occurs creating the company', async () => {
            const error = new Error('Some error');
            jest.spyOn(mockCompanyService, 'create').mockRejectedValueOnce(error);

            const deleteExternalUserSpy = jest.spyOn(mockExternalAuthService, 'deleteUser');

            await expect(authService.signUp(createUserEntityMock)).rejects.toThrowError(Error);

            expect(deleteExternalUserSpy).toHaveBeenCalled();
        });

        it('should throw an error if externalAuthService fails', async () => {
            const error = new Error('Some error');
            jest.spyOn(mockExternalAuthService, 'createUser').mockRejectedValueOnce(error);

            await expect(authService.signUp(createUserEntityMock)).rejects.toThrowError(Error);
        });

        it('should rollback transactions if userService fails', async () => {
            const error = new Error('Some error');
            jest.spyOn(mockUsersService, 'create').mockRejectedValueOnce(error);

            const deleteCompanySpy = jest.spyOn(mockCompanyService, 'deleteCompanyById');

            const deleteExternalUserSpy = jest.spyOn(mockExternalAuthService, 'deleteUser');

            await expect(authService.signUp(createUserEntityMock)).rejects.toThrowError(Error);

            expect(deleteCompanySpy).toHaveBeenCalled();
            expect(deleteExternalUserSpy).toHaveBeenCalled();
        });
    });

    describe('updateEmail', () => {
        it('should update the email in the database and external auth service', async () => {
            const updateEmailDbSpy = jest.spyOn(mockUsersService, 'updateEmail');
            const updateEmailExternalSpy = jest.spyOn(mockExternalAuthService, 'updateEmail');

            await authService.updateEmail(updateUserEmailEntityMock);

            expect(updateEmailDbSpy).toHaveBeenCalled();
            expect(updateEmailExternalSpy).toHaveBeenCalled();
        });

        it('should throw an error when an exception occurs', async () => {
            const error = new Error('Some error');
            jest.spyOn(mockUsersService, 'updateEmail').mockRejectedValueOnce(error);

            await expect(authService.updateEmail(updateUserEmailEntityMock)).rejects.toThrow(error);
        });
    });

    describe('saveCodeAttempt', () => {
        it('should call userService.saveCodeAttempt with the correct parameters', async () => {
            const externalUserId = 'user123';
            const type = 'ResetPassword';

            const result = await authService.saveCodeAttempt(externalUserId, type);

            expect(result).toBe(300000);

            expect(mockUsersService.saveCodeAttempt).toHaveBeenCalledWith(externalUserId, type);
        });

        it('should throw an error if userService.saveCodeAttempt throws an error', async () => {
            const externalUserId = 'user123';
            const type = 'ResetPassword';
            const errorMessage = 'Error in userService.saveCodeAttempt';
            mockUsersService.saveCodeAttempt.mockRejectedValueOnce(new Error(errorMessage));

            await expect(authService.saveCodeAttempt(externalUserId, type)).rejects.toThrowError(
                errorMessage
            );
        });
    });

    describe('userResendCodeRemainingTime', () => {
        it('should call userService.getCodeAttemptRemainingTime with the correct parameters', async () => {
            const externalUserId = 'user123';
            const type = 'VerificationEmail';

            mockUsersService.getCodeAttemptRemainingTimeByType.mockResolvedValueOnce(10);

            const result = await authService.getCodeAttemptRemainingTime(externalUserId, type);

            expect(result).toBe(10);
            expect(mockUsersService.getCodeAttemptRemainingTimeByType).toHaveBeenCalledWith(
                externalUserId,
                type
            );
        });
    });

    describe('sendVerificationEmail', () => {
        it('should call externalAuthService.sendVerificationEmail', async () => {
            const email = 'email@matechstudios.com';

            await authService.sendVerificationEmail(email);

            expect(mockExternalAuthService.sendVerificationEmail).toHaveBeenCalledWith(email);
        });
    });
});
