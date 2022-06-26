"use strict";
var _a;
exports.__esModule = true;
var express = require("express");
var apis_1 = require("./apis");
var app = express();
app.disable('x-powered-by');
app.use(express.static('./public'));
app.all(['/', '/:uuid', '/:uuid/:method'], apis_1.ApiHandler);
var port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
app.listen(port, function () {
    return console.log("Your app is listening on port: ".concat(port, "."));
});
