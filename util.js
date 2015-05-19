var fs = require("fs");
var path = require("path");
var config = require("./config");
var im = require('imagemagick');
var Q = require('q');


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

/***********************
 * 根据规则解析路径
 * @param imgPath  '/01/1ca1be3a020d9e4a2e5b6af1f80db92b.jpeg/convert'
 */
var decode_imgpath = function (imgPath) {
    var c;
    var a = imgPath.substr(1).split("/");
    var r = a[0];//user path
    var img = a[1];//img
    if (a.length > 2) {
        c = a[2].split("-")[1];//command
    }
    a = img.split(".");
    var anchor = a[0];//anchor
    var t = a[1];//img type
    a = anchor.split("-");//md5
    var d = a[0];

    var w = 0;
    var h = 0;
    if (a.length > 2) {
        w = parseInt(a[1]);
        if (w > config.maxSide) {
            w = config.maxSide;
        } else if (w < config.minSide) {
            w = config.minSide;
        }

        h = parseInt(a[2]);
        if (h > config.maxSide) {
            h = config.maxSide;
        } else if (h < config.minSide) {
            h = config.minSide;
        }
    }

    var x = '';
    //force resize by width and height
    if (a.length > 3) {
        x = a[3];
    }

    console.log('  r:' + r + '  d:' + d + '  w:' + w + '  h:' + h + '  t:' + t + '  c:' + c + '  x:' + x);
    return {
        r: r,
        d: d,
        w: w,
        h: h,
        t: t,
        c: c,
        x: x
    }
}

/********************************
 * 根据md5值返回图片存储路径
 * @param r  userpash
 * @param d  md5
 * @param t  type
 * @param w  width
 * @param h  height
 * @returns {string}
 */
var getimgpath = function (r, d, t, w, h, x) {
    var dir1 = str_hash(d, 0);
    var dir2 = str_hash(d, 3);
    var imgPath = config.imgroot + '/' + r + '/' + dir1 + '/' + dir2 + '/' + d + '-' + t;

    imgPath = imgPath + '/' + w + '*' + h + ((x) ? x : "") + 'p';
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
        mode = 0776 & (~process.umask());
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





/*****************************
 * 处理图片
 * @param srcPath
 * @param cmd
 * @param parm
 * @param req
 * @param res
 */
var img_convert = function (src, cmd, parm,cb) {
    return im.convert([src, '-' + cmd, parm, src],cb);
};

/**********************
 * 读取图像的信息
 * @param imgpath
 * @param req
 * @param res
 */
var img_info = function (imgpath, callback) {
    im.identify(imgpath, function (err, features) {
        var data = {};
        if (!err) {
            console.log(JSON.stringify(features));
            data = {
                width: features.width,
                height: features.height,
                filesize: features.filesize,
//                    origin_name:features.origin_name,
//                    ext:features.ext,
//                    owner:features.owner.
                createdate: features.properties['create-date'],
                modifydate: features.properties['modify-date'],
                format: features.format ? features.format.toLowerCase() : ''

            };
        }

        callback(err, data);
    });
};

/************
 * 删除图片
 * @param imgpath
 */
var del_img = function (imgpath, req, res) {
    console.log('del_img:' + imgpath);
    fs.unlink(imgpath, function (err) {
        if (err) {
            console.error("del_img unlink error:" + err);

            if (res) {
                var json = wrap_msg(301, 'delete err!', null);
                res.json(json);
                res.end();
            }

        } else {
            console.log('del_img unlink success! tmpImg:' + imgpath);
            if (res) {
                var json = wrap_msg(200, 'delete success!', null);
                res.json(json);
                res.end();
            }
        }
    });
};

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
    mkdirs(dirs, 0776, null);

    fs.rename(tmpImg, targetImg, function (err) {
        console.log('%s:%s', new Date(), 'tmpImg:' + tmpImg);
        console.log('%s:%s', new Date(), 'targetImg:' + targetImg);

        if (err) {
            console.error('%s:%s', new Date(), "saveImg rename err:" + err);
            console.trace(err);
        } else {
            console.log('%s:%s', new Date(), 'saveImg success! targetImg:' + targetImg);
        }
    });
}


/************************
 * Reads the specified size
 * @param srcPath
 * @param dstPath
 * @param filttype
 * @param width
 * @param height
 * @param req
 * @param res
 * @private
 */
var read_size_img = function (srcPath, dstPath, f, w, h, x, req, res) {
    fs.exists(dstPath, function (exists) {
        if (exists) {
            console.log('%s:%s', new Date(), 'dstPath exists!');
            read_img(dstPath, f, req, res);
        } else {
            im.convert([srcPath, '-resize', w + 'X' + h + (x === 'f' ? '!' : (x === 's' ? '^' : '')), dstPath],
                function (err, stdout) {
                    if (err) {
                        console.trace(err);
                        res.writeHead(404, "Not Found", {'Content-Type': 'text/plain'});
                        res.write("This image file was not found on this server.");
                        res.end();
                    } else {
                        console.log('%s:%s', new Date(), 'resize success! dstPath:' + dstPath);
                        read_img(dstPath, f, req, res);
                    }
                });
        }
    });
};//end fun

