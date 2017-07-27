import Koa from 'koa';
import path from 'path';
import bodyParser from 'koa-bodyparser';
import onerror from 'koa-onerror';
import responseTime from 'koa-response-time';
import koaStatic from 'koa-static';
import qs from 'koa-qs';
import routers from './routers';
import setupLogger from './logger';
import {appRoot} from './utils';
import views from 'koa-views';

const app = new Koa();
app.name = 'Marathon App Dashboard (MAD)';

onerror(app);
setupLogger(app);

app.use(koaStatic(path.join(appRoot(), 'public')));

// Must be used before any router is used
app.use(views(__dirname + '/../views', { extension: 'pug' }));

qs(app, 'extended');
app.use(bodyParser({
  onerror: (err, ctx) => { ctx.throw('Body Parse Error', 422); }
}));
app.use(responseTime());

app.use(routers.routes(), routers.allowedMethods());

const port = 3000;
app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`MAD starts on 0.0.0.0:${port}`);
  }
});
