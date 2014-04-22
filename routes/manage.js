var fs = require("fs");
var util = require("../util");
var config = require("../config");
/*************************
 * Image manane
 * @param req
 * @param res
 */
exports.exec = function (req, res) {
  var a = util.decode_imgpath(req.path);
  var srcPath = util.getimgpath(a.r, a.d, a.t, a.w, a.h, a.x);
  console.log('srcPath:' + srcPath);

  fs.exists(srcPath, function (exists) {
    if (!exists) {
      return  res.json(util.wrap_msg(404, 'img not found!'));
    }

    switch (a.c) {
      case 'tleft' :
        console.log('%s:%s', new Date(), '==========tleft===========');
        util.img_convert(srcPath, 'rotate', '-90', req, res);
        break;
      case 'tright' :
        console.log('%s:%s', new Date(), '==========tright===========');
        util.img_convert(srcPath, 'rotate', '90', req, res);
        break;
      case 'resize' :
        console.log('%s:%s', new Date(), '==========resize===========');
        var paramReg = /^(\d{1,5}X\d{1,5})[!]?$/;
        var param = req.query.a;
        if (!param || !paramReg.test(param)) {
          var json = util.wrap_msg(301, 'param error!');
          res.json(json);
          res.end();
        } else {
          util.img_convert(srcPath, 'resize', param, req, res);
        }
        break;
      case 'del' :
        console.log('%s:%s', new Date(), '==========del===========');
        util.del_img(srcPath, req, res);
        break;
      case 'delall' :
        console.log('%s:%s', new Date(), '==========delall===========');
        util.del_img(srcPath, req, res);
        break;
      case 'info' :
        console.log('%s:%s', new Date(), '==========info===========');
        util.img_info(srcPath, function (err, data) {
          if (err) {
            var json = util.wrap_msg(301, 'read image data fail!', null);
            res.json(json);
            res.end();
          } else {
            var json = util.wrap_msg(200, 'success!', data);
            res.json(json);
            res.end();
          }
        });
        break;
      case 'crop' :
        console.log('%s:%s', new Date(), '==========crop===========');
        var paramReg = /^(\d{1,5},\d{1,5},\d{1,5},\d{1,5})?$/;
        var param = req.query.a;
        console.log('param:' + req.query.a);


        if (!param || !paramReg.test(param)) {
          var json = util.wrap_msg(301, 'param error!');
          res.json(json);
          res.end();
        } else {
          var paramArr = param.split(',');
          param = paramArr[0] + 'X' + paramArr[1] + '+' + paramArr[2] + '+' + paramArr[3];
          util.img_convert(srcPath, 'crop', param, req, res);
        }
        break;
      default:
        var json = util.wrap_msg(301, 'wrong  path!');
        res.json(json);
        res.end();
        break;
    }

  });
};


/***************************
 * 目录管理
 * @param req
 * @param res
 */
exports.dir = function (req, res) {
  var a = util.decode_imgpath(req.path)
  console.dir(a);

  var userdir = config.imgroot + '/' + a.r + '/';
  util.read_size(userdir, function (err, size) {
    if (err) {
      console.error("rede_size err:" + err);
      return res.json(util.wrap_msg(500, 'server error!'));
    }
    console.log(userdir + " total:" + size);
    var json = util.wrap_msg(200, 'success!', {userpath: a.r,total: size});
    return  res.json(json);
  });
}







