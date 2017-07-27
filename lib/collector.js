const Influx = require("influx");

export default class Collector {
  constructor(host, port, user, pass, db) {
    this.influxHost = host;
    this.influxPort = port;
    this.influxUser = user;
    this.influxPass = pass;
    this.influxDB   = db;

    this.initInflux();
  }

  initInflux() {
    this.influx = new Influx.InfluxDB({
      host: this.influxHost,
      port: this.influxPort,
      username: this.influxUser,
      password: this.influxPass,
      database: this.influxDB,
    })
  }

  // range: 5m, 15m, 30m, 1h
  getUsage(range, type, mesos_task_id) { 
  
    let table = "";
    switch (type){
      case "cpu":
        table = "cpu_usage_total";
        break;
      case "memory":
        table = "memory_usage";
        break;
      case "tx":
        table = "tx_bytes";
        break;
      case "rx":
        table = "rx_bytes";
        break;
      default:
        break;
    }
    
    let influx_query = 'SELECT mean("value") FROM ' + table + ' WHERE time > now() - ' + range + 'm' + ' and "MESOS_TASK_ID" =~ ' + '/^' + mesos_task_id + '.*/' + ' GROUP BY time' + '(' + range + 's' + ')' + ', "MESOS_TASK_ID" fill(null)';
   
    return this.influx.query(influx_query);
  }
}
