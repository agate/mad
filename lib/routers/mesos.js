import Router from 'koa-router';
import {cloneDeep, omit} from 'lodash';
import {mesos as mesosApi} from '../controllers';

function getMesosQueryPath({path}) {
  return path.match(/^\/mesos(.+)/)[1];
}

async function filesReadGetResolve(ctx, next) {
  const mesosSlavePath = getMesosQueryPath(ctx);
  const mesosSlaveQuery = cloneDeep(ctx.request.query);
  const mesosSlaveHost = mesosSlaveQuery.mesos_slave_host;
  const mesosSlavePort = mesosSlaveQuery.mesos_slave_port;
  const response = await mesosApi.slaveGetQuery(
    mesosSlavePath, mesosSlaveHost, mesosSlavePort,
    omit(mesosSlaveQuery, ['mesos_slave_host', 'mesos_slave_port'])
  );
  ctx.body = response.data;
}

const routers = new Router();

routers.get('/files/read', filesReadGetResolve);

export default routers;
