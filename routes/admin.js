var fs = require("fs");
var util = require("../util");


/*************
 * Image admin
 * @param req
 * @param res
 */
exports.exec = function (req, res) {

    var opt = req.body;

    if (!opt.act) {
        var json = util.wrap_msg(301, 'param error!');
        return res.json(json);
    }

    if (opt.act == 'copy') {
        console.log('%s:%s', new Date(), '==========copy===========');
        util.copy_img(req, res);
    } else {
        var json = util.wrap_msg(301, 'bad act!');
        res.json(json);
        res.end();
    }

}









