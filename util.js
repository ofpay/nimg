var fs = require("fs");
var path = require("path");
var config = require("./config");
var im = require('imagemagick');




var get_extension = function (filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i + 1).toLowerCase();
};

/************************
 * 定义返回的报文包体
 * @param code  200 success 300 error
 * @param msg
 * @param data
 */
var wrap_msg = function (code, msg, data) {
    var json = {
        code: code,
        msg: msg,
        data: data
    };

    return json;
}

/***************************
 * 根据md5值返回图片存储路径
 * @param d
 * @returns {string}
 */
var getimgpath = function (d, w, h) {
    var source = '0*0p';
    var imgroot = config.imgroot;
    var dir1 = str_hash(d, 0);
    var dir2 = str_hash(d, 3);
    var imgPath = imgroot + '/' + dir1 + '/' + dir2 + '/' + d;

    if (w == 0 && h == 0) {
        imgPath = imgPath + '/' + source;
    } else {
        imgPath = imgPath + '/' + w + '*' + h + 'p';
    }
    return imgPath;
}

/************
 * 对字符按下标截取3位后按16进制转换为10进制然后除3取整返回
 * @param str
 * @param index
 * @returns {Number}
 */
var str_hash = function (str, index) {
    var c;
    c = str.substr(index, 3);
    var d = parseInt(c, 16);
    d = d / 4;
    return parseInt(d);
}


/******************************
 * 创建多层目录
 * @param p
 * @param mode
 * @param made
 * @returns {*}
 */
var mkdirs = function (p, mode, made) {
    if (mode === undefined) {
        mode = 0777 & (~process.umask());
    }
    if (!made) made = null;

    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    try {
        fs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = mkdirs(path.dirname(p), mode, made);
                mkdirs(p, mode, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already. If so, then hooray! If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = fs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
}

/****************************
 * 存储图片文件
 * @param tmpImg
 * @param targetImg
 */
var save_img = function (tmpImg, targetImg) {
    var index = targetImg.lastIndexOf('/');
    //提取目录路径
    var dirs = targetImg.substr(0, index);
    //创建目录
    mkdirs(dirs, 0777);

    fs.rename(tmpImg, targetImg, function (err) {
        if (err) {
            console.error("saveImg rename err:" + err);
        } else {
            console.log('saveImg success! targetImg:' + targetImg);
            //删除临时文件夹文件,
            fs.unlink(tmpImg, function () {
                if (err) {
                    console.error("saveImg unlink error:" + err);
                } else {
                    console.log('unlink success! tmpImg:' + tmpImg);
                }
            });
        }
    });
}

var read_img = function (realPath, req, res) {
    fs.stat(realPath, function (err, stats) {
        if (err) {
            console.log('err:' + err);
            res.writeHead(404, "Not Found", {'Content-Type': 'text/plain'});
            res.write("This req URL " + realPath + " was not found on this server.");
            res.end();
        } else {
            if (stats.isDirectory()) {
                res.writeHead(404, "Not Found", {'Content-Type': 'text/plain'});
                res.write("This req URL " + realPath + " was not found on this server.");
                res.end();
            } else {
                //var ext = 'jpeg';// path.extname(realPath);
                //ext = ext ? ext.slice(1) : 'unknown';
                var contentType = "image/jpeg";//mime.types[ext] || "image/jpeg";

                res.setHeader("Content-Type", contentType);
                res.setHeader('Content-Length', stats.size);

                var lastModified = stats.mtime.toUTCString();
                var ifModifiedSince = "If-Modified-Since".toLowerCase();
                res.setHeader("Last-Modified", lastModified);

                var expires = new Date();
                expires.setTime(expires.getTime() + 60 * 60 * 24 * 365 * 1000);
                res.setHeader("Expires", expires.toUTCString());
                res.setHeader("Cache-Control", "max-age=" + 60 * 60 * 24 * 365);

                if (req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]) {
                    res.writeHead(304, "Not Modified");
                    res.end();
                } else {
                    var compressHandle = function (raw, statusCode, reasonPhrase) {
                        var stream = raw;
                        res.writeHead(statusCode, reasonPhrase);
                        stream.pipe(res);
                    };

                    if (req.headers["range"]) {
                        var range = utils.parseRange(req.headers["range"], stats.size);
                        if (range) {
                            res.setHeader("Content-Range", "bytes " + range.start + "-" + range.end + "/" + stats.size);
                            res.setHeader("Content-Length", (range.end - range.start + 1));
                            var raw = fs.createReadStream(realPath, {"start": range.start, "end": range.end});
                            compressHandle(raw, 206);
                        } else {
                            res.removeHeader("Content-Length");
                            res.writeHead(416);
                            res.end();
                        }
                    } else {
                        var raw = fs.createReadStream(realPath);
                        compressHandle(raw, 200);
                    }
                }
            }
        }
    });
};


exports.identify = identify;
exports.mkdirs = mkdirs;
exports.getimgpath = getimgpath;
exports.str_hash = str_hash;
exports.save_img = save_img;
exports.wrap_msg = wrap_msg;
exports.get_extension = get_extension;
exports.read_img = read_img;


