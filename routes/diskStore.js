/**
 * Created with IntelliJ IDEA.
 * User: freeman983
 * Date: 13-12-7
 * Time: 下午3:57
 * To change this template use File | Settings | File Templates.
 */

/***************************
 * delete imgfile
 * @param imgpath
 * @param callback
 */
exports.del_img = function (imgpath, callback) {
    console.log('del_img:' + imgpath);
    fs.unlink(imgpath, function (err) {
        callback(err);
    });
};


/****************************
 * read image
 * @param realPath
 * @param filetype
 * @param req
 * @param res
 */
exports.read_img = function (options, callback) {
    fs.stat(options.realPath, function (err, stats) {
        if (!err) {
            console.log('err:' + err);
            callback({code: 404, msg: 'This image file was not found on this server'});
        } else {
            if (stats.isDirectory()) {
                callback({code: 404, msg: 'This image file was not found on this server'}, null);
            } else {
                callback({code: 200, msg: 'ok', filetype: options.filtype, realpath: options.realPath});
            }
        }
    });
};


/************************************
 * create ReadStream
 * @param realPath
 * @param options
 * @returns {*}
 */
exports.createReadStream = function (realPath, options) {
    if (options && options.start && options.end) {
        return fs.createReadStream(realPath, {"start": options.start, "end": options.end});
    }
    return  fs.createReadStream(realPath);
};