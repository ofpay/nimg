exports = module.exports = Store;

var EventEmitter = process.EventEmitter;

function Store (options) {
    this.options = options;
};

/**
 * 从EventEmitter继承.
 */

Store.prototype.__proto__ = EventEmitter.prototype;

Store.prototype.readimg = function (m,w,h,x,req,res) {

};