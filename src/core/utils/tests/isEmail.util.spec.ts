import { isEmail } from 'src/core/utils/isEmail.util';

const validEmails = [
    'valid.email@example.com',
    'another.valid.email@example.co.uk',
    'john.doe123@example.net',
    'john-doe@example.org',
    'valid_email@example.info'
];

const invalidEmails = [
    'not.a.valid.email',
    'john@doe@example.com',
    'invalid.email@',
    'invalid.email@example',
    'invalid.email@example.',
    '!"'
];

describe('isEmail util', () => {
    it('should return true if emails are valids', () => {
        for (const email of validEmails) {
            expect(isEmail(email)).toBe(true);
        }
    });

    it('should return false if emails are not valid', () => {
        for (const email of invalidEmails) {
            expect(isEmail(email)).toBe(false);
        }
    });
});
