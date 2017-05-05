/**
 * Older browsers does not support Object.create()
 */
if (Object.create === undefined) {
    Object.create = function (proto) {
        function Tmp() {
        }

        Tmp.prototype = proto;
        // New empty object whose prototype is proto
        return new Tmp();
    };
}

(function (exports) {

    /**
     * Extend - copy own properties from source to target
     */
    var extend = function (target, source) {
        Object.getOwnPropertyNames(source).forEach(function (propName) {
            Object.defineProperty(target, propName,
                Object.getOwnPropertyDescriptor(source, propName));
        });
        return target;
    };

    /**
     * Inherit
     */
    exports.inherits = function (SubC, SuperC) {
        var subProto = Object.create(SuperC.prototype);
        // At the very least, we keep the "constructor" property
        // At most, we keep additions that have already been made
        extend(subProto, SubC.prototype);
        SubC.prototype = subProto;
        SubC._super    = SuperC.prototype;
    };

    /**
     * protoChain(obj_0, obj_1, ..., obj_n-1, obj_n)
     */
    exports.protoChain = function () {
        if (arguments.length === 0) return null;
        var prev = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            // Create duplicate of arguments[i] with prototype prev
            prev = Object.create(prev);
            extend(prev, arguments[i]);
        }
        return prev;
    };

    /**
     * check if variable is undefined
     */
    exports.isUndefined = function (x, value) {
        return (typeof x !== 'undefined' ? x : value);
    };

    /**
     * @param {string} type
     * @returns {Function} A function that tests for type.
     */
    exports.is = function (type) {
        var string = '[object ' + type + ']';
        return function (object) {
            return Object.prototype.toString.call(object) === string;
        };
    };

    exports.isArray    = exports.is('Array');
    exports.isString   = exports.is('String');
    exports.isBoolean  = exports.is('Boolean');
    exports.isNumber   = exports.is('Number');
    exports.isFunction = exports.is('Function');
    exports.isDate     = exports.is('Date');
    exports.isRegExp   = exports.is('RegExp');
    exports.isObject   = exports.is('Object');

})((typeof exports === 'undefined') ? this['utils'] = {} : exports);



