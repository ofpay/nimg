/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var img = require('./routes/image');
var manage = require('./routes/manage');
var upload = require('./routes/upload');
var admin = require('./routes/admin');

var http = require('http');
var path = require('path');
var config = require("./config");

var fs = require('fs');
var errorLog = fs.createWriteStream(config.errorlog, {flags: 'a'});

process.on('uncaughtException', function (err) {
    console.trace(err);
    errorLog.write('\n[' + new Date + ']' + 'Caught exception: ' + err);
});

var start = function () {
    var app = express();

    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser({
        uploadDir: config.tmproot
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

    //index
    app.get('/', routes.index);

    //copy
    app.get('/copy', routes.copy);

    //get img
    app.get(/^\/\d{1,9}\/[0-9a-f]{32}(?:-\d+-\d+)?(-f|-s)?\.(jpg|jpeg|gif|png)$/, img.read);


    //img manage
    app.get(/^\/\d{1,9}\/[0-9a-f]{32}(?:-\d+-\d+)?(-f|-s)?\.(jpg|jpeg|gif|png)\/manage-(tleft|tright|del|resize|info)$/, manage.exec);


    //img upload
    app.post(/^\/\d{1,9}\/upload$/, upload.exec);

    //admin
    app.post('/admin', admin.exec);

	//nginx monitor
	app.get('/_jiankong.jsp', function (req, res) {
		res.send(200, 'ok');
		res.end();
	});



    http.createServer(app).listen(config.port, function () {
        console.log('%s:%s',new Date(),'server listening:' + config.port);
    });
}


start();

/******************************************************************
 * use cluster

var cpuNums = require('os').cpus().length;
var cluster = require('cluster');
var workers = {};
if (cluster.isMaster) {
    cluster.on('death', function (worker) {
        delete workers[worker.pid];
        worker = cluster.fork();
        workers[worker.pid] = worker;
    });
    for (var i = 0; i < cpuNums; i++) {
        var worker = cluster.fork();
        
        workers[worker.pid] = worker;
    }
} else {
    start();
}
 */
