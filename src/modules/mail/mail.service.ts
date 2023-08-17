import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendEmailEntity } from 'src/core/entities';
import { CustomLogger } from 'src/core/utils';

@Injectable()
export class MailService {
    constructor(private logger: CustomLogger) {}

    public async sendMail(emailEntity: SendEmailEntity): Promise<boolean> {
        const mailerClient: nodemailer.Transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER_NAME,
                pass: process.env.SMTP_PASSWORD
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });

        this.logger.log(
            `Sending validation email to: ${emailEntity.toEmailAddress}`,
            `${MailService.name} - sendMail`
        );

        try {
            await mailerClient.sendMail({
                from: process.env.SMTP_FROM,
                to: emailEntity.toEmailAddress,
                subject: emailEntity.emailSubject,
                html: emailEntity.htmlBody
            });

            this.logger.log('Email sent.', `${MailService.name} - sendMail`);

            return true;
        } catch (error) {
            this.logger.error(error, `${MailService.name} - sendMail`);
            return false;
        }
    }
}
