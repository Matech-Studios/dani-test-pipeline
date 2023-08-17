import { EntityManager } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { UserDto } from 'src/core/dto/user.dto';
import { UserUpdateEmailEntity } from 'src/core/entities';
import { createUserEntityMock } from 'src/core/testsMocks';
import { CustomLogger } from 'src/core/utils';
import { UsersService } from 'src/modules/users/users.service';

describe('Users Service', () => {
    let usersService: UsersService;

    const mockWithEntityManager = async (mockEntityManager: any) => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            providers: [
                CustomLogger,
                UsersService,
                {
                    provide: EntityManager,
                    useValue: mockEntityManager
                }
            ]
        }).compile();

        return moduleRef.get<UsersService>(UsersService);
    };

    describe('Errors Suite', () => {
        const mockEntityManager = {
            create: jest.fn(() => {
                throw new Error('Error');
            }),
            findOne: jest.fn(() => {
                throw new Error('findOne');
            }),
            find: jest.fn(() => {
                throw new Error('find');
            }),
            persistAndFlush: jest.fn(),
            findOneOrFail: jest.fn()
        };

        beforeEach(async () => {
            usersService = await mockWithEntityManager(mockEntityManager);
        });

        describe('Create user', () => {
            it('should throw an error', async () => {
                await expect(usersService.create(createUserEntityMock)).rejects.toThrowError(Error);

                expect(mockEntityManager.create).toHaveBeenCalled();
                expect(mockEntityManager.create).toBeCalledTimes(1);
            });
        });

        describe('Find one user by email', () => {
            it('should throw an error', async () => {
                await expect(usersService.findOneByEmail('Error')).rejects.toThrowError(Error);

                expect(mockEntityManager.findOne).toHaveBeenCalled();
            });
        });

        describe('Find one user by email', () => {
            const mockEntityManagerWithNotFoundError = {
                findOne: jest.fn().mockResolvedValue(null)
            };

            beforeEach(async () => {
                usersService = await mockWithEntityManager(mockEntityManagerWithNotFoundError);
            });

            it('should throw not found error', async () => {
                await expect(
                    usersService.findOneByEmail(createUserEntityMock.email)
                ).rejects.toThrowError(Error);

                expect(mockEntityManagerWithNotFoundError.findOne).toHaveBeenCalledWith(
                    UserDto,
                    { email: createUserEntityMock.email },
                    { populate: true }
                );
            });
        });

        describe('Find One By External Id', () => {
            const mockEntityManagerWithNotFoundError = {
                findOne: jest.fn().mockResolvedValue(null)
            };

            beforeEach(async () => {
                usersService = await mockWithEntityManager(mockEntityManagerWithNotFoundError);
            });

            it('should throw not found error', async () => {
                const externalUserId = 'some random external id';

                await expect(usersService.findOneByExternalId(externalUserId)).rejects.toThrowError(
                    Error
                );

                expect(mockEntityManagerWithNotFoundError.findOne).toHaveBeenCalledWith(UserDto, {
                    externalUserId: externalUserId
                });
            });
        });

        describe('createResendCodeAttempt', () => {
            it('should throw an error if findOneByEmail fails', async () => {
                const externalUserId = 'user123';
                const type = 'ResetPassword';
                const errorMessage = 'Error in findOneByExternalId';
                jest.spyOn(usersService, 'findOneByEmail').mockRejectedValue(
                    new Error(errorMessage)
                );

                await expect(
                    usersService.saveCodeAttempt(externalUserId, type)
                ).rejects.toThrowError(errorMessage);

                expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();
            });
        });

        describe('getCodeAttemptRemainingTimeByType', () => {
            it('should throw an error if findOneOrFail throws an error', async () => {
                const externalUserId = 'user123';
                const type = 'VerificationEmail';
                const errorMessage = 'findOne';
                mockEntityManager.findOneOrFail.mockRejectedValueOnce(new Error(errorMessage));
                await expect(
                    usersService.getCodeAttemptRemainingTimeByType(externalUserId, type)
                ).rejects.toThrowError(errorMessage);
            });
        });

        it('should throw an error if findOneByEmail fails', async () => {
            const userUpdateEmailEntity: UserUpdateEmailEntity = {
                email: 'mail@matechstudios.com',
                newEmail: 'newemail@example.com'
            };

            const errorMessage = 'findOne';

            jest.spyOn(usersService, 'findOneByEmail').mockRejectedValue(new Error(errorMessage));

            await expect(usersService.updateEmail(userUpdateEmailEntity)).rejects.toThrowError(
                errorMessage
            );

            expect(mockEntityManager.persistAndFlush).not.toHaveBeenCalled();
        });
    });
});
