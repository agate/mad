import { default as InfluxCollector } from './collectors/influxdb';
import { default as PrometheusCollector } from './collectors/prometheus';

const get = module.exports.get = () => {
  switch (process.env.COLLECTOR_TYPE) {
    case "influxdb":
      return new InfluxCollector(
        process.env.INFLUXDB_HOST,
        process.env.INFLUXDB_PORT,
        process.env.INFLUXDB_USERNAME,
        process.env.INFLUXDB_PASSWORD,
        process.env.INFLUXDB_DATABASE
      );
      break;
    case "prometheus":
      return new PrometheusCollector(
        process.env.PROMETHEUS_HOST,
        process.env.PROMETHEUS_PORT,
        process.env.PROMETHEUS_BASE_FILTER
      );
      break;
    default:
      throw `Unsupported collector type: ${process.env.COLLECTOR_TYPE}`
  }
}
