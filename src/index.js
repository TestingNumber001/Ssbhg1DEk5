import * as express from 'express';
import { ApiHandler } from './apis';

const app = express();

app.disable('x-powered-by');
app.use(express.static('./public'));

app.all([ '/', '/:uuid', '/:uuid/:method' ], ApiHandler );

const port = process.env.PORT ?? 3000;
app.listen( port, function () {
    return console.log(`Your app is listening on port: ${ port }.`);
});