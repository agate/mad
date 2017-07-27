import Router from 'koa-router';
import cacheControl from 'koa-cache-control';
import mesosRouter from './mesos';
import { getInfo } from '../info';
import Collector from '../collector';

const routers = new Router();
routers.use(cacheControl({noStore: true}));

const APPS_REGEX = /^\/apps(\/.*)/

const COLLECTOR = new Collector(
  process.env.INFLUXDB_HOST,
  process.env.INFLUXDB_PORT,
  process.env.INFLUXDB_USERNAME,
  process.env.INFLUXDB_PASSWORD,
  process.env.INFLUXDB_DATABASE
);

routers.get(APPS_REGEX, async function (ctx, next) {
  let appId = ctx.request.path.match(APPS_REGEX)[1];
  let info = await getInfo(appId);
  await ctx.render('show', {
    info: info
  });
});

routers.get('/', async function (ctx, next) {
  await ctx.render('index');
});

routers.get('/mad.user.js', async function (ctx, next) {
  await ctx.render('mad.user.js.ejs');
});

routers.get('/usage', async function (ctx, next) {
  let range = ctx.request.query.range;
  let type = ctx.request.query.type;
  let id = ctx.request.query.mesos_task_id;

  let results = await COLLECTOR.getUsage(range, type, id);

  results = results.map(function(result) {
    result.time = result.time.getNanoTime();
    return result;
  });

  ctx.body = results;
});

routers.use('/mesos', mesosRouter.routes(), mesosRouter.allowedMethods());

export default routers;
