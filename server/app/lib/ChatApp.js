// Generated by CoffeeScript 1.11.1
(function() {
  var ChatApp;

  ChatApp = (function() {
    function ChatApp(config) {
      this.config = config;
    }

    ChatApp.prototype.start = function() {
      this.initApp();
      this.initMongo();
      return this.startHttp();
    };

    ChatApp.prototype.initApp = function() {
      var adminApp, adminBasePath, adminHttp, bodyParser, express, path;
      express = require('express');
      this.app = express();
      bodyParser = require('body-parser');
      path = require('path');
      this.app.use(bodyParser.urlencoded({
        extended: true
      }));
      this.app.set('view engine', 'jade');
      this.app.use(express["static"](path.join(this.config.appFolder, 'public')));
      this.app.get('/', (function(req, res) {
        return res.sendFile(this.config.appFolder + '/index.html');
      }).bind(this));
      this.http = require('http').Server(this.app);
      adminApp = express();
      adminBasePath = path.normalize(this.config.appFolder + '/../../admin');
      adminApp.use(express["static"](adminBasePath + '/public'));
      adminApp.set('view engine', 'ejs');
      adminApp.set('views', adminBasePath + '/views');
      adminApp.engine('html', require('ejs').renderFile);
      adminApp.get('/', (function(req, res) {
        return res.render('index.html', {
          apiUri: this.config.host + ':' + this.config.port,
          adminPassword: this.config.adminPassword
        });
      }).bind(this));
      adminHttp = require('http').Server(adminApp);
      return adminHttp.listen(this.config.adminPort, (function() {
        return console.log('admin listening on *:' + this.config.adminPort);
      }).bind(this));
    };

    ChatApp.prototype.initMongo = function() {
      this.connectMongo((function(db) {
        var Server;
        Server = require('./Server');
        return new Server(this.config, this.app, db, require('socket.io')(this.http), require('jsonwebtoken'));
      }).bind(this));
      return this.initSession();
    };

    ChatApp.prototype.connectMongo = function(onConnect) {
      var mongoClient, mongodb;
      this.mongoUrl = 'mongodb://localhost:27017/' + this.config.dbName;
      mongodb = require('mongodb');
      mongoClient = mongodb.MongoClient;
      return mongoClient.connect(this.mongoUrl, (function(err, db) {
        console.log('mongo connected');
        db.ObjectID = function(id) {
          if (typeof id === 'string') {
            return mongodb.ObjectID(id);
          } else {
            return id;
          }
        };
        return onConnect(db);
      }).bind(this));
    };

    ChatApp.prototype.initSession = function() {
      var MongoStore, session;
      session = require('express-session');
      MongoStore = require('connect-mongo')(session);
      return this.app.use(session({
        cookie: {
          maxAge: 1000 * 60 * 2
        },
        secret: "session secret",
        store: new MongoStore({
          db: this.config.dbName,
          host: '127.0.0.1',
          port: 27017,
          collection: 'session',
          auto_reconnect: true,
          url: this.mongoUrl
        })
      }));
    };

    ChatApp.prototype.startHttp = function() {
      return this.http.listen(this.config.port, (function() {
        return console.log('listening on *:' + this.config.port);
      }).bind(this));
    };

    return ChatApp;

  })();

  module.exports = ChatApp;

}).call(this);

//# sourceMappingURL=ChatApp.js.map