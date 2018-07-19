import axios from 'axios'

export default class Collector {
  constructor(host, port, baseFilter) {
    this.host = host
    this.port = port
    this.baseFilter = baseFilter
  }

   // range: 5m, 15m, 30m, 1h
   async getUsage(range, type, mesos_task_id) { 
     let query = "";
     let step = '30s';
     let filter = `container_label_MESOS_TASK_ID=${JSON.stringify(mesos_task_id)},${this.baseFilter}`;

     switch (type){
       case "cpu":
         query = `irate(container_cpu_user_seconds_total{${filter}}[5m])`;
         break;
       case "memory":
         query = `sum(container_memory_usage_bytes{${filter}}) by (container_label_MESOS_TASK_ID)`;
         break;
       case "tx":
         query = `rate(container_network_transmit_bytes_total{${filter}}[5m])`;
         break;
       case "rx":
         query = `rate(container_network_receive_bytes_total{${filter}}[5m])`;
         break;
       default:
         break;
     }

     const req_url = `http://${this.host}:${this.port}/api/v1/query_range`
     const req_params = {
       query: query,
       start: new Date(Date.now() - range * 60 * 1000),
       end: new Date(),
       step: step
     }

     try {
       const res = await axios.get(req_url, { params: req_params });

       try {
         return res.data.data.result[0].values.map((value) => {
           console.log(value);
           let data = {
             time: value[0] * 1000,
             value: value[1]
           };
           return data;
         })
       } catch (e) {
         console.log(e);
         return [];
       }
     } catch (e) {
       console.log('err', err);
     }
   }
}
