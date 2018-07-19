import Router from 'koa-router';
import cacheControl from 'koa-cache-control';
import mesosRouter from './mesos';
import { getInfo } from '../info';
import Collector from '../collector';
import pkg from '../../package';

const routers = new Router();
routers.use(cacheControl({noStore: true}));

const APPS_REGEX = /^\/apps(\/.*)/

const COLLECTOR = Collector.get();

routers.get(APPS_REGEX, async function (ctx, next) {
  let appId = ctx.request.path.match(APPS_REGEX)[1];
  try {
    ctx.log.info('Getting app info');
    let info = await getInfo(appId);
    await ctx.render('show', {
      info: info,
      appId: appId
    });
  } catch (e) {
    if (e.message === 'Unrecognized app') {
      let errMsg = `No app found for ${ctx.request.path}`;
      ctx.log.warn(errMsg);
      ctx.body = e.message;
      ctx.throw(404, errMsg);
    } else {
      ctx.log.error('Error when getting app info', e);
      ctx.throw(500, e);
    }
  }
});

routers.get('/', async function (ctx, next) {
  await ctx.render('index');
});

routers.get('/mad.user.js', async function (ctx, next) {
  await ctx.render('mad.user.js.ejs', {
    host: ctx.request.header.host,
    version: pkg.version
  });
});

routers.get('/usage', async function (ctx, next) {
  let range = ctx.request.query.range;
  let type = ctx.request.query.type;
  let id = ctx.request.query.mesos_task_id;

  let results = await COLLECTOR.getUsage(range, type, id);

  ctx.body = results;
});

routers.use('/mesos', mesosRouter.routes(), mesosRouter.allowedMethods());

export default routers;
