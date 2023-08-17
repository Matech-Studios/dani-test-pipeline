import { Body, Controller, Get, Param, Post, Put, UseFilters } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
    CreateUserRequest,
    UserResendCodeAttemptRequest,
    UserUpdateEmailRequest
} from 'src/core/contracts';
import { CreateUserEntity, UserUpdateEmailEntity } from 'src/core/entities';
import { CustomErrorFilter } from 'src/core/filters';
import { AuthService } from 'src/modules/auth/auth.service';

@UseFilters(CustomErrorFilter)
@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    async signUp(@Body() userRequest: CreateUserRequest): Promise<void> {
        const user: CreateUserEntity = {
            ...userRequest,
            company: { name: userRequest.companyName }
        };

        delete user['companyName'];
        await this.authService.signUp(user);
    }

    @Put(':email/email')
    async updateEmail(
        @Param('email') email: string,
        @Body() userUpdateEmail: UserUpdateEmailRequest
    ) {
        const userUpdateEmailEntity: UserUpdateEmailEntity = {
            email,
            newEmail: userUpdateEmail.newEmail
        };

        return await this.authService.updateEmail(userUpdateEmailEntity);
    }

    @ApiOperation({
        summary:
            "Get's the remaining time a user is allowed to resend a new email of the specified type."
    })
    @Get(':email/codeAttempt/:type')
    async getUserLastCodeAttemptTimestamp(
        @Param('type') type: string,
        @Param('email') email: string
    ): Promise<number> {
        return await this.authService.getCodeAttemptRemainingTime(email, type);
    }

    @Post('codeAttempt')
    async setUserLastResendCodeAttempt(
        @Body() request: UserResendCodeAttemptRequest
    ): Promise<number> {
        return await this.authService.saveCodeAttempt(request.email, request.type);
    }

    @ApiOperation({ summary: "Sends a user's verification email." })
    @Get(':userEmail/verificationEmail')
    async sendVerificationEmail(@Param('userEmail') userEmail: string): Promise<void> {
        await this.authService.sendVerificationEmail(userEmail);
    }
}
