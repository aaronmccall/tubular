var exports = module.exports = {};
var slice = Array.prototype.slice.call.bind(Array.prototype.slice);
exports.slice = slice;

function compose() {
    var funcs = arguments;
    return function() {
        var args = arguments,
            f = funcs.length;
        for (; f--;) {
            args = [funcs[f].apply(this, args)];
        }
        return args[0];
    };
}
exports.compose = compose;

function fluent(fn) {
    return function () {
        fn.apply(this, arguments);
        return this;
    };
}
exports.fluent = fluent;

function partial(fn) {
    var largs = slice(arguments, 1);
    return function () {
        return fn.apply(this, largs.concat(slice(arguments,0)));
    };
}
exports.partial = partial;

function omit(obj) {
    var drop = slice(arguments, 1),
        clone = {}, key;
    if (drop.length === 1 && Array.isArray(drop[0])) {
        drop = drop[0];
    }
    for (key in obj) {
        if (!~drop.indexOf(key)) clone[key] = obj[key];
    }
    return clone;
}
exports.omit = omit;

function pick(obj) {
    var keep = slice(arguments, 1),
        clone = {}, key;
    if (keep.length === 1 && Array.isArray(keep[0])) {
        keep = keep[0];
    }
    for (key in obj) {
        if (!!~keep.indexOf(key)) clone[key] = obj[key];
    }
    return clone;
}
exports.pick = pick;

function extend(target) {
    var sources = slice(arguments, 1),
        len = sources.length,
        i = 0,
        source, key;
    for (; i<len; i++) {
        source = sources[i];
        for (key in source) {
            target[key] = source[key];
        }
    }
    return target;
}
exports.extend = extend;

function defaults(target) {
    var sources = slice(arguments, 1);
    sources.reverse();
    sources.push(target);
    return extend.apply(null, sources);
}
exports.defaults = defaults;
