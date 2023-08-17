import { EntityManager } from '@mikro-orm/core';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserResendCodeAttemptDto } from 'src/core/dto';
import { UserDto } from 'src/core/dto/user.dto';
import { createUserEntityMock, userDtoMock, userEntityMock } from 'src/core/testsMocks';
import { CustomLogger } from 'src/core/utils';
import { UsersService } from '../users.service';
import { UserUpdateEmailEntity } from 'src/core/entities';

describe('Users Service New Happy Paths', () => {
    let usersService: UsersService;
    const entityManagerMock = {
        create: jest.fn().mockResolvedValue(userEntityMock),
        findOne: jest.fn().mockResolvedValue(userDtoMock),
        findOneOrFail: jest.fn().mockResolvedValue(userDtoMock),
        persistAndFlush: jest.fn(),
        flush: jest.fn(),
        nativeDelete: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CustomLogger,
                UsersService,
                {
                    provide: EntityManager,
                    useValue: entityManagerMock
                }
            ]
        }).compile();

        usersService = module.get<UsersService>(UsersService);
    });

    describe('Create user', () => {
        describe('Create user success', () => {
            it('when create user is called ', async () => {
                const user = await usersService.create(createUserEntityMock);

                expect(entityManagerMock.create).toHaveBeenCalledWith(
                    UserDto,
                    createUserEntityMock
                );
                expect(entityManagerMock.create).toBeCalledTimes(1);

                expect(entityManagerMock.persistAndFlush).toHaveBeenCalled();
                expect(entityManagerMock.persistAndFlush).toBeCalledTimes(1);

                expect(user).toEqual(userEntityMock);
            });
        });
    });

    describe('Get user', () => {
        describe('Find user by ExternalId', () => {
            it('should retrieve user if Id is found', async () => {
                const user = await usersService.findOneByExternalId(userDtoMock.externalUserId);
                expect(entityManagerMock.findOne).toHaveBeenCalledWith(UserDto, {
                    externalUserId: userDtoMock.externalUserId
                });
                expect(user).toBe(userDtoMock);
            });
        });

        describe('Find user by Email', () => {
            it('should retrieve user if email is found', async () => {
                const user = await usersService.findOneByEmail(userDtoMock.email);
                expect(entityManagerMock.findOne).toHaveBeenCalledWith(
                    UserDto,
                    { email: userDtoMock.email },
                    { populate: true }
                );
                expect(user).toBe(userDtoMock);
            });
        });
    });

    describe('Find user by email', () => {
        describe('User found', () => {
            it('should retrieve the user if the email is found', async () => {
                const email = 'test@example.com';
                const expectedUserDto = { email, id: '123' }; // Define the expected user DTO

                const findOneSpy = jest
                    .spyOn(entityManagerMock, 'findOne')
                    .mockResolvedValue(expectedUserDto);

                const user = await usersService.findOneByEmail(email);

                expect(findOneSpy).toHaveBeenCalledWith(UserDto, { email }, { populate: true });
                expect(user).toEqual(expectedUserDto);
            });
        });

        describe('User not found', () => {
            it('should throw an error with a "NOT_FOUND" status code', async () => {
                const email = 'test@example.com';

                const findOneSpy = jest.spyOn(entityManagerMock, 'findOne').mockResolvedValue(null); // User not found

                await expect(usersService.findOneByEmail(email)).rejects.toThrowError(
                    new HttpException(
                        `Incorrect username or password: ${email}`,
                        HttpStatus.NOT_FOUND
                    )
                );

                expect(findOneSpy).toHaveBeenCalledWith(UserDto, { email }, { populate: true });
            });
        });
    });

    describe('Update email', () => {
        describe("Should update user's email", () => {
            it('with valid data', async () => {
                const userUpdateEmailEntity: UserUpdateEmailEntity = {
                    email: 'mail@matechstudios.com',
                    newEmail: 'newemail@example.com'
                };

                jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(userDtoMock);

                await usersService.updateEmail(userUpdateEmailEntity);

                expect(usersService.findOneByEmail).toHaveBeenCalledWith(
                    userUpdateEmailEntity.email
                );
                expect(entityManagerMock.persistAndFlush).toHaveBeenCalledWith(userDtoMock);
            });
        });
    });

    describe('saveCodeAttempt', () => {
        it('should create a new UserResendCodeAttemptDto when no existing resend code attempt is found', async () => {
            const email = 'mail@matechstudios.com';
            const type = 'ResetPassword';

            const findOneByExternalIdSpy = jest
                .spyOn(usersService, 'findOneByEmail')
                .mockResolvedValue(userDtoMock);
            entityManagerMock.findOne.mockResolvedValueOnce(undefined);

            await usersService.saveCodeAttempt(email, type);

            expect(findOneByExternalIdSpy).toHaveBeenCalledWith(email);
            expect(entityManagerMock.persistAndFlush).toHaveBeenCalled();
            expect(entityManagerMock.persistAndFlush).toHaveBeenCalledWith(
                expect.any(UserResendCodeAttemptDto)
            );
        });

        it('should update an existing UserResendCodeAttemptDto when a matching resend code attempt is found', async () => {
            const email = 'mail@matechstudios.com';
            const type = 'ResetPassword';

            const mockUser = new UserDto();
            mockUser.id = 'asdasdasdasd';

            const existingResendCode = new UserResendCodeAttemptDto();
            existingResendCode.id = 'fakeId';
            existingResendCode.userId = mockUser.id;
            existingResendCode.type = type;
            existingResendCode.timestamp = 123456789;

            jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(userDtoMock);
            entityManagerMock.findOne.mockResolvedValueOnce(existingResendCode);

            await usersService.saveCodeAttempt(email, type);
            expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
            expect(entityManagerMock.flush).toHaveBeenCalledTimes(1);
            expect(existingResendCode.timestamp).toBeLessThanOrEqual(new Date().getTime());
        });

        it('should throw an error if the new email is the same as the current email', async () => {
            const userUpdateEmailEntity: UserUpdateEmailEntity = {
                email: userDtoMock.email,
                newEmail: userDtoMock.email
            };

            jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(userDtoMock);

            await expect(usersService.updateEmail(userUpdateEmailEntity)).rejects.toThrowError();
        });
    });
});
