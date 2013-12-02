var fs = require("fs");
var util = require("../util");

/************
 * get img
 * @param req
 * @param res
 */
exports.read = function (req, res) {
    var a = util.decode_imgpath(req.path);
    var srcPath = util.getimgpath(a.r, a.d, a.t, 0, 0);

    if (a.w && a.h) {
        var dstPath = util.getimgpath(a.r, a.d, a.t, a.w, a.h);

        console.log('resize srcPath:' + srcPath);
        console.log('resize dstPath:' + dstPath);

        util.read_size_img(srcPath, dstPath, a.t, a.w, a.h, req, res);
    } else {
        util.read_img(srcPath, a.t, req, res);
    }
};


