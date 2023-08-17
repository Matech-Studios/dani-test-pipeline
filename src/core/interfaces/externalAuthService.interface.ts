import { CreateUserEntity, UserUpdateEmailEntity } from 'src/core/entities';

export interface ExternalAuthService {
    deleteUser: (uid: string) => Promise<void>;
    updateEmail: (userUpdateEmailRequest: UserUpdateEmailEntity) => Promise<void>;
    createUser: (userEntity: CreateUserEntity, role: string) => Promise<string>;
    sendVerificationEmail(email: string): Promise<boolean>;
}