/****************************
 *  reead image
 * @param realPath
 * @param filetype
 * @param req
 * @param res
 */
var read_img = function (realPath, filetype, req, res) {
    fs.stat(realPath, function (err, stats) {
        if (err) {
            console.log('err:' + err);
            res.writeHead(404, "Not Found", {'Content-Type': 'text/plain'});
            res.write("This Image file was not found on this server.");
            res.end();
        } else {
            if (stats.isDirectory()) {
                res.writeHead(404, "Not Found", {'Content-Type': 'text/plain'});
                res.write("This image file was not found on this server~");
                res.end();
            } else {
                var contentType = config.imgtypes[filetype] || "image/jpeg";
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


/*****************
 *get imagepath by img
 * @param uid
 * @param img
 * @returns {string}
 */
var get_path = function (uid, img) {
    var a = img.split(".");
    if (a.length < 2)
        return "";
    return getimgpath(uid, a[0], a[1], 0, 0);
}


/*******************************
 * file copy
 * @param source
 * @param target
 * @param cb
 */
var file_copy = function (img, source, target) {
    var defer = Q.defer();
    //创建目录
    var path = target.substring(0, target.length - 5);
    console.log("path:" + path);
    mkdirs(path, 0776, null);

    var rd = fs.createReadStream(source);
    rd.on("error", function (err) {
        console.log("rd:" + err);
        defer.reject({img: img, err: err});
    });

    var wr = fs.createWriteStream(target);
    wr.on("error", function (err) {
        defer.reject({img: img, err: err});
    }).on("close", function () {
        defer.resolve({img: img, msg: "ok"});
    });

    rd.pipe(wr);
    return defer.promise;
}


/********************
 * batch copy
 * @param suid
 * @param tuid
 * @param img_arr
 * @returns {promise|*|Q.promise}
 */
var batch_file_copy = function (tuid, img_arr) {
    var defer = Q.defer();
    var the_promises = [];

    for (var i = 0; i < img_arr.length; i++) {
        var img = img_arr[i];

        if (!/^(\d{1,9}\/[0-9a-f]{32}(?:-\d+-\d+)?\.(jpg|jpeg|gif|png))$/.test(img)) {
            defer.reject("bad img path:" + img);
            break;
        }

        var suid = img.split('/')[0];
        var img_name = img.split('/')[1];

        if (suid == tuid) {
            defer.reject("can't copy img to self!");
            break;
        }

        var prom = file_copy(img, get_path(suid, img_name), get_path(tuid, img_name)).then(function (ret) {
            console.log("copy success! suid:" + suid + "  tuid:" + tuid + " img:" + ret.img + " ret:" + ret.msg);
            var name = ret.img.split('/')[1];
            return {img: ret.img, ret: 'ok', url: tuid + "/" + name};
        }, function (err) {
            console.log("copy fail~ suid:" + suid + "  tuid:" + tuid + " img:" + err.img + " err:" + err.err);
            return {img: img, ret: 'fail', err: 'img does not exist or has been deleted!'};
        });

        the_promises.push(prom);
    }

    Q.all(the_promises).then(function (ret) {
        defer.resolve(ret);
    }, function (err) {
        defer.reject(err);
    });
    return defer.promise;
}


/**********
 * copy img
 * @param req
 * @param res
 * @returns {ServerResponse}
 */
var copy_img = function (req, res) {
    var tuid = req.body.tuid;
    var imgs = req.body.imgs;

    if (!tuid || !imgs) {
        var json = wrap_msg(301, 'param error!');
        return res.json(json);
    }
    var img_arr = imgs.split(",");
    batch_file_copy(tuid, img_arr).then(function (retlist) {
        var json = wrap_msg(200, 'ok', {tuid: tuid, retlist: retlist});
        return res.json(json);
    }).catch(function (err) {
        var json = wrap_msg(300, 'fail', "copy error:" + err);
        return res.json(json);
    });
}

exports.copy_img = copy_img;
exports.img_convert = img_convert;
exports.read_size_img = read_size_img;
exports.del_img = del_img;
exports.decode_imgpath = decode_imgpath;
exports.mkdirs = mkdirs;
exports.getimgpath = getimgpath;
exports.str_hash = str_hash;
exports.save_img = save_img;
exports.wrap_msg = wrap_msg;
exports.get_extension = get_extension;
exports.read_img = read_img;
exports.img_info = img_info;




