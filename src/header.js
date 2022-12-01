/**
*   Geometrize
*   computational geometry and rendering library for JavaScript
*
*   @version @@VERSION@@ (@@DATE@@)
*   https://github.com/foo123/Geometrize
*
**/
!function(root, name, factory) {
"use strict";
if (('object' === typeof module) && module.exports) /* CommonJS */
    (module.$deps = module.$deps||{}) && (module.exports = module.$deps[name] = factory.call(root));
else if (('function' === typeof define) && define.amd && ('function' === typeof require) && ('function' === typeof require.specified) && require.specified(name) /*&& !require.defined(name)*/) /* AMD */
    define(name, ['module'], function(module) {factory.moduleUri = module.uri; return factory.call(root);});
else if (!(name in root)) /* Browser/WebWorker/.. */
    (root[name] = factory.call(root)||1) && ('function' === typeof(define)) && define.amd && define(function() {return root[name];});
}(  /* current root */          'undefined' !== typeof self ? self : this,
    /* module name */           "Geometrize",
    /* module factory */        function ModuleFactory__Geometrize(undef) {
"use strict";

var HAS = Object.prototype.hasOwnProperty,
    toString = Object.prototype.toString,
    def = Object.defineProperty,
    stdMath = Math, abs = stdMath.abs,
    sqrt = stdMath.sqrt, pow = stdMath.pow,
    PI = stdMath.PI, TWO_PI = 2*PI, EPS = 1e-10/*Number.EPSILON*/,
    sqrt2 = sqrt(2), sqrt3 = sqrt(3),
    EMPTY_ARR = [], EMPTY_OBJ = {},
    isNode = ("undefined" !== typeof global) && ("[object global]" === toString.call(global)),
    isBrowser = ("undefined" !== typeof window) && ("[object Window]" === toString.call(window))
;

// basic backwards-compatible "class" construction
function makeClass(superklass, klass, statiks)
{
    var C = HAS.call(klass, 'constructor') ? klass.constructor : function() {}, p;
    C.prototype.$super = function(method, args) {};
    if (superklass)
    {
        /*if (Object.setPrototypeOf)
        {
            Object.setPrototypeOf(C, Object.create(superklass.prototype));
        }
        else
        {*/
            C.prototype = Object.create(superklass.prototype);
        /*}*/
        C.prototype.$super = (function(superklass) {
            return function $super(method, args) {
                var self = this, ret;
                self.$super = superklass.prototype.$super;
                //return Function.prototype.bind.call('constructor' === method ? superklass : superklass.prototype[method], self);
                ret = ('constructor' === method ? superklass : superklass.prototype[method]).apply(self, args || []);
                self.$super = $super;
                return ret;
            };
        })(superklass);
    }
    C.prototype.constructor = C;
    for (p in klass)
    {
        if (HAS.call(klass, p) && ('constructor' !== p))
        {
            C.prototype[p] = klass[p];
        }
    }
    if (statiks)
    {
        for (p in statiks)
        {
            if (HAS.call(statiks, p))
            {
                C[p] = statiks[p];
            }
        }
    }
    return C;
}
