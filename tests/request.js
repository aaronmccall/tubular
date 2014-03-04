var _ = require('underscore');
var RiakQuery = require('../');

module.exports = {
    setUp: function (cb) {
        this.query = new RiakQuery('foo');
        this.baseReq = this.query._req._defaults(this.query);
        cb();
    },
    "request.defaults adds bucket, key, content_type, and return_body": function (test) {
        var request = this.query._req._defaults(this.query);
        test.equal(request.content_type, 'application/json');
        test.equal(request.bucket, this.query.opts.bucket);
        test.equal(request.key, this.query.key);
        test.done();
    },
    "request.get adds key to base request": function (test) {
        test.equal(this.query.key, undefined, 'key starts as undefined');
        var req = this.query.get('bar')._req.key.call(this.query);
        test.equal(req.key, 'bar', 'key should be \'bar\'');
        test.done();
    },
    "request.put adds bucket, key, and content to base request": function (test) {
        var payload = {value: {baz: 'biz'}},
            req = this.query.put('bar').payload(payload)._req.key.call(this.query, 'put'),
            expected = _.extend({}, this.baseReq, {bucket: req.bucket, key: req.key, content: req.content });
        test.ok(_.isEqual(expected, req), JSON.stringify({expected: expected, actual: req}));
        test.done();
    }
};