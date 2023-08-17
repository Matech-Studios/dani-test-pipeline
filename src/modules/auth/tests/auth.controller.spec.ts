import { EntityManager } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import {
    CreateUserRequest,
    ResendCodeType,
    UserResendCodeAttemptRequest
} from 'src/core/contracts';
import { CreateUserEntity } from 'src/core/entities';
import { createUserEntityMock, signUpDataMock, userSignedResponseMock } from 'src/core/testsMocks';
import { CustomLogger } from 'src/core/utils';
import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { FirebaseStrategy } from 'src/modules/auth/strategies';

describe('AuthController', () => {
    let authController: AuthController;

    const mockAuthService = {
        signUp: jest.fn().mockResolvedValue(userSignedResponseMock),
        updateEmail: jest.fn(),
        getCodeAttemptRemainingTime: jest.fn().mockResolvedValue(300000),
        saveCodeAttempt: jest.fn().mockResolvedValue(300000),
        sendVerificationEmail: jest.fn()
    };

    const mockEntityManager = {};

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                CustomLogger,
                {
                    provide: AuthService,
                    useValue: mockAuthService
                },
                EntityManager,
                {
                    provide: FirebaseStrategy,
                    useValue: jest.fn().mockReturnValue(true)
                },
                {
                    provide: EntityManager,
                    useValue: mockEntityManager
                }
            ]
        }).compile();

        authController = module.get<AuthController>(AuthController);
    });

    describe('signUp', () => {
        it('should call authService.signUp with the correct user', async () => {
            const userRequest: CreateUserRequest = signUpDataMock[0];

            const expectedUser: CreateUserEntity = createUserEntityMock;
            const signUpSpy = jest.spyOn(mockAuthService, 'signUp');

            await authController.signUp(userRequest);

            expect(signUpSpy).toHaveBeenCalledWith(expectedUser);
        });
    });

    describe('updateEmail', () => {
        it('should call authService.updateEmail with the correct parameters', async () => {
            const updateEmailSpy = jest.spyOn(mockAuthService, 'updateEmail');

            await authController.updateEmail('mail@matechstudios.com', {
                newEmail: 'new@example.com'
            });

            expect(updateEmailSpy).toHaveBeenCalledWith({
                email: 'mail@matechstudios.com',
                newEmail: 'new@example.com'
            });
        });
    });

    describe('getUserLastCodeAttemptTimestamp', () => {
        it('should call authService.getCodeAttemptRemainingTime with the correct parameters', async () => {
            const externalUserId = 'testExternalUserId';
            const type = 'testType';
            const expectedTimestamp = 123456;

            jest.spyOn(mockAuthService, 'getCodeAttemptRemainingTime').mockResolvedValue(
                expectedTimestamp
            );

            const result = await authController.getUserLastCodeAttemptTimestamp(
                type,
                externalUserId
            );

            expect(mockAuthService.getCodeAttemptRemainingTime).toHaveBeenCalledWith(
                externalUserId,
                type
            );
            expect(result).toBe(expectedTimestamp);
        });
    });

    describe('setUserLastResendCodeAttempt', () => {
        it('should call authService.saveResendCodeAttempt with the correct parameters', async () => {
            const request: UserResendCodeAttemptRequest = {
                email: 'email@matechstudios.com',
                type: ResendCodeType.VerificationEmail
            };
            const expectedTimestamp = 123456;

            jest.spyOn(mockAuthService, 'saveCodeAttempt').mockResolvedValue(expectedTimestamp);

            const result = await authController.setUserLastResendCodeAttempt(request);

            expect(mockAuthService.saveCodeAttempt).toHaveBeenCalledWith(
                request.email,
                request.type
            );
            expect(result).toBe(expectedTimestamp);
        });
    });

    describe('sendVerificationEmail', () => {
        it('should call authService.sendVerificationEmail', async () => {
            const userRequest: CreateUserRequest = signUpDataMock[0];

            const sendVerificatonEmailSpy = jest.spyOn(mockAuthService, 'sendVerificationEmail');

            await authController.sendVerificationEmail(userRequest.email);

            expect(sendVerificatonEmailSpy).toHaveBeenCalledWith(userRequest.email);
        });
    });
});
