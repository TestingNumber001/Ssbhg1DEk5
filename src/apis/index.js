"use strict";
exports.__esModule = true;
exports.ApiHandler = void 0;
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var firebaseApp = (0, app_1.getApps)().length ? (0, app_1.getApp)() : (0, app_1.initializeApp)({
    apiKey: "AIzaSyAJbYmo7KyhM_7CDXjjFXnp8bdRTNgbUIE",
    authDomain: "tongli-book.firebaseapp.com",
    databaseURL: "https://tongli-book.firebaseio.com",
    projectId: "tongli-book",
    storageBucket: "tongli-book.appspot.com",
    messagingSenderId: "1066510659255"
});
var loginStateStorage = {};
var anonymousUserToken = Symbol();
function getAnonymousUser() {
    var anonymousUser = loginStateStorage[anonymousUserToken];
    if (anonymousUser) {
        return anonymousUser.reload().then(function () {
            return anonymousUser;
        });
    }
    var auth = (0, auth_1.getAuth)(firebaseApp);
    return (0, auth_1.signInAnonymously)(auth).then(function (_a) {
        var user = _a.user;
        loginStateStorage[anonymousUserToken] = user;
        return user;
    })["catch"](function (error) {
        console.log(error);
        return null;
    });
}
var ApiHandler = function ApiHandler(req, res) {
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    var methods = {
        PUT: function signIn(req, res) {
            var _a;
            var uuid = req.params.uuid;
            if (uuid === undefined)
                return void res.end('Uuid must be provided.');
            var auth = (0, auth_1.getAuth)(firebaseApp);
            var _b = (_a = req.body) !== null && _a !== void 0 ? _a : req.query, email = _b.email, password = _b.password;
            (0, auth_1.signInWithEmailAndPassword)(auth, email, password).then(function (_a) {
                var user = _a.user;
                loginStateStorage[uuid] = user;
                res.end('login successful.');
            })["catch"](function (error) {
                console.log(error);
                res.end('login fail.');
            });
        },
        GET: function getIdtoken(req, res) {
            var uuid = req.params.uuid;
            if (uuid === undefined)
                return void res.end('Uuid must be provided.');
            var user = loginStateStorage[uuid];
            (user ? Promise.resolve(user) : getAnonymousUser()).then(function (user) {
                return user.getIdToken();
            }).then(function (token) {
                res.setHeader('content-type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ isAnonymous: !user, token: token }));
            })["catch"](function (error) {
                res.setHeader('content-type', 'application/json; charset=utf-8');
                res.end(JSON.stringify(error));
            });
        },
        DELETE: function (req, res) {
            var uuid = req.params.uuid;
            if (uuid === undefined)
                return void res.end('Uuid must be provided.');
            var user = loginStateStorage[uuid];
            if (!user)
                return void res.end('Not logged in.');
            res.end(delete loginStateStorage[uuid] && 'Remove login state successfully.');
        }
    };
    if (methods[req.method] instanceof Function)
        methods[req.method](req, res);
};
exports.ApiHandler = ApiHandler;
