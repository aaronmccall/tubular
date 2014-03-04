var _ = require('../lib/utils');

module.exports = {
    "slice can convert arguments to an array": function (test) {
        var testFn = function () {
            var args = _.slice(arguments);
            test.ok(Array.isArray(args), 'arguments converted to array');
            test.equal(args.length, arguments.length, 'args length equals arguments length');
            test.done();
        };
        testFn(1, 2);
    },

    "compose consumes n functions and returns their composition": function (test) {
        function one(str) { return 'one(' + str + ')'; }
        function two(str) { return 'two(' + str + ')'; }
        function three(str) { return 'three(' + str + ')'; }
        var composed = _.compose(one, two, three),
            result = composed('foo');
        test.equal(result, 'one(two(three(foo)))');
        test.done();
    },

    "fluent makes functions return their this context": function (test) {
        var fluentFn = _.fluent(function (arg) { return arg; }),
            arg = {},
            self = {},
            res = fluentFn.call(self, arg);
        test.strictEqual(res, self);
        test.notEqual(res, arg);
        test.done();
    },

    "partial prepends arguments to functions": function (test) {
        var arg1 = 1,
            arg2 = {},
            arg3 = [],
            partialFn = _.partial(function () {
                test.strictEqual(arguments[0], arg1);
                test.strictEqual(arguments[1], arg2);
                test.strictEqual(arguments[2], arg3);
                test.done();
            }, arg1, arg2);
        partialFn(arg3);
    },

    "omit": {
        "clones omitting blacklisted properties (array of names)": function (test) {
            var input = {foo: 'bar', baz: 'biz', buz: 'byz'},
                output = _.omit(input, ['foo', 'buz']);
            test.equal(Object.keys(output).length, 1);
            test.equal(output.foo, undefined);
            test.equal(output.buz, undefined);
            test.equal(output.baz, input.baz);
            test.done();
        },
        "clones omitting blacklisted properties (names as arguments)": function (test) {
            var input = {foo: 'bar', baz: 'biz', buz: 'byz'},
                output = _.omit(input, 'baz', 'buz');
            test.equal(Object.keys(output).length, 1);
            test.equal(output.foo, input.foo);
            test.equal(output.buz, undefined);
            test.equal(output.baz, undefined);
            test.done();
        }
    },

    "pick": {
        "clones picking only whitelisted properties (array of names)": function (test) {
            var input = {foo: 'bar', baz: 'biz', buz: 'byz'},
                output = _.pick(input, ['foo', 'buz']);
            test.equal(Object.keys(output).length, 2);
            test.equal(output.foo, input.foo);
            test.equal(output.buz, input.buz);
            test.equal(output.baz, undefined);
            test.done();
        },
        "clones picking only whitelisted properties (names as arguments)": function (test) {
            var input = {foo: 'bar', baz: 'biz', buz: 'byz'},
                output = _.pick(input, 'baz', 'buz');
            test.equal(Object.keys(output).length, 2);
            test.equal(output.foo, undefined);
            test.equal(output.buz, input.buz);
            test.equal(output.baz, input.baz);
            test.done();
        }
    },

    "extend applies properties from left to right (rightmost wins)": function (test) {
        var first = {foo: 'bar', baz: 'buz'},
            second = {bar: 'baz', baz: 'foo'},
            third = {buz: 'byz', baz: 'biz', foo: 'wha'},
            result = _.extend(first, second, third);
        test.equal(Object.keys(result).length, 4);
        test.equal(result.foo, third.foo);
        test.equal(result.bar, second.bar);
        test.equal(result.baz, third.baz);
        test.done();
    },

    "defaults applies properties from right to left": function (test) {
        var first = {foo: 'bar', baz: 'buz'},
            second = {bar: 'baz', baz: 'foo'},
            third = {bar: 'byz', baz: 'biz', foo: 'wha'},
            result = _.defaults(first, second, third);
        test.equal(Object.keys(result).length, 3);
        test.equal(result.foo, first.foo);
        test.equal(result.bar, second.bar);
        test.equal(result.baz, first.baz);
        test.done();
    }
};