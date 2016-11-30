// Generated by CoffeeScript 1.11.1
(function() {
  module.exports = {
    startCollecting: function(server) {
      var getSize;
      getSize = require('get-folder-size');
      return setInterval(function() {
        return getSize(server.config.appFolder + '/public/uploads', function(err, uploadsSize) {
          return server.db.stats(function(err, dbStat) {
            return server.db.collection('stat').insert({
              time: new Date().getTime(),
              memory: process.memoryUsage().rss,
              cpu: process.cpuUsage().user,
              dbSize: dbStat.dataSize,
              uploadsSize: uploadsSize
            });
          });
        });
      }, 60000 * 10);
    },
    titles: {
      memory: 'Memory',
      cpu: 'CPU',
      dbSize: 'Database Size',
      uploadSize: 'Uploads folder size'
    },
    adminResultHandler: function(server, req, res) {
      if (!req.query.password) {
        res.status(404).send({
          error: 'no password'
        });
      }
      if (req.query.password !== server.config.adminPassword) {
        res.status(404).send({
          error: 'wrong password'
        });
      }
      return server.db.collection('stat').find({
        $query: {},
        $orderby: {
          time: -1
        }
      }).limit(20).toArray((function(err, records) {
        var grids, key;
        if (!records) {
          console.log('no stat');
          return;
        }
        grids = [];
        for (key in this.titles) {
          grids.push(this.formatGridData(key, records));
        }
        res.header('Access-Control-Allow-Origin', '*');
        return res.send({
          grids: grids
        });
      }).bind(this));
    },
    tts: function(timestamp) {
      var date, formattedTime, hours, minutes;
      date = new Date(timestamp);
      hours = date.getHours();
      minutes = "0" + date.getMinutes();
      formattedTime = hours + ':' + minutes.substr(-2);
      return formattedTime;
    },
    formatGridData: function(key, records) {
      var i, j, json, len, v;
      json = {
        title: this.titles[key],
        lables: [],
        data: []
      };
      i = 0;
      for (j = 0, len = records.length; j < len; j++) {
        v = records[j];
        i++;
        json.lables.push(this.tts(v.time));
        json.data.push(v[key]);
      }
      return json;
    }
  };

}).call(this);

//# sourceMappingURL=stat.js.map
