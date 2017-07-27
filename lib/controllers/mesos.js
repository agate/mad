import axios from 'axios';

function getMesosSlaveBaseUrl(mesosSlaveHost, mesosSlavePort) {
  return `http://${mesosSlaveHost}:${mesosSlavePort}`;
}

function getMesosSlaveQueryUrl(mesosSlaveHost, mesosSlavePort, queryPath) {
  return `${getMesosSlaveBaseUrl(mesosSlaveHost, mesosSlavePort)}${queryPath}`;
}

export async function slaveGetQuery(queryPath, mesosSlaveHost, mesosSlavePort, params) {
  const queryUrl = getMesosSlaveQueryUrl(mesosSlaveHost, mesosSlavePort, queryPath);
  return await axios.get(queryUrl, {params});
}
