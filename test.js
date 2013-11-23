
/**
 * Module dependencies.
 */

var util = require("./util");

var p='d:/tmp/foo/bar/baz/sdf/';

var index=p.lastIndexOf('/');

//var ret=util.mkdirs('d:/tmp/foo/bar/baz/sdf');
console.log(index);

var str=p.substr(0,index);
console.log(str);

var filtype=util.get_extension('sdfsad.JPEG');
console.log(filtype);

console.log('=============================================');
var ret=util.identify('/node/NImg/2.png');
console.log(ret.format.toLowerCase());





