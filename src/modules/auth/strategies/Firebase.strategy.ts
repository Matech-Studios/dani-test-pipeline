import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { FirebaseAuthStrategy, FirebaseUser } from 'src/core/strategies/firebaseStrategy';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(FirebaseAuthStrategy, 'firebase') {
    public constructor() {
        super({
            extractor: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }

    async validate(payload: FirebaseUser): Promise<FirebaseUser> {
        return payload;
    }
}
