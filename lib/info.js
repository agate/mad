const flatten = require('array-flatten');
const extend = require('util')._extend;
const request = require('request');
const zlib = require('zlib');

const MARATHON_API = `http://${process.env.MARATHON_HOST}${process.env.MARATHON_PORT == '80' || !process.env.MARATHON_PORT ? '' : ':' + process.env.MARATHON_PORT}/v2/apps/`;
const MESOS_STATE = `http://${process.env.MESOS_HOST}${process.env.MESOS_PORT == '80' || !process.env.MESOS_PORT ? '' : ':' + process.env.MESOS_PORT}/state`;

export function getInfo(appId) {
  var p1 = loadMarathonDetail(appId);
  var p2 = loadMesosState();

  var pTaskList = Promise.all([p1, p2]).then((values) => {
    var idList = values[0], mesosTasks = values[1]['tasks'], mesosSlaves = values[1]['slaves'];
    return mesosTasks.filter((task) => idList.includes(task.id))
      .map((task) => {
        return extend(task, mesosSlaves.filter((slave) => slave.slave_id == task.slave_id)[0])
      });
  });

  var pHostDetail = new Promise((resolve) => {
    pTaskList.then((taskList) => 
      Promise.all(taskList.map(t => queryGzip(`http://${t.hostname}:${t.port}/${t.pid.replace(/@.*$/, '')}/state`)))
        .then(results => {
          resolve(flatten(results.map(result => {
            let parsedResult = JSON.parse(result);
            return parsedResult.frameworks.map(framework =>
              framework.executors.map(({id, container}) => ({id, container_id: container, work_dir: parsedResult.flags.work_dir }))
            );
          }), 1))
        })
    )
  });

  return Promise.all([pTaskList, pHostDetail]).then((values) => {
    var idList = values[0], hostDetail = values[1];
    return idList.map(task => {
      return extend(task, hostDetail.filter((hd) => hd.id == task.id)[0])
    })
  });
}

function loadMarathonDetail(appId) {
  return queryGzip(MARATHON_API + decodeURIComponent(appId))
    .then((result) => {
      return JSON.parse(result)['app']['tasks'].map((task) => task['id']);
    });
}

function loadMesosState() {
  return queryGzip(MESOS_STATE)
    .then(function(result) {
      return (({slaves, frameworks}) => ({
        slaves: slaves.map(({id, hostname, port, pid}) => ({slave_id: id, hostname, port, pid})),
        tasks: flatten(frameworks.map(function(framework) {
          return framework['tasks']
            .filter((task) => task.statuses.length > 0)
            .filter((task) => task.statuses[0].container_status.container_id != undefined)
            .map(({id, framework_id, slave_id}) => ({id, framework_id, slave_id}));
        }), 1)
      }))(JSON.parse(result))
    });
}

function queryGzip(url) {
  var headers = { 'Accept-Encoding': 'gzip' };
  var result = '';

  return new Promise((resolve, reject) => {
    request({'url': url, 'headers': headers})
      .pipe(zlib.createGunzip())
      .on('data', (chunk) => result += chunk)
      .on('end', () => resolve(result))
      .on('error', (err) => {
        if (err.code === 'Z_DATA_ERROR' && err.message === 'incorrect header check') {
          err = new Error('Unrecognized app');
        }
        reject(err);
      });
  });
}
