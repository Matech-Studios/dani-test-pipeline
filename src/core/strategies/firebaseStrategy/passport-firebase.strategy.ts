import { Logger } from '@nestjs/common';
import { Request } from 'express';
import * as admin from 'firebase-admin';
import { JwtFromRequestFunction } from 'passport-jwt';
import { Strategy } from 'passport-strategy';
import { FIREBASE_AUTH, UNAUTHORIZED } from 'src/core/strategies/firebaseStrategy/constants';
import { FirebaseUser } from 'src/core/strategies/firebaseStrategy/firebaseUser.type';
import { FirebaseAuthStrategyOptions } from 'src/core/strategies/firebaseStrategy/interface';

export class FirebaseAuthStrategy extends Strategy {
    readonly name = FIREBASE_AUTH;
    private checkRevoked = false;

    constructor(
        options: FirebaseAuthStrategyOptions,
        private extractor: JwtFromRequestFunction,
        private logger = new Logger(FirebaseAuthStrategy.name)
    ) {
        super();

        if (!options.extractor) {
            throw new Error(
                '\n Extractor is not a function. You should provide an extractor. \n Read the docs: https://github.com/tfarras/nestjs-firebase-auth#readme'
            );
        }

        this.extractor = options.extractor;
        this.checkRevoked = options.checkRevoked;
    }

    async validate(payload: FirebaseUser): Promise<any> {
        return payload;
    }

    authenticate(req: Request): void {
        const idToken = this.extractor(req);

        if (!idToken) {
            this.fail(UNAUTHORIZED, 401);
            return;
        }

        try {
            admin
                .auth()
                .verifyIdToken(idToken, this.checkRevoked)
                .then(claims => this.validateDecodedIdToken(claims))
                .catch(err => {
                    this.fail(err, 401);
                });
        } catch (e) {
            this.logger.error(e);

            this.fail(e, 401);
        }
    }

    private async validateDecodedIdToken(decodedIdToken: FirebaseUser) {
        const result = await this.validate(decodedIdToken);

        if (result) {
            return this.success(result);
        }

        this.fail(UNAUTHORIZED, 401);
    }
}
