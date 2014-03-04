var stream  = require('stream');
var util    = require('util');

function StreamCB() {
    stream.Readable.call(this, {objectMode: true});
}
util.inherits(StreamCB, stream.Readable);

StreamCB.prototype._read = function () {};

Object.defineProperty(StreamCB.prototype, 'cb', {
    get: function () {
        return function (err, reply) {
            if (this._readableState.ended) return;
            if (err) {
                this.push(null);
                this.emit('error', err);
                return;
            }
            if (reply) {
                this.push(reply);
            }
            this.push(null);
        }.bind(this);
    }
});

module.exports = StreamCB;
