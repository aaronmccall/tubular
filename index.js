var _           = require('./lib/utils');
var request     = require('./lib/request');
var exec        = require('./lib/exec');
var StreamCB    = require('./lib/streamcb');

function mergeTypes() {
    var args = _.slice(arguments, 0),
        len = args.length,
        types = [], arg;
    for (;len--;) {
        arg = args[len];
        if (!arg || ~types.indexOf(arg)) continue;
        types.unshift(arg);
    }
    return types.join('_');
}

function RiakQuery(bucket, client) {
    if (!(this instanceof RiakQuery)) {
        return new RiakQuery(bucket, client);
    }
    if (!client && typeof bucket !== 'string') {
        client = bucket;
        bucket = '';
    }
    this.opts = { bucket: bucket };
    this.client = client;
}

var proto = {
    // This is the base method for all key-based requests: (get|update)Counter, del, get, put
    _key: function (type, key) {
        this.opts.type = type;
        this.opts.key = key;
    },
    buckets: function () {
        this.opts.type = 'buckets';
    },
    bucket: function (bucket) {
        this.opts.type = 'bucket';
        this.opts.bucket = bucket || this.opts.bucket;
    },
    index: function (index, key, max) {
        this.opts.type = this.opts.type === 'mapreduce' ? mergeTypes(this.opts.type, 'index') : 'index';
        this.opts.index = index;
        if (max) {
            this.opts.range_min = key;
            this.opts.range_max = max;
        } else {
            this.opts.key = key;
        }
    },
    keys: function (bucket) {
        if (bucket) this.opts.bucket = bucket;
        this.type = 'keys';
    },
    mapreduce: function (inputs, query) {
        this.opts.type = mergeTypes('mapreduce', this.opts.type);
        if (!query) {
            this.opts.query = inputs;
            return this;
        }
        this.opts.inputs = inputs;
        this.opts.query = query;
    },
    payload: function (payload) {
        this.opts.payload = payload;
    },
    search: function (index, query) {
        this.opts.type = this.opts.type === 'mapreduce' ? mergeTypes(this.opts.type, 'search') : 'search';
        if (!query) {
            this.opts.index = this.bucket;
            this.opts.key = index;
            return this;
        }
        this.opts.index = index;
        this.opts.key = query;
    }
};


function popArg(type, target, fn) {
    return function () {
        var args;
        if (arguments.length > 0) {
            args = _.slice(arguments);
            if (typeof args[args.length-1] === type) {
                this.opts[target] = args.pop();
            }
        }
        return fn.apply(this, args);
    };
}

var getCallback = _.partial(popArg, 'function', 'callback');

var getPayload = _.partial(popArg, 'object', 'payload');

var payloadable = ['_key', 'bucket'];
var methodName, fn;
for (methodName in proto) {
    fn = proto[methodName];
    if (!!~payloadable.indexOf(methodName)) fn = getPayload(fn);
    RiakQuery.prototype[methodName] = _.fluent(getCallback(fn));
}

RiakQuery.prototype.execute = getCallback(getPayload(function () {
    return this._exec[this.opts.type].call(this);
}));
RiakQuery.prototype._req = request;
RiakQuery.prototype._exec = exec;

['counter', 'del', 'get', 'put'].forEach(function (method) {
    this[method] = _.partial(this._key, method);
    this._exec[method] = _.partial(this._exec.key, method);
}, RiakQuery.prototype);
RiakQuery.mergeTypes = mergeTypes;
module.exports = RiakQuery;