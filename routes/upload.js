var fs = require("fs");
var util = require("../util");
var config = require("../config");
var crypto=require("crypto");


exports.exec = function (req, res) {
    var imgpath;

    if (!req.files.userfile) {
        var json=util.wrap_msg(300,'not get userfile!');
        res.json(json);
        res.end();
    }
    var tmp_path = req.files.userfile.path;
    console.log('tmp_path:' + tmp_path);

    var fileName = req.files.userfile.name;
    console.log('fileName:'+fileName);
    if (!fileName) {
        var json=util.wrap_msg(300,'not filename!');
        res.json(json);
        res.end();
    }

    var filetype=util.get_extension(fileName);
    if(!config.imgtypes[filetype]){
        var json=util.wrap_msg(300,'filetype error,not supported '+filetype);
        res.json(json);
        res.end();
    }

    var filesize = req.files.userfile.size;
    console.log('filesize:'+filesize);
    if(filesize>config.maxFileSize){
        var json=util.wrap_msg(300,'file to large,no more than '+config.maxFileSize);
        res.json(json);
        res.end();
    }


    //指定文件上传后的目录
    var md5sum = crypto.createHash('md5');

    var options = { flags: 'r',
        encoding: null,
        fd: null,
        mode: 0777,
        autoClose: true
    }

    var readstream = fs.createReadStream(tmp_path, options);

    readstream.on('data', function (d) {
        md5sum.update(d);
    });

    readstream.on('end', function () {
        var d = md5sum.digest('hex');
        imgpath = util.getimgpath(d, 0, 0);

        console.log('imgpath:' + imgpath);
        console.log('res send md5:' + d);

        var json=util.wrap_msg(200,'upload success!',{md5:d});
        res.json(json);
        res.end();
    });

    readstream.on('error', function (e) {
        console.log('err:' + e);
        var json=util.wrap_msg(300,'upload err!');
        res.json(json);
        res.end();
    });

    readstream.on('close', function () {
        util.save_img(tmp_path, imgpath)
    });

};
