var printf = require('util').format;
var RiakQuery = require('../');
// var riak = require('../lib/fakeriak');
// var fixtures = require('../lib/fixtures');
// var client = riak.init(fixtures.riak);
var bucket = 'foo';
var methods = ['bucket', 'buckets', 'counter', 'del', 'get', 'index', 'mapreduce', 'put', 'search'];
var payloadable = ['bucket', 'counter', 'del', 'get', 'put'];

module.exports = {
    setUp: function (cb) {
        this.query = new RiakQuery(bucket);
        cb();
    },
    tearDown: function (cb) {
        cb();
    },
    "by default query type is undefined": function (test) {
        test.strictEqual(this.query.opts.type, undefined, "query type is undefined: " + this.query.opts.type);
        test.done();
    },
    "bucket and client are set properly when passed as args": function (test) {
        var client = {},
            query = new RiakQuery(bucket, client);
        test.equal(query.opts.bucket, bucket, "bucket is set properly");
        test.equal(query.client, client, "client is set properly");
        test.done();
    },
    "all setter methods return query": function (test) {
        var self = this;
        test.expect(methods.length);
        methods.forEach(function (method) {
            test.strictEqual(self.query[method](), self.query, method + ' returns query');
        });
        test.done();
    },
    "all setter methods set type": function (test) {
        var self = this;
        test.expect(methods.length);
        methods.forEach(function (method) {
            var q = self.query[method]();
            test.strictEqual(q.opts.type, method, method + ' sets type to ' + method);
            q.opts.type = undefined;
        });
        test.done();
    },
    "all setter methods can set callback": function (test) {
        var self = this, fn = function () {};
        test.expect(methods.length);
        methods.forEach(function (method) {
            self.query[method](fn);
            test.equal(self.query.opts.callback, fn, 'callback set properly');
        });
        test.done();
    },
    "payloadable methods can set payload": function (test) {
        var self = this, payload = {};
        payloadable.forEach(function (method) {
            var q = self.query[method](payload);
            test.equal(q.opts.payload, payload);
        });
        test.done();
    },
    "#get, #put, and #del set key": function (test) {
        var key = 'bar',
            methods = ['del', 'get', 'put'];
        this.query.payload = {};
        methods.forEach(function (method) {
            var q = this.query[method](key);
            test.equal(q.opts.key, key);
        }, this);
        test.done();
    },
    "#index (two arg) and #search set index and key": function (test) {
        var methods = ['index', 'search'],
            index = 'bar',
            key = 'baz';
        methods.forEach(function (method) {
            var q = this.query[method](index, key);
            test.equal(q.opts.index, 'bar', method + ' set index properly');
            test.equal(q.opts.key, 'baz', method + ' set key properly');
        }, this);
        test.done();
    },
    "#index (three arg) sets index, range_min, range_max": function (test) {
        var index = 'foo', min = 1, max = 10, q =this.query.index(index, min, max);
        test.equal(q.opts.index, index, 'index as expected');
        test.equal(q.opts.range_min, min, 'range_min set correctly');
        test.equal(q.opts.range_max, max, 'range_max set correctly');
        test.done();
    },
    "#mapreduce sets inputs, and query": function (test) {
        var inputs = {}, query = [], q = this.query.mapreduce(inputs, query);
        test.equal(q.opts.inputs, inputs, 'inputs set correctly');
        test.equal(q.opts.query, query, 'query set correctly');
        test.done();
    }
    
    /*
    ,
    "": function (test) {
        
        test.done();
    }
    */
};
