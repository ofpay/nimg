
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var img = require('./routes/image');
var upload = require('./routes/upload');
var http = require('http');
var path = require('path');
var config = require("./config");

exports.apppath = __dirname;

var fs=require('fs');
var errorLog=fs.createWriteStream(config.errorlog,{flags:'a'});

process.on('uncaughtException', function (err) {
    errorLog.write('['+new Date+']'+'Caught exception: ' + err);
});

var app = express();

// all environments

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.bodyParser({
    uploadDir:config.tmproot
}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);


app.get(/^\/[0-9a-f]{32}$/, img.read);

//上传
app.post('/upload', upload.exec);


http.createServer(app).listen(config.port, function(){
  console.log('server listening:' + config.port);
});


