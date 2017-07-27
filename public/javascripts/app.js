$(function () {

  (function () {
    APP_INFO.forEach(function (task, i) {
      [ "stdout", "stderr" ].forEach(function (file) {
        var $wrapper = $("#" + file + "-" + i);
        var $board = $wrapper.find('.board');
        var $indicator = $wrapper.find('.indicator');

        $board.pailer({
          'read': function(options) {
            var settings = $.extend({
              'offset': -1,
              'length': -1
            }, options);
            var url = `/mesos/files/read?path=${task.work_dir}/slaves/${task.slave_id}/frameworks/${task.framework_id}/executors/${task.id}/runs/${task.container_id}/${file}`
              + '&mesos_slave_host=' + task.hostname
              + '&mesos_slave_port=' + task.port
              + '&offset=' + settings.offset
              + '&length=' + settings.length
              + '&jsonp=?';
            return $.getJSON(url);
          },
          'indicator': $indicator
        });
      });
    });
  })();

  (function () {

    var interval = 5000;

    function suffixFormatter(val, axis) {
      if (val > 1000000)
        return (val / 1000000).toFixed(axis.tickDecimals) + " MB";
      else if (val > 1000)
        return (val / 1000).toFixed(axis.tickDecimals) + " kB";
      else
        return val.toFixed(axis.tickDecimals) + " B";
    }

    function fetch(range, type, mesos_task_id, callback) {
      $.get('/usage', {
        range: range,
        type: type,
        mesos_task_id: mesos_task_id
      }, callback);
    }

    function update(type, mesos_task_id) {
      var range = $('#usage-time-range label.active input').val();
      fetch(range, type, mesos_task_id, function (data) {
        plots[type].instances[mesos_task_id] = data.map(function(item) {
          return [item.time / 1000000, item.mean]
        });

        var plotData = [];
        for (var id in plots[type].instances) {
          plotData.push({
            data: plots[type].instances[id],
            label: mesos_task_id
          });
        }


        let options = {
          yaxis: { min: 0 },
          xaxis: { mode: "time" },
          legend: {
            noColumns: window.innerWidth > 1500 ? 2 : 1,
            container: $(".usage-type-" + type).parent().find('.usage-legend')
          },
          series: {
            lines: { show: true, fill: true },
            // points: { show: true }
          },
          grid: {
            hoverable: true,
            clickable: true
          }
        };

        if (type != 'cpu') {
          options.yaxis.tickFormatter = suffixFormatter;
        }

        $.plot(".usage-type-" + type + " .usage-placeholder", plotData, options);

        setTimeout(function () {
          update(type, mesos_task_id);
        }, interval);
      });
    }

    window.plots = {};

    [ 'cpu', 'memory', 'tx', 'rx' ].forEach(function (type) {
      var instances = {}
      APP_INFO.forEach(function(info) {
        instances[info.id] = [];
      });

      plots[type] = {
        instances: instances
      };

      APP_INFO.forEach(function(info) {
        update(type, info.id);
      });
    });
  })();

});
