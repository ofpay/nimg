var fs = require("fs");
var util = require("../util");

/*************************
 * Image manane
 * @param req
 * @param res
 */
exports.exec = function (req, res) {
    var a = util.decode_imgpath(req.path);
    var srcPath = util.getimgpath(a.r, a.d, a.t, a.w, a.h);
    console.log('srcPath:' + srcPath);

    fs.exists(srcPath, function (exists) {
        if (!exists) {
            var json = util.wrap_msg(404, 'img not found!');
            res.json(json);
            res.end();
        } else {
            switch (a.c) {
                case 'tleft' :
                    console.log('==========tleft===========');
                    util.img_convert(srcPath, 'rotate', '-90', req, res);
                    break;
                case 'tright' :
                    console.log('==========tright===========');
                    util.img_convert(srcPath, 'rotate', '90', req, res);
                    break;
                case 'resize' :
                    console.log('==========resize===========');
                    var param = req.query.a;
                    if (!param) {
                        var json = util.wrap_msg(301, 'param error!');
                        res.json(json);
                        res.end();
                    } else {
                        util.img_convert(srcPath, 'resize', param, req, res);
                    }
                    break;
                case 'del' :
                    console.log('==========del===========');
                    util.del_img(srcPath, req, res);
                    break;
                default:
                    var json = util.wrap_msg(301, 'wrong  path!');
                    res.json(json);
                    res.end();
                    break;
            }
        }
    });
};







