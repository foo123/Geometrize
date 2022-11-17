/**
*   Geometrize
*   computational geometry and rendering library for JavaScript
*
*   @version 0.1.0
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
    stdMath = Math, EPSILON = Number.EPSILON,
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
function onObservableChange(cb, add)
{
    var self = this, index;
    if (is_function(cb))
    {
        if (false === add)
        {
            index = self.$cb.indexOf(cb);
            if (-1 !== index) self.$cb.splice(index, 1);
        }
        else
        {
            index = self.$cb.indexOf(cb);
            if (-1 !== index) self.$cb.push(cb);
        }
    }
}
function observeArray(array)
{
    if (onObservableChange === array.onChange) return array;

    var notify = debounce(function(array, item, index, method) {
        array.$cb.forEach(function(cb) {cb(array, item, index, method);});
    }, 10);
    var methodInterceptor = function(array, notify) {
        var interceptor = function(array, method, notify) {
            return function() {
                var initialLength = array.length;
                var result = Array.prototype[method].apply(array, arguments);
                if ('push' === method || 'unshift' === method || 'splice' === method)
                {
                    itemInterceptor(array, initialLength, array.length, notify);
                }
                notify(array, null, null, method);
                return result;
            };
        };
        ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(function(method) {
            array[method] = interceptor(array, method, notify);
        });
        return array;
    };

    var itemInterceptor = function(array, start, stop, notify) {
        var interceptor = function(array, index, notify) {
            var key = String(index), val = array[index];
            Object.defineProperty(array, key, {
                get() {
                    return val;
                },
                set(value) {
                    if (val !== value)
                    {
                        val = value;
                        notify(array, val, index, 'set');
                    }
                },
                enumerable: true
            });
        };
        for (var index=start; index<stop; ++index)
        {
            interceptor(array, index, notify);
        }
        return array;
    };
    array = itemInterceptor(methodInterceptor(array, notify), 0, array.length, notify);
    array.$cb = [];
    array.onChange = onObservableChange;
    return array;
}

// 2D Transformation Matrix class
var Matrix = makeClass(null, {
    constructor: function Matrix(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
        var self = this;
        if (m00 instanceof Matrix)
        {
            return m00;
        }
        if (!(self instanceof Matrix))
        {
            return new Matrix(m00, m01, m02, m10, m11, m12, m20, m21, m22);
        }
        if (is_array(m00) && 9 <= m00.length)
        {
            self.m00 = m00[0] || 0;
            self.m01 = m00[1] || 0;
            self.m02 = m00[2] || 0;
            self.m10 = m00[3] || 0;
            self.m11 = m00[4] || 0;
            self.m12 = m00[5] || 0;
            self.m20 = m00[6] || 0;
            self.m21 = m00[7] || 0;
            self.m22 = m00[8] || 0;
        }
        else
        {
            self.m00 = m00 || 0;
            self.m01 = m01 || 0;
            self.m02 = m02 || 0;
            self.m10 = m10 || 0;
            self.m11 = m11 || 0;
            self.m12 = m12 || 0;
            self.m20 = m20 || 0;
            self.m21 = m21 || 0;
            self.m22 = m22 || 0;
        }
    },
    m00: 1
    m01: 0,
    m02: 0,
    m10: 0,
    m11: 1,
    m12: 0,
    m20: 0,
    m21: 0,
    m22: 1,
    add: function (other) {
        var self = this;
        return other instanceof Matrix ? new Matrix(
            self.m00+other.m00,
            self.m01+other.m01,
            self.m02+other.m02,
            self.m10+other.m10,
            self.m11+other.m11,
            self.m12+other.m12,
            self.m20+other.m20,
            self.m21+other.m21,
            self.m22+other.m22,
        ) : new Matrix(
            self.m00+other,
            self.m01+other,
            self.m02+other,
            self.m10+other,
            self.m11+other,
            self.m12+other,
            self.m20+other,
            self.m21+other,
            self.m22+other,
        );
    },
    mul: function (other) {
        var self = this;
        return other instanceof Matrix ? new Matrix(
            self.m00*other.m00+self.m01*other.m10+self.m02*other.m20,
            self.m00*other.m01+self.m01*other.m11+self.m02*other.m21,
            self.m00*other.m02+self.m01*other.m12+self.m02*other.m22,
            self.m10*other.m00+self.m11*other.m10+self.m12*other.m20,
            self.m10*other.m01+self.m11*other.m11+self.m12*other.m21,
            self.m10*other.m02+self.m11*other.m12+self.m12*other.m22,
            self.m20*other.m00+self.m21*other.m10+self.m22*other.m20,
            self.m20*other.m01+self.m21*other.m11+self.m22*other.m21,
            self.m20*other.m02+self.m21*other.m12+self.m22*other.m22,
        ) : new Matrix(
            self.m00*other,
            self.m01*other,
            self.m02*other,
            self.m10*other,
            self.m11*other,
            self.m12*other,
            self.m20*other,
            self.m21*other,
            self.m22*other,
        );
    },
    transform: function(point) {
        return transform(this, point);
    }
}, {
    eye: function() {
        return new Matrix(
            1,0,0,
            0,1,0,
            0,0,1
        );
    },
    scale: function(sx, sy) {
        return new Matrix(
            sx,0,0,
            0,sy,0,
            0,0,1
        );
    },
    shearX: function(s) {
        return new Matrix(
            1,s,0,
            0,1,0,
            0,0,1
        );
    },
    shearY: function(s) {
        return new Matrix(
            1,0,0,
            s,1,0,
            0,0,1
        );
    },
    translate: function(tx, ty) {
        return new Matrix(
            1,0,tx || 0,
            0,1,ty || 0,
            0,0,1
        );
    },
    rotate: function(theta) {
        return new Matrix(
            stdMath.cos(theta),-stdMath.sin(theta),0,
            stdMath.sin(theta),stdMath.cos(theta),0,
            0,0,1
        );
    }
});

// 2D Geometric Primitive base class
var Primitive = makeClass(null, {
    transformMatrix: null,
    $dirty: false,
    $cb: null,
    $pb: null,
    dispose: function() {
        this.$cb = null;
        this.$pb = null;
    },
    isDirty: function(isDirty) {
        if (arguments.length)
        {
            this.$dirty = !!isDirty;
            return this;
        }
        else
        {
            return this.$dirty;
        }
    },
    onChange: function(cb, add) {
        var self = this, index;
        if (is_function(cb))
        {
            if (false === add)
            {
                if (self.$cb)
                {
                    index = self.$cb.indexOf(cb);
                    if (-1 !== index) self.$cb.splice(index, 1);
                }
            }
            else
            {
                if (!self.$cb)
                {
                    self.$cb = [];
                    self.$pb = debounce(function() {
                        self.$cb.forEach(function(cb) {cb(self);});
                    }, 10);

                }
                index = self.$cb.indexOf(cb);
                if (-1 === index) self.$cb.push(cb);
            }
        }
        return self;
    },
    triggerChange: function() {
        var self = this;
        if (self.$cb && self.$pb) self.$pb();
        return self;
    }
});

// 2D Point class
var Point = makeClass(Primitive, {
    constructor: function Point(x, y) {
        var self = this, _x = 0, _y = 0;
        if (x instanceof Point)
        {
            return x;
        }
        if (!(self instanceof Point))
        {
            return new Point(x, y);
        }
        if (is_array(x))
        {
            _x = x[0] || 0;
            _y = x[1] || 0;
        }
        else if (is_object(x))
        {
            _x = x.x || 0;
            _y = x.y || 0;
        }
        else
        {
            _x = x || 0;
            _y = y || 0;
        }
        Object.defineProperty(self, 'x', {
            get() {
                return _x;
            },
            set(x) {
                x = x || 0;
                if (_x !== x)
                {
                    _x = x;
                    self.isDirty(true);
                    self.triggerChange();
                }
            }
        });
        Object.defineProperty(self, 'y', {
            get() {
                return _y;
            },
            set(y) {
                y = y || 0;
                if (_y !== y)
                {
                    _y = y;
                    self.isDirty(true);
                    self.triggerChange();
                }
            }
        });
        self.dispose = function() {
            _x = null;
            _y = null;
            self.$super.dispose.call(self);
        };
    },
    transform: function(matrix) {
        return matrix.transform(this);
    },
    isEqual: function(other) {
        return stdMath.abs(this.x-other.x) < EPSILON && stdMath.abs(this.y-other.y) < EPSILON;
    },
    distanceToLine: function(p1, p2) {
        return p1 instanceof Line ? point_line_distance(this, p1.start, p1.end) : point_line_distance(this, p1, p2);
    },
    isOnLine: function(p1, p2) {
        return !!(p1 instanceof Line ? points_colinear(this, p1.start, p1.end) : points_colinear(this, p1, p2));
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.isEqual(other) ? this : false;
        }
        else if ((other instanceof Primitive) && is_function(other.intersects))
        {
            return other.intersects(this);
        }
        return false;
    }
});

// 2D Line segment class
var Line = makeClass(Primitive, {
    constructor: function Line(start, end) {
        var self = this, _start = null, _end = null,
            _length = null, onChange;
        if (start instanceof Line) return start;
        if (!(self instanceof Line)) return new Line(start, end);
        onChange = function onChange(point) {
            if (point.isDirty())
            {
                _length = null;
                self.isDirty(true);
                self.triggerChange();
            }
        };
        _start = Point(start);
        _end = Point(end);
        _start.onChange(onChange);
        _end.onChange(onChange);
        Object.defineProperty(self, 'start', {
            get() {
                return _start;
            },
            set(start) {
                start = Point(start);
                if (_start !== start)
                {
                    _start.onChange(onChange, false);
                    start.onChange(onChange);
                    if (!_start.isEqual(start))
                    {
                        _start = start;
                        _start.isDirty(true);
                    }
                    else
                    {
                        _start = start;
                    }
                    if (_start.isDirty())
                    {
                        _length = null;
                        self.isDirty(true);
                        self.triggerChange();
                    }
                }
            }
        });
        Object.defineProperty(self, 'end', {
            get() {
                return _end;
            },
            set(end) {
                end = Point(end);
                if (_end !== end)
                {
                    _end.onChange(onChange, false);
                    end.onChange(onChange);
                    if (!_end.isEqual(end))
                    {
                        _end = end;
                        _end.isDirty(true);
                    }
                    else
                    {
                        _end = end;
                    }
                    if (_end.isDirty())
                    {
                        _length = null;
                        self.isDirty(true);
                        self.triggerChange();
                    }
                }
            }
        });
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    _length = euclidean_distance(_start, _end);
                }
                return _length;
            }
        });
        self.isDirty = function(isDirty) {
            if (false === isDirty)
            {
                _start.isDirty(false);
                _end.isDirty(false);
            }
            return self.$super.isDirty.apply(self, arguments);
        };
        self.dispose = function() {
            if (_start)
            {
                _start.onChange(onChange, false);
                _start = null;
            }
            if (_end)
            {
                _end.onChange(onChange, false);
                _end = null;
            }
            self.$super.dispose.call(self);
        };
    },
    transform: function(matrix) {
        return new Line(this.start.transform(matrix), this.end.transform(matrix));
    },
    distanceToPoint: function(point) {
        return point_line_distance(point, this.start, this.end);
    },
    hasPoint: function(point) {
        return !!points_colinear(point, this.start, this.end);
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return points_colinear(other, this.start, this.end);
        }
        else if (other instanceof Line)
        {
            return line_line_intersection(this.start, this.end, other.start, other.end);
        }
        return false;
    }
});

// 2D Polyline class
// assembly of consecutive line segments between given points
var Polyline = makeClass(Primitive, {
    constructor: function Polyline(points) {
        var self = this, _points = null, _length = null,
            onChange, onChangeArray;
        if (points instanceof Polyline) return points;
        if (!(self instanceof Polyline)) return new Polyline(points);
        if (!is_array(points)) points = [points];
        onChange = function onChange(point) {
            if (point.isDirty())
            {
                _length = null;
                self.isDirty(true);
                self.triggerChange();
            }
        };
        onChangeArray = function onChangeArray(array, point, index, method) {
            if (point) point.isDirty(true);
            _length = null;
            self.isDirty(true);
            self.triggerChange();
        };
        _points = observeArray(points.map(Point));
        _points.forEach(function(point) {point.onChange(onChange);});
        _points.onChange(onChangeArray);
        Object.defineProperty(self, 'points', {
            get() {
                return _points;
            },
            set(points) {
                if (!is_array(points)) points = [points];
                points = observeArray(points.map(Point));
                _points.forEach(function(point) {point.onChange(onChange, false);});
                _points.onChange(onChangeArray, false);
                _points = points;
                _points.forEach(function(point) {point.onChange(onChange);});
                _points.onChange(onChangeArray);
                self.isDirty(true);
                self.triggerChange();
            }
        });
        Object.defineProperty(self, 'lines', {
            get() {
                return 1 < _points.length ? _points.reduce(function(lines, point, i) {
                    if (i+1 < _points.length)
                    {
                        lines[i] = new Line(point, _points[i+1]);
                    }
                    return lines;
                }, new Array(_points.length-1)) : [];
            }
        });
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    _length = 0;
                    for (var i=0,n=_points.length; i+1<n; ++i)
                    {
                        _length += euclidean_distance(_points[i], _points[i+1]);
                    }
                }
                return _length;
            }
        });
        self.isDirty = function(isDirty) {
            if (false === isDirty)
            {
                _points.forEach(function(point) {point.isDirty(false);});
            }
            return self.$super.isDirty.apply(self, arguments);
        };
        self.dispose = function() {
            if (_points)
            {
                _points.forEach(function(point) {point.onChange(onChange, false);});
                _points.onChange(onChangeArray, false);
                _points = null;
            }
            self.$super.dispose.call(self);
        };
    },
    transform: function(matrix) {
        return new Polyline(this.points.map(function(point) {return point.transform(matrix);}));
    },
    distanceToPoint: function(point) {
        return 1 < _points.length ? _points.reduce(function(dist, _, i) {
            if (i+1 < _points.length)
            {
                dist = stdMath.min(dist, point_line_distance(point, _points[i], _points[i+1]));
            }
            return dist;
        }, Infinity) : -1;
    },
    hasPoint: function(point) {
        return 1 < _points.length ? _points.reduce(function(res, _, i) {
            if (!res && (i+1 < _points.length))
            {
                res = !!points_colinear(point, _points[i], _points[i+1]);
            }
            return res;
        }, false) : false;
    }
});

/*function Polygon(vertices)
{
    var self = this;
    if (vertices instanceof Polygon) return vertices;
    if (!(self instanceof Polygon)) return new Polygon(vertices);
    self.vertices = vertices.map(Point);
}
Polygon.prototype = {
    constructor: Polygon,
    vertices: null,
    transform: function(matrix) {
        return new Polygon(this.vertices.map(function(vertex) {return vertex.transform(matrix);}));
    },
    circumferance: function() {
        var points = this.points, sum = 0, i, n = points.length-1;
        for (i=0; i<n; ++i) sum += euclidean_distance(points[i], points[i+1]);
        if (1 < n) sum += euclidean_distance(points[0], points[n]);
        return sum;
    },
    area: function() {
        var points = this.points, d = 0, i, n = points.length-1, x1, x2, y1, y2;
        for (i=0; i<n; ++i)
        {
            // shoelace area formula for simple polygons
            x1 = points[i].x;
            x2 = points[i+1].x;
            y1 = points[i].y;
            y2 = points[i+1].y;
            d += (x1*y2-x2*y1) / 2;
        }
        return d;
    }
};*/

