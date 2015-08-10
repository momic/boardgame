/**
 * Older browsers does not support Object.create()
 */
if (Object.create === undefined) {
       Object.create = function (proto) {
           function Tmp() {}
           Tmp.prototype = proto;
           // New empty object whose prototype is proto
           return new Tmp();
       };
}

/**
 * Extend - copy onw propertyes from source to target
 */
function extend(target, source) {
      Object.getOwnPropertyNames(source).forEach(function(propName) {
          Object.defineProperty(target, propName,
              Object.getOwnPropertyDescriptor(source, propName));
      });
      return target;
}

/**
 * Inherit
 */
function inherits(SubC, SuperC) {
       var subProto = Object.create(SuperC.prototype);
       // At the very least, we keep the "constructor" property
       // At most, we keep additions that have already been made
       extend(subProto, SubC.prototype);
       SubC.prototype = subProto;
       SubC._super = SuperC.prototype;
};
  
/**
 * protoChain(obj_0, obj_1, ..., obj_n-1, obj_n)
 */  
function protoChain() {
    if (arguments.length === 0) return null;
    var prev = arguments[0];
    for(var i=1; i < arguments.length; i++) {
        // Create duplicate of arguments[i] with prototype prev
        prev = Object.create(prev);
        extend(prev, arguments[i]);
    }
    return prev;
}  

/**
 * check if variable is undefined
 */
function isUndefined(x, value) {
    return (typeof x !== 'undefined' ? x : value);
}