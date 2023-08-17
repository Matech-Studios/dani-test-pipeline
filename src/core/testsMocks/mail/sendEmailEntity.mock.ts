import { SendEmailEntity } from 'src/core/entities';

export const sendEmailEntityMock: SendEmailEntity = {
    toEmailAddress: 'email@matechstudios.com',
    emailSubject: 'Fake email',
    htmlBody: "Won't reach to the user."
};
