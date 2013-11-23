exports.tmproot='/node/temp'; //上传临时目录
exports.imgroot='/node/img'; //图片存储目录
exports.errorlog='/node/error.log'; //程序错误日志，记录
exports.port=9000;
exports.appname='NImg';
exports.maxFileSize=1024*1024;//1024kb 1mb

exports.imgtypes={
        "gif": "image/gif",
       // "tiff": "image/tiff",
       // "ico": "image/x-icon",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "png": "image/png"
};