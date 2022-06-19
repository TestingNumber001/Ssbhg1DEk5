import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
const firebaseApp = getApps().length ? getApp() : initializeApp({
    apiKey: "AIzaSyAJbYmo7KyhM_7CDXjjFXnp8bdRTNgbUIE",
    authDomain: "tongli-book.firebaseapp.com",
    databaseURL: "https://tongli-book.firebaseio.com",
    projectId: "tongli-book",
    storageBucket: "tongli-book.appspot.com",
    messagingSenderId: "1066510659255"
});
const loginStateStorage = {};
export const ApiHandler = function ApiHandler(req, res) {
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    const methods = {
        PUT: function signIn(req, res) {
            const { uuid } = req.params;
            if (uuid === undefined)
                return void res.end('Uuid must be provided.');
            const auth = getAuth(firebaseApp);
            const { email, password } = req.body ?? req.query;
            signInWithEmailAndPassword(auth, email, password).then(function () {
                loginStateStorage[uuid] = auth.currentUser;
                res.end('login successful.');
            }).catch(function (error) {
                console.log(error);
                res.end('login fail.');
            });
        },
        GET: function getIdtoken(req, res) {
            const { uuid } = req.params;
            if (uuid === undefined)
                return void res.end('Uuid must be provided.');
            const user = loginStateStorage[uuid];
            if (!user)
                return void res.end('Not logged in.');
            user.reload().then(function () {
                return user.getIdToken();
            }).then(function (token) {
                res.end(token);
            }).catch(function (error) {
                res.setHeader('content-type', 'application/json; charset=utf-8');
                res.end(JSON.stringify(error));
            });
        },
        DELETE: function (req, res) {
            const { uuid } = req.params;
            if (uuid === undefined)
                return void res.end('Uuid must be provided.');
            const user = loginStateStorage[uuid];
            if (!user)
                return void res.end('Not logged in.');
            res.end(delete loginStateStorage[uuid] && 'Remove login state successfully.');
        }
    };
    if (methods[req.method] instanceof Function)
        methods[req.method](req, res);
};
