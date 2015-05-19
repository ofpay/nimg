var fs = require("fs");
var util = require("../util");
var config = require("../config");
var crypto = require("crypto");
var EventProxy = require('eventproxy');


exports.exec = function (req, res) {
    var opt = req.body;
    var a = req.path.substr(1).split("/");
    var r = a[0];//get userpath from req path

    var imgpath;

    if (!req.files.userfile) {
        var json = util.wrap_msg(300, 'not get userfile!');
        res.json(json);
        res.end();
    }
    var tmp_path = req.files.userfile.path;
    console.log('tmp_path:' + tmp_path);

    var n = req.files.userfile.name;
    console.log('fileName:' + n);
    if (!n) {
        var json = util.wrap_msg(300, 'not get filename!');
        res.json(json);
        res.end();
    }

    var t = util.get_extension(n);
    console.log('fileType:' + t);
    if (!config.imgtypes[t]) {
        var json = util.wrap_msg(300, 'filetype error,not supported ' + t);
        res.json(json);
        res.end();
    }

    //var s = req.files.userfile.size;
    //console.log('filesize:' + s);
    //if (s > config.maxFileSize) {
    //    var json = util.wrap_msg(300, 'file to large,no more than ' + config.maxFileSize);
    //    res.json(json);
    //    res.end();
    //}


    //指定文件上传后的目录
    var md5sum = crypto.createHash('md5');

    var options = {
        flags: 'r',
        encoding: null,
        fd: null,
        mode: 0777,
        autoClose: true
    }

    var ep = new EventProxy();


    ep.tail('preEnd', function (err) {

        if (err) {
            console.log("err:" + err);
            var json = util.wrap_msg(300, 'crop error: ' + err);
            return res.json(json);
        }


        fs.stat(tmp_path, function (err, stats) {

            if (err) {
                var json = util.wrap_msg(300, 'upload err!');
                return res.json(json);
            }

            console.log('filesize:' + stats.size);
            if (stats.size > config.maxFileSize) {
                var json = util.wrap_msg(300, 'file to large size:'+stats.size+',no more than ' + config.maxFileSize);
                return res.json(json);
            }

            var readstream = fs.createReadStream(tmp_path, options);

            readstream.on('data', function (d) {
                md5sum.update(d);
            });

            readstream.on('end', function () {
                var d = md5sum.digest('hex');
                imgpath = util.getimgpath(r, d, t, 0, 0);

                console.log('imgpath:' + imgpath);

                var url = r + '/' + d + '.' + t;
                var json = util.wrap_msg(200, 'upload success!', {t: t, userpath: r, md5: d, url: url});
                res.json(json);
                res.end();
            });

            readstream.on('error', function (e) {
                console.log('%s:%s', new Date(), 'err:' + e);
                var json = util.wrap_msg(300, 'upload err!');
                res.json(json);
                res.end();
            });

            readstream.on('close', function () {
                util.save_img(tmp_path, imgpath)
            });
        });

    })


    //预处理
    if (opt.act) {
        var acts = {
            'crop': /^(\d{1,9}x\d{1,9}\+\d{1,9}\+\d{1,9})?$/,
            'rotate': /^(-?\d{1,3})?$/,
            'resize': /^(\d{1,9}x\d{1,9}!?)?$/
        };

        if (acts[opt.act]) {
            if (!opt.param || !acts[opt.act].test(opt.param)) {
                ep.emit('preEnd', "bad param!");
            } else {
                console.log("act:" + opt.act + "  param:" + opt.param);
                util.img_convert(tmp_path, opt.act, opt.param, function (e) {
                    ep.emit('preEnd', e);
                });
            }
        } else {
            ep.emit('preEnd', "not support the act!");
        }

    } else {
        ep.emit('preEnd');
    }


};
