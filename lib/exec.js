var _ = require('./utils');
var StreamCB = require('./streamcb');

function getStreamCB(method, request) {
    var once = new StreamCB(),
        clientArgs = (request) ? [request] : [];
    if (typeof this.opts.callback === 'function') {
        once.on('data', _.partial(this.opts.callback, null));
        once.on('error', this.opts.callback);
    }
    clientArgs.push(once.cb);
    this.client[method].apply(this.client, clientArgs);
    return once;
}

module.exports = {
    key: function (type) {
        return getStreamCB.call(this, type, this._req.key.call(this, type));
    },
    bucket: function () {
        var request = this._req.bucket.call(this),
        method = (request.props) ? 'setBucket' : 'getBucket';
        return getStreamCB.call(this, method, request);
    },
    buckets: function () {
        return getStreamCB.call(this, 'getBuckets');
    },
    counter: function () {
        var request = this._req.counter.call(this),
            method = request.amount ? 'updateCounter' : 'getCounter';
        return getStreamCB.call(this, method, request);
    },
    index: function () {
        var self = this,
            request, payload, push;
        if (this.range_min) {
            request = this._req.index_range.call(this);
        } else {
            request = this._req.index_exact.call(this);
        }
        var indexStream = this.client.getIndex(request);
        if (this.opts.callback) {
            payload = [];
            // push(array) is the equivalent of calling payload.push.apply(payload, array);
            push = payload.push.apply.bind(payload.push, payload);
            indexStream.on('error', this.opts.callback);
            indexStream.on('data', function (reply) {
                if (reply.continuation) self.continuation = reply.continuation;
                if (reply.keys) push(reply.keys);
            });
            indexStream.on('end', function () {
                var cbPayload = {keys: payload};
                if (self.continuation) cbPayload.continuation = self.continuation;
                self.opts.callback(null, cbPayload);
            }.bind(this));
        }
        return indexStream;
    },
    keys: function () {
        return this.client.getKeys(this._req._defaults(this), this.opts.callback);
    },
    search: function () {
        return getStreamCB.call(this, 'search', this._req.search.call(this));
    },
    mapreduce: function () {
        var request = this._req.mapreduce.call(this),
            readStream = this.client.mapred(request),
            payload;
        if (this.opts.callback) {
            payload = [];
            pusher = payload.push.apply.bind(payload.push, payload);
            readStream.on('error', this.opts.callback);
            readStream.on('data', function (data) { payload = payload.concat(data); });
            readStream.on('end', function () { this.opts.callback(null, payload); });
        }
        return readStream;
    },
    mapreduce_index: function (cb) {
        var type = (this.range_min) ? 'range' : 'exact';
        this.inputs = _.omit(this._req['index_'+type].call(this), 'content_type', 'return_body');
        return this._exec.mapreduce.call(this);
    },
    mapreduce_search: function (cb) {
        this.inputs = _.omit(this._req.search.call(this), 'content_type', 'return_body');
        return this._exec.mapreduce.call(this);
    }
};
