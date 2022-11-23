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
    stdMath = Math, PI = stdMath.PI, TWO_PI = 2 * stdMath.PI,
    isNode = ("undefined" !== typeof global) && ("[object global]" === toString.call(global)),
    isBrowser = ("undefined" !== typeof window) && ("[object Window]" === toString.call(window))
;

// basic backwards-compatible "class" construction
function makeClass(superklass, klass, statiks)
{
    var constructor = klass.constructor || function(){}, p;
    if (superklass)
    {
        constructor.prototype = Object.create(superklass.prototype);
        constructor.prototype.$super = superklass.prototype;
    }
    for (p in klass)
    {
        if (HAS.call(klass, p))
        {
            constructor.prototype[p] = klass[p];
        }
    }
    constructor.prototype.constructor = constructor;
    if (statiks)
    {
        for (p in statiks)
        {
            if (HAS.call(statiks, p))
            {
                constructor[p] = statiks[p];
            }
        }
    }
    return constructor;
}
