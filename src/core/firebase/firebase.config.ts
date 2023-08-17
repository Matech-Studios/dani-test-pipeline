import admin from 'firebase-admin';
import { getApp } from 'firebase-admin/app';
import { dateToStringYYYYMMDD } from '../utils';

/// To understand this line: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
/// see this answer: https://stackoverflow.com/a/50376092

const FirebaseInit = () => {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        projectId: process.env.FIREBASE_PROJECT_ID
    });

    const now = dateToStringYYYYMMDD(new Date());
    console.log(`\x1b[35m${now} - Firebase ${getApp().name} initialized.\x1b[0m`);
};

export default FirebaseInit;