// ---- utilities -----
function is_numeric(x)
{
    return !isNaN(+x);
}
function is_string(x)
{
    return ('string' === typeof x) || ('[object String]' === toString.call(x));
}
function is_array(x)
{
    return ('[object Array]' === toString.call(x));
}
function is_object(x)
{
    return ('[object Object]' === toString.call(x)) && ('function' === typeof x.constructor) && ('Object' === x.constructor.name);
}
function is_function(x)
{
    return "function" === typeof x;
}
function debounce(func, wait, immediate)
{
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
function transform(matrix, point)
{
    return new Point(
       matrix.m00*point.x+matrix.m01*point.y+matrix.m02,
       matrix.m10*point.x+matrix.m11*point.y+matrix.m12
    );
}
function euclidean_distance(p1, p2)
{
    var dx = p1.x-p2.x, dy = p1.y-p2.y;
    return stdMath.sqrt(dx*dx+dy*dy);
}
function point_line_distance(p0, p1, p2)
{
    // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    var dx = p2.x - p1.x, dy = p2.y - p1.y;
    return stdMath.abs(dx*(p1.y-p0.y) - dy*(p1.x-p0.x)) / stdMath.sqrt(dx*dx + dy*dy);
}
function points_colinear(p0, p1, p2)
{
    if (stdMath.abs(p2.x-p1.x) < EPSILON)
    {
        // vertical
        return (stdMath.abs(p0.x-p1.x) < EPSILON)&& (p0.y >= stdMath.min(p1.y, p2.y)) && (p0.y <= stdMath.max(p1.y, p2.y)) ? p0 : false;
    }
    else if (stdMath.abs(p0.x-p1.x) < EPSILON)
    {
        return stdMath.abs(p0.y-p1.y) < EPSILON ? p0 : false;
    }
    else
    {
        return stdMath.abs((p2.y - p1.y) / (p2.x-p1.x) - (p0.y - p1.y) / (p0.x - p1.x)) < EPSILON ? p0 : false;
    }
}
function line_line_intersection(p1, p2, p3, p4)
{
    // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
    var den = (p1.x-p2.x)*(p3.y-p4.y) - (p1.y-p2.y)*(p3.x-p4.x), pi;
    if (stdMath.abs(den) < EPSILON) return false;
    pi = new Point(
        ((p1.x*p2.y-p1.y*p2.x)*(p3.x-p4.x) - (p1.x-p2.x)*(p3.x*p4.y-p3.y*p4.x)) / den,
        ((p1.x*p2.y-p1.y*p2.x)*(p3.y-p4.y) - (p1.y-p2.y)*(p3.x*p4.y-p3.y*p4.x)) / den
    );
    return pi.isOnline(p1, p2) && pi.isOnLine(p3, p4) ? pi : false;
}
function line_circle_intersection(p1, p2, c, r)
{
}


// export it
return {
    VERSION: "0.1.0",
    Matrix: Matrix,
    Primitive: Primitive,
    Point: Point,
    Line: Line,
    Polyline: Polyline,
    Polygon: Polygon,
    Circle: Circle,
    Curve: Curve,
    Shape: Shape
};
});
