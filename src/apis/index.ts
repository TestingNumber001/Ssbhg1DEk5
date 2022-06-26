import * as express from 'express';

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';

const firebaseApp = getApps().length ? getApp(): initializeApp({
    apiKey: "AIzaSyAJbYmo7KyhM_7CDXjjFXnp8bdRTNgbUIE",
    authDomain: "tongli-book.firebaseapp.com",
    databaseURL: "https://tongli-book.firebaseio.com",
    projectId: "tongli-book",
    storageBucket: "tongli-book.appspot.com",
    messagingSenderId: "1066510659255"
});

const loginStateStorage: {
    [token: string | symbol]: User | undefined;
} = {};

const anonymousUserToken = Symbol();
function getAnonymousUser (): Promise<User | null> {
    const anonymousUser: User | undefined = loginStateStorage[anonymousUserToken];
    if ( anonymousUser ) {
        return anonymousUser.reload().then( function () {
            return anonymousUser;
        });
    }

    const auth = getAuth( firebaseApp );
    return signInAnonymously( auth ).then( function ({ user }) {
        loginStateStorage[anonymousUserToken] = user;
        return user;
    }).catch( function ( error ) {
        console.log( error );
        return null;
    })
}

export const ApiHandler: express.RequestHandler = function ApiHandler ( req: express.Request, res: express.Response ): void {
    res.setHeader('content-type', 'text/plain; charset=utf-8');

    const methods = {
        PUT: function signIn ( req: express.Request, res: express.Response ): void {
            const { uuid } = req.params;
            if ( uuid === undefined ) return void res.end('Uuid must be provided.');

            const auth = getAuth( firebaseApp );
            const { email, password }: {
                email?: string; password?: string;
            } = req.body ?? req.query;

            signInWithEmailAndPassword( auth, email, password ).then( function ({ user }) {
                loginStateStorage[uuid] = user;
                res.end('login successful.');
            }).catch( function ( error ) {
                console.log( error );
                res.end('login fail.');
            });
        },

        GET: function getIdtoken ( req: express.Request, res: express.Response ): void {
            const { uuid } = req.params;
            if ( uuid === undefined ) return void res.end('Uuid must be provided.');

            const user: User | undefined = loginStateStorage[uuid];
            ( user ? Promise.resolve( user ): getAnonymousUser() ).then( function ( user ) {
                return user.getIdToken( true );
            }).then( function ( token ) {
                res.setHeader('content-type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ isAnonymous: !user, token }));
            }).catch( function ( error ) {
                res.setHeader('content-type', 'application/json; charset=utf-8');
                res.end(JSON.stringify( error ));
            });
        },

        DELETE: function  ( req: express.Request, res: express.Response ): void {
            const { uuid } = req.params;
            if ( uuid === undefined ) return void res.end('Uuid must be provided.');

            const user: User | undefined = loginStateStorage[uuid];
            if ( !user ) return void res.end('Not logged in.');
            res.end( delete loginStateStorage[uuid] && 'Remove login state successfully.')
        }
    }

    if ( methods[req.method] instanceof Function ) methods[req.method]( req, res );
};