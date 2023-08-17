import { Test, TestingModule } from '@nestjs/testing';
import { CustomLogger } from 'src/core/utils';
import { MailService } from '../mail.service';
import { sendEmailEntityMock } from '../../../core/testsMocks/mail/sendEmailEntity.mock';
import nodemailer from 'nodemailer';

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockReturnValue(() => {
            return true;
        })
    })
}));

const logger = { log: jest.fn() };

process.env = {
    SMTP_HOST: 'local_host',
    SMTP_PORT: '12345',
    SMTP_SECURE: 'true',
    SMTP_USER_NAME: 'username',
    SMTP_PASSWORD: 'password'
};

describe('Mail Service', () => {
    let mailService: MailService;

    describe('send', () => {
        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [{ provide: CustomLogger, useValue: logger }, MailService]
            }).compile();

            mailService = module.get<MailService>(MailService);
        });

        describe('With valid configuration', () => {
            it('should send the email', async () => {
                const result = await mailService.sendMail(sendEmailEntityMock);

                expect(result).toBeTruthy();

                expect(nodemailer.createTransport).toHaveBeenCalledWith({
                    auth: {
                        pass: process.env.SMTP_PASSWORD,
                        user: process.env.SMTP_USER_NAME
                    },
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT),
                    secure: process.env.SMTP_SECURE === 'true',
                    tls: { ciphers: 'SSLv3' }
                });

                expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
                    from: process.env.SMTP_FROM,
                    to: sendEmailEntityMock.toEmailAddress,
                    subject: sendEmailEntityMock.emailSubject,
                    html: sendEmailEntityMock.htmlBody
                });

                expect(logger.log).toHaveBeenCalledWith(
                    `Sending validation email to: ${sendEmailEntityMock.toEmailAddress}`,
                    `${MailService.name} - sendMail`
                );

                expect(logger.log).toHaveBeenCalledWith(
                    'Email sent.',
                    `${MailService.name} - sendMail`
                );
            });
        });
    });
});
