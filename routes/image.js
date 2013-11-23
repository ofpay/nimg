var fs = require("fs");
var im = require('imagemagick');
var util = require("../util");

/************
 * get img
 * @param req
 * @param res
 */
exports.read=function(req,res){
    var d=req.path.substr(1);
    var w = req.query.w;
    var h = req.query.h;

    var srcPath= util.getimgpath(d, 0, 0);

    if(w&&h&&parseInt(w)!='NaN'&&parseInt(h)!='NaN'){
        var dstPath= util.getimgpath(d, w, h);

        console.log('resize srcPath:'+srcPath);
        console.log('resize dstPath:'+dstPath);

        //判断文件是否存在
        if(true==fs.existsSync(dstPath)){
            console.log('dstPath exists!');
            util.read_img(dstPath,req,res);
        }else{
            var resizeData = {
                srcPath: srcPath,
                dstPath: dstPath,
                width:w,
                height:h
            };

            im.resize(resizeData,function (err, stdout, stderr) {
                if (err) {
                    return res.send(500, err.message);
                }
                console.log('resize success! dstPath:'+resizeData.dstPath);
                util.read_img(resizeData.dstPath,req,res);
            });
        }


    }else{
        util.read_img(srcPath,req,res);
    }
};

