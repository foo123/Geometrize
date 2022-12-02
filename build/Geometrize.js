/**
*   Geometrize
*   computational geometry and rendering library for JavaScript
*
*   @version 0.2.0 (2022-12-02 13:16:14)
*   https://github.com/foo123/Geometrize
*
**//**
*   Geometrize
*   computational geometry and rendering library for JavaScript
*
*   @version 0.2.0 (2022-12-02 13:16:14)
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
    PI = stdMath.PI, TWO_PI = 2*PI, EPS = 1e-8/*Number.EPSILON*/,
    sqrt2 = sqrt(2), sqrt3 = sqrt(3),
    NUM_POINTS = 20, PIXEL_SIZE = 1e-2,
    EMPTY_ARR = [], EMPTY_OBJ = {},
    NOP = function() {},
    isNode = ("undefined" !== typeof global) && ("[object global]" === toString.call(global)),
    isBrowser = ("undefined" !== typeof window) && ("[object Window]" === toString.call(window))
;

// basic backwards-compatible "class" construction
function makeSuper(superklass)
{
    var called = {};
    return function $super(method, args) {
        var self = this, m = ':'+method, ret;
        if (1 === called[m]) return (superklass.prototype.$super || NOP).call(self, method, args);
        called[m] = 1;
        ret = ('constructor' === method ? superklass : (superklass.prototype[method] || NOP)).apply(self, args || []);
        called[m] = 0;
        return ret;
    };
}
function makeClass(superklass, klass, statik)
{
    var C = HAS.call(klass, 'constructor') ? klass.constructor : function() {}, p;
    if (superklass)
    {
        C.prototype = Object.create(superklass.prototype);
        C.prototype.$super = makeSuper(superklass);
    }
    else
    {
        C.prototype.$super = NOP;
    }
    C.prototype.constructor = C;
    for (p in klass)
    {
        if (HAS.call(klass, p) && ('constructor' !== p))
        {
            C.prototype[p] = klass[p];
        }
    }
    if (statik)
    {
        for (p in statik)
        {
            if (HAS.call(statik, p))
            {
                C[p] = statik[p];
            }
        }
    }
    return C;
}
// Changeable mixin
var Changeable = {
    $changed: false,
    $cb: null,
    dispose: function() {
        this.$cb = null;
    },
    isChanged: function(isChanged) {
        if (arguments.length)
        {
            this.$changed = !!isChanged;
            return this;
        }
        else
        {
            return this.$changed;
        }
    },
    onChange: function(cb, add) {
        var self = this, index;
        if ((false === add) && (is_function(cb) || is_string(cb)))
        {
            if (self.$cb)
            {
                index = is_string(cb) ? self.$cb.map(function(c) {return Str(c.id);}).indexOf(cb) : self.$cb.indexOf(cb);
                if (-1 !== index) self.$cb.splice(index, 1);
            }
        }
        else if (is_function(cb))
        {
            if (!self.$cb) self.$cb = [];
            index = self.$cb.indexOf(cb);
            if (-1 === index) self.$cb.push(cb);
        }
        return self;
    },
    triggerChange: function() {
        var self = this;
        if (self.$cb) self.$cb.forEach(function(cb) {cb(self);});
        return self;
    }
};
// generic scalar Value class
var Value = makeClass(null, merge(null, {
    constructor: function Value(v) {
        var self = this;
        if (v instanceof Value) return v;
        if (!(self instanceof Value)) return new Value(v);

        v = Num(v);
        self.dispose = function() {
            v = null;
            Value.prototype.dispose.call(self);
        };
        self.clone = function() {
            return new Value(v);
        };
        self.val = function(newv) {
            if (arguments.length)
            {
                newv = newv instanceof Value ? newv.val() : Num(newv);
                var isChanged = !is_almost_equal(v, newv);
                v = newv;
                if (isChanged && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
                return self;
            }
            else
            {
                return v;
            }
        };
        self.valueOf = function() {
            return v.valueOf();
        };
        self.toString = function() {
            return Str(v);
        };
        self.isChanged(true);
    },
    clone: null,
    val: null,
    valueOf: null,
    toString: null
}, Changeable));// 2D Homogeneous Transformation Matrix class
var Matrix = makeClass(null, {
    constructor: function Matrix(
        m00, m01, m02,
        m10, m11, m12,
        m20, m21, m22
    ) {
        var self = this;
        if (m00 instanceof Matrix)
        {
            return m00;
        }
        if (!(self instanceof Matrix))
        {
            return new Matrix(
            m00, m01, m02,
            m10, m11, m12,
            m20, m21, m22
            );
        }
        if (is_array(m00) && (9 <= m00.length))
        {
            self.$00 = Num(m00[0]);
            self.$01 = Num(m00[1]);
            self.$02 = Num(m00[2]);
            self.$10 = Num(m00[3]);
            self.$11 = Num(m00[4]);
            self.$12 = Num(m00[5]);
            self.$20 = 0;
            self.$21 = 0;
            self.$22 = 1;
        }
        else
        {
            self.$00 = m00;
            self.$01 = m01;
            self.$02 = m02;
            self.$10 = m10;
            self.$11 = m11;
            self.$12 = m12;
            self.$20 = 0;
            self.$21 = 0;
            self.$22 = 1;
        }
    },
    $00: 1,
    $01: 0,
    $02: 0,
    $10: 0,
    $11: 1,
    $12: 0,
    $20: 0,
    $21: 0,
    $22: 1,
    clone: function() {
        var self = this;
        return new Matrix(
        self.$00, self.$01, self.$02,
        self.$10, self.$11, self.$12,
        //self.$20, self.$21, self.$22
        0, 0, 1
        );
    },
    eq: function(other) {
        if (other instanceof Matrix)
        {
            var self = this;
            return is_almost_equal(self.$00, other.$00) && is_almost_equal(self.$01, other.$01) && is_almost_equal(self.$02, other.$02) && is_almost_equal(self.$10, other.$10) && is_almost_equal(self.$11, other.$11) && is_almost_equal(self.$12, other.$12);
        }
        return false;
    },
    add: function(other) {
        var self = this;
        if (other instanceof Matrix)
        {
            return new Matrix(
                self.$00 + other.$00, self.$01 + other.$01, self.$02 + other.$02,
                self.$10 + other.$10, self.$11 + other.$11, self.$12 + other.$12,
                0, 0, 1
            );
        }
        else
        {
            other = Num(other);
            return new Matrix(
                self.$00 + other, self.$01 + other, self.$02 + other,
                self.$10 + other, self.$11 + other, self.$12 + other,
                0, 0, 1
            );
        }
    },
    mul: function(other) {
        var self = this;
        if (other instanceof Matrix)
        {
            return new Matrix(
                self.$00*other.$00 + self.$01*other.$10 + self.$02*other.$20,
                self.$00*other.$01 + self.$01*other.$11 + self.$02*other.$21,
                self.$00*other.$02 + self.$01*other.$12 + self.$02*other.$22,
                self.$10*other.$00 + self.$11*other.$10 + self.$12*other.$20,
                self.$10*other.$01 + self.$11*other.$11 + self.$12*other.$21,
                self.$10*other.$02 + self.$11*other.$12 + self.$12*other.$22,
                0, 0, 1
            );
        }
        else
        {
            other = Num(other);
            return new Matrix(
                self.$00*other, self.$01*other, self.$02*other,
                self.$10*other, self.$11*other, self.$12*other,
                0, 0, 1
            );
        }
    },
    det: function() {
        var self = this;
        return self.$00*(self.$11*self.$22 - self.$12*self.$21) + self.$01*(self.$12*self.$20 - self.$10*self.$22) + self.$02*(self.$21*self.$10 - self.$11*self.$20);
    },
    inv: function() {
        var self = this,
            a00 = self.$00, a01 = self.$01, a02 = self.$02,
            a10 = self.$10, a11 = self.$11, a12 = self.$12,
            //a20 = self.$20, a21 = self.$21, a22 = self.$22,
            det2 = a00*a11 - a01*a10,
            i00 = 0, i01 = 0, i10 = 0, i11 = 0;

        if (is_almost_zero(det2)) return null;

        /*return new Matrix(
        (a11*a22-a12*a21)/det, (a02*a21-a01*a22)/det, (a01*a12-a02*a11)/det,
        (a12*a20-a10*a22)/det, (a00*a22-a02*a20)/det, (a02*a10-a00*a12)/det,
        //(a10*a21-a11*a20)/det, (a01*a20-a00*a21)/det, (a00*a11-a01*a10)/det
        0, 0, 1
        );*/
        i00 = a11/det2; i01 = -a01/det2;
        i10 = -a10/det2; i11 = a00/det2;
        return new Matrix(
        i00, i01, -i00*a02 - i01*a12,
        i10, i11, -i10*a02 - i11*a12,
        0, 0, 1
        );
    },
    transform: function(point, newpoint) {
        var self = this, x = point.x, y = point.y,
            nx = self.$00*x + self.$01*y + self.$02,
            ny = self.$10*x + self.$11*y + self.$12;
        if (newpoint)
        {
            newpoint.x = nx;
            newpoint.y = ny;
        }
        else
        {
            newpoint = new Point(nx, ny);
        }
        return newpoint;
    },
    getTranslation: function() {
        var self = this;
        return {
            x: self.$02,
            y: self.$12
        };
    },
    getRotationAngle: function() {
        var self = this;
        return stdMath.atan2(-self.$01, self.$00);
    },
    getScale: function() {
        var self = this,
            a = self.$00, b = self.$01,
            c = self.$10, d = self.$11;
        return {
            x: sign(a)*stdMath.sqrt(a*a + b*b),
            y: sign(d)*stdMath.sqrt(c*c + d*d)
        };
    },
    toArray: function() {
        var self = this;
        return [
        self.$00, self.$01, self.$02,
        self.$10, self.$11, self.$12,
        self.$20, self.$21, self.$22
        ];
    },
    toSVG: function() {
        var self = this;
        return 'matrix('+Str(self.$00)+' '+Str(self.$10)+' '+Str(self.$01)+' '+Str(self.$11)+' '+Str(self.$02)+' '+Str(self.$12)+')';
    },
    toCSS: function() {
        var self = this;
        return 'matrix('+Str(self.$00)+', '+Str(self.$10)+', '+Str(self.$01)+', '+Str(self.$11)+', '+Str(self.$02)+', '+Str(self.$12)+')';
    },
    toTex: function() {
        return Matrix.arrayTex(this.toArray(), 3, 3);
    },
    toString: function() {
        return Matrix.arrayString(this.toArray(), 3, 3);
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
        Num(sx),0,0,
        0,Num(sy),0,
        0,0,1
        );
    },
    reflectX: function() {
        return new Matrix(
        -1,0,0,
        0,1,0,
        0,0,1
        );
    },
    reflectY: function() {
        return new Matrix(
        1,0,0,
        0,-1,0,
        0,0,1
        );
    },
    shearX: function(s) {
        return new Matrix(
        1,Num(s),0,
        0,1,0,
        0,0,1
        );
    },
    shearY: function(s) {
        return new Matrix(
        1,0,0,
        Num(s),1,0,
        0,0,1
        );
    },
    translate: function(tx, ty) {
        return new Matrix(
        1,0,Num(tx),
        0,1,Num(ty),
        0,0,1
        );
    },
    rotate: function(theta) {
        theta = Num(theta);
        var cos = stdMath.cos(theta), sin = stdMath.sin(theta);
        return new Matrix(
        cos,-sin,0,
        sin,cos,0,
        0,0,1
        );
    },
    arrayTex: function(array, rows, cols) {
        var tex = '\\begin{pmatrix}';
        for (var i=0; i<rows; ++i)
        {
            tex += array.slice(i*cols,i*cols+cols).join('&');
            if (i+1 < rows) tex += '\\\\';
        }
        tex += '\\end{pmatrix}';
        return tex;
    },
    arrayString: function(array, rows, cols) {
        var maxlen = array.reduce(function(maxlen, x) {
            return stdMath.max(maxlen, Str(x).length);
        }, 0);
        var str = '';
        for (var i=0; i<rows; ++i)
        {
            str += '['+array.slice(i*cols,i*cols+cols).map(function(x){return pad(x, maxlen);}).join(' ')+']';
            if (i+1 < rows) str += "\n";
        }
        return str;
    },
    pointTex: function(point) {
        return '\\begin{pmatrix}'+Str(point.x)+'\\\\'+Str(point.y)+'\\\\1\\end{pmatrix}';
    },
    pointString: function(point) {
        var maxlen = [point.x, point.y].reduce(function(maxlen, s) {
            return stdMath.max(maxlen, Str(s).length);
        }, 1);
        return '['+pad(point.x, maxlen)+"]\n["+pad(point.y, maxlen)+"]\n["+pad(1, maxlen)+']';
    }
});
var EYE = Matrix.eye();// 2D Style class
// eg stroke, fill, width, ..
var Style = makeClass(null, merge(null, {
    constructor: function Style(style) {
        var self = this, _props = null, _style = null;
        if (style instanceof Style) return style;
        if (!(self instanceof Style)) return new Style(style);
        _props = [
            'stroke-width',
            'stroke',
            'stroke-opacity',
            'stroke-linecap',
            'stroke-linejoin',
            'fill',
            'fill-opacity'
        ];
        // defaults
        _style = {
            'stroke-width': 1,
            'stroke': '#000000',
            'stroke-opacity': 1,
            'stroke-linecap': 'butt',
            'stroke-linejoin': 'miter',
            'fill': 'none',
            'fill-opacity': 1
        };
        if (is_object(style))
        {
            _style = merge(_props, _style, style);
        }
        _props.forEach(function(p) {
            def(self, p, {
                get: function() {
                    return _style[p];
                },
                set: function(val) {
                    if (_style[p] !== val)
                    {
                        _style[p] = val;
                        if (!self.isChanged())
                        {
                            self.isChanged(true);
                            self.triggerChange();
                        }
                    }
                },
                enumerable: true,
                configurable: false
            });
        });
        self.toObj = function() {
            return _props.reduce(function(o, p) {
                o[p] = _style[p];
                return o;
            }, {});
        };
        self.isChanged(true);
    },
    clone: function() {
        return new Style(this.toObj());
    },
    toSVG: function() {
        var style = this.toObj();
        return Object.keys(style).reduce(function(s, p) {
            return s + p + ':' + Str(style[p]) + ';';
        }, '');
    }
}, Changeable));
// 2D Geometric Primitive base class
var Primitive = makeClass(null, merge(null, {
    constructor: function Primitive() {
        var self = this, _style = null, onStyleChange;

        self.id = uuid(self.name);

        onStyleChange = function onStyleChange(style) {
            if (_style === style)
            {
                if (!self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            }
        };
        _style = new Style();
        _style.onChange(onStyleChange);
        def(self, 'style', {
            get: function() {
                return _style;
            },
            set: function(style) {
                style = Style(style);
                if (_style !== style)
                {
                    if (_style) _style.onChange(onStyleChange, false);
                    _style = style;
                    if (_style)
                    {
                        _style.onChange(onStyleChange);
                        if (!self.isChanged())
                        {
                            self.isChanged(true);
                            self.triggerChange();
                        }
                    }
                }
            },
            enumerable: true,
            configurable: false
        });
        self.isChanged(true);
    },
    id: '',
    name: 'Primitive',
    clone: function() {
        return this;
    },
    transform: function() {
        return this;
    },
    getBoundingBox: function() {
        return {
        ymin: -Infinity,
        xmin: -Infinity,
        ymax: Infinity,
        xmax: Infinity
        };
    },
    getConvexHull: function() {
        return [];
    },
    getCenter: function() {
        var box = this.getBoundingBox();
        return {
            x: (box.xmin + box.xmax)/2,
            y: (box.ymin + box.ymax)/2
        };
    },
    hasPoint: function(point) {
        return false;
    },
    hasInsidePoint: function(point, strict) {
        return false;
    },
    intersects: function(other) {
        return false;
    },
    toSVG: function(svg) {
        return arguments.length ? svg : '';
    },
    toSVGPath: function(svg) {
        return arguments.length ? svg : '';
    },
    toTex: function() {
        return '\\text{Primitive}';
    },
    toString: function() {
        return 'Primitive()';
    }
}, Changeable));
// 2D Point class
var Point = makeClass(Primitive, {
    constructor: function Point(x, y) {
        var self = this, _x = 0, _y = 0, _n = null;
        if (x instanceof Point)
        {
            return x;
        }
        if (!(self instanceof Point))
        {
            return new Point(x, y);
        }
        self.$super('constructor');
        if (is_array(x))
        {
            _x = Num(x[0]);
            _y = Num(x[1]);
        }
        else if (is_object(x))
        {
            _x = Num(x.x);
            _y = Num(x.y);
        }
        else
        {
            _x = Num(x);
            _y = Num(y);
        }
        def(self, 'x', {
            get: function() {
                return _x;
            },
            set: function(x) {
                x = Num(x);
                var isChanged = !is_almost_equal(x, _x);
                _x = x;
                if (isChanged && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'y', {
            get: function() {
                return _y;
            },
            set: function(y) {
                y = Num(y);
                var isChanged = !is_almost_equal(y, _y);
                _y = y;
                if (isChanged && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'norm', {
            get: function() {
                if (null == _n)
                {
                    _n = hypot(_x, _y);
                }
                return _n;
            },
            enumerable: true,
            configurable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _n = null;
            }
            return self.$super('isChanged', arguments);
        };
        self.dispose = function() {
            _x = null;
            _y = null;
            self.$super('dispose');
        };
    },
    name: 'Point',
    clone: function() {
        return new Point(this.x, this.y);
    },
    transform: function(matrix) {
        return matrix.transform(this);
    },
    getBoundingBox: function() {
        return {
        ymin: this.y,
        xmin: this.x,
        ymax: this.y,
        xmax: this.x
        };
    },
    eq: function(other) {
        return other instanceof Point ? p_eq(this, other) : false;
    },
    add: function(other) {
        return other instanceof Point ? new Point(this.x+other.x, this.y+other.y) : new Point(this.x+Num(other), this.y+Num(other));
    },
    mul: function(other) {
        other = Num(other);
        return new Point(this.x*other, this.y*other);
    },
    dot: function(other) {
        return dotp(this.x, this.y, other.x, other.y);
    },
    cross: function(other) {
        return crossp(this.x, this.y, other.x, other.y);
    },
    angle: function(other) {
        return angle(this.x, this.y, other.x, other.y);
    },
    between: function(p1, p2) {
        return !!(p1 instanceof Line ? point_between(this, p1.start, p1.end) : point_between(this, p1, p2));
    },
    distanceToLine: function(p1, p2) {
        return p1 instanceof Line ? point_line_distance(this, p1.start, p1.end) : point_line_distance(this, p1, p2);
    },
    isOn: function(curve) {
        return is_function(curve.hasPoint) ? curve.hasPoint(this) : false;
    },
    isInside: function(closedCurve, strict) {
        return is_function(closedCurve.hasInsidePoint) ? closedCurve.hasInsidePoint(this, strict) : false;
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.eq(other) ? [this] : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(this);
        }
        return false;
    },
    toSVG: function(svg) {
        return SVG('circle', {
            'id': [this.id, false],
            'cx': [this.x, this.isChanged()],
            'cy': [this.y, this.isChanged()],
            'r': [this.style['stroke-width'], this.style.isChanged()],
            //'transform': [this.matrix.toSVG(), this.isChanged()],
            'style': ['fill:'+Str(this.style['stroke'])+';', this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var c = this, r = this.style['stroke-width'],
            path = 'M '+Str(c.x - r)+' '+Str(c.y)+' a '+Str(r)+' '+Str(r)+' 0 0 0 '+Str(r + r)+' 0 a '+Str(r)+' '+Str(r)+' 0 0 0 '+Str(-r - r)+' 0 z';
        return arguments.length ? SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': ['fill:'+Str(this.style['stroke'])+';', this.style.isChanged()]
        }, svg) : path;
    },
    toTex: function() {
        return '\\begin{pmatrix}'+Str(this.x)+'\\\\'+Str(this.y)+'\\end{pmatrix}';
    },
    toString: function() {
        return 'Point('+Str(this.x)+','+Str(this.y)+')';
    }
});
// 2D generic Curve base class
var Curve = makeClass(Primitive, {
    constructor: function Curve(points, values) {
        var self = this,
            _matrix = null,
            _points = null,
            _points2 = null,
            _lines = null,
            _values = null,
            onPointChange,
            onArrayChange,
            point_add,
            point_del,
            point_eq;

        if (null == points) points = [];
        if (null == values) values = {};
        self.$super('constructor');

        point_add = function(p) {
            p = Point(p);
            p.onChange(onPointChange);
            return p;
        };
        point_del = function(p) {
            p.onChange(onPointChange, false);
            return p;
        };
        point_eq = function(p1, p2) {
            return p1.eq(p2);
        };
        onPointChange = function onPointChange(point) {
            if (is_array(_points) && (-1 !== _points.indexOf(point)))
            {
                if (!self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            }
        };
        onPointChange.id = self.id;
        onArrayChange = function onArrayChange(changed) {
            if (!self.isChanged())
            {
                self.isChanged(true);
                self.triggerChange();
            }
        };
        onArrayChange.id = self.id;

        _points = observeArray(points, point_add, point_del, point_eq);
        _points.onChange(onArrayChange);
        _values = values;

        _matrix = self.hasMatrix() ? Matrix.eye() : null;
        _values.matrix = new Value(0);
        _values.matrix.isChanged(self.hasMatrix());

        def(self, 'matrix', {
            get: function() {
                return _matrix ? _matrix : Matrix.eye();
            },
            set: function(matrix) {
                if (self.hasMatrix())
                {
                    matrix = Matrix(matrix);
                    var isChanged = !matrix.eq(_matrix);
                    _matrix = matrix;
                    if (isChanged && !self.isChanged())
                    {
                        _values.matrix.isChanged(true);
                        self.isChanged(true);
                        self.triggerChange();
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        def(self, '_points', {
            get: function() {
                if (null == _points2)
                {
                    _points2 = !_matrix || _matrix.eq(EYE) ? _points : _points.map(function(p) {
                        return _matrix.transform(p);
                    });
                }
                return _points2;
            },
            set: function(points) {
                if (null == points)
                {
                    _points2 = null;
                }
            },
            enumerable: false,
            configurable: true
        });
        def(self, '_lines', {
            get: function() {
                if (null == _lines)
                {
                    _lines = sample_curve(function(t) {
                        var pt = self.f(t);
                        return _matrix ? _matrix.transform(pt, pt) : pt;
                    }, NUM_POINTS, PIXEL_SIZE, true);
                }
                return _lines;
            },
            set: function(lines) {
                if (null == lines)
                {
                    _lines = null;
                }
            },
            enumerable: false,
            configurable: true
        });
        def(self, 'points', {
            get: function() {
                return _points;
            },
            set: function(points) {
                if (_points !== points)
                {
                    if (is_array(_points))
                    {
                        unobserveArray(_points, point_del);
                    }

                    if (is_array(points))
                    {
                        _points = observeArray(points, point_add, point_del, point_eq);
                        _points.onChange(onArrayChange);
                        if (!self.isChanged())
                        {
                            self.isChanged(true);
                            self.triggerChange();
                        }
                    }
                    else if (null == points)
                    {
                        _points = null;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        def(self, 'values', {
            get: function() {
                return _values;
            },
            set: function(values) {
                if (null == values)
                {
                    _values = null;
                }
            },
            enumerable: false,
            configurable: true
        });
        def(self, 'length', {
            get: function() {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        def(self, 'area', {
            get: function() {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
    },
    dispose: function() {
        var self = this;
        if (self.points)
        {
            unobserveArray(self.points, function(p) {
                p.onChange(self.id, false);
                return p;
            });
            self.points = null;
        }
        self.values = null;
        self.$super('dispose');
    },
    isChanged: function(isChanged) {
        var self = this;
        if (false === isChanged)
        {
            self.points.forEach(function(point) {point.isChanged(false);});
            Object.keys(self.values).forEach(function(k) {self.values[k].isChanged(false);});
            self.style.isChanged(false);
        }
        if (true === isChanged)
        {
            self._points = null;
            self._lines = null;
        }
        return self.$super('isChanged', arguments);
    },
    isConnected: function() {
        return true;
    },
    isClosed: function() {
        return false;
    },
    isConvex: function() {
        return false;
    },
    hasMatrix: function() {
        return true;
    },
    f: function(t) {
        return null;
    },
    getPointAt: function(t) {
        return null;
    },
    toLines: function() {
        return this._lines;
    },
    toBezier: function() {
        return this;
    },
    toTex: function() {
        return '\\text{Curve}';
    },
    toString: function() {
        return 'Curve()';
    }
});

// 2D generic Bezier curve base class
var Bezier = makeClass(Curve, {
    constructor: function Bezier(points, values) {
        var self = this;

        if (null == points) points = [];
        self.$super('constructor', [points, values]);

        def(self, 'degree', {
            get: function() {
                return self.points.length - 1;
            },
            enumerable: true,
            configurable: false
        });
    },
    toTex: function() {
        return '\\text{Bezier}';
    },
    toString: function() {
        return 'Bezier()';
    }
});

// 2D Composite Curve class (container of multiple, joined, curves)
var CompositeCurve = makeClass(Curve, {
    constructor: function CompositeCurve(curves) {
        var self = this,
            _curves = null,
            _points = null,
            _length = null,
            onCurveChange,
            onArrayChange,
            curve_add,
            curve_del;

        if (null == curves) curves = [];
        Primitive.call(self);

        curve_add = function(c) {
            if (c instanceof Curve) c.onChange(onCurveChange);
            return c;
        };
        curve_del = function(c) {
            if (c instanceof Curve) c.onChange(onCurveChange, false);
            return c;
        };
        onCurveChange = function onCurveChange(curve) {
            if (is_array(_curves) && (-1 !== _curves.indexOf(curve)))
            {
                if (!self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            }
        };
        onCurveChange.id = self.id;
        onArrayChange = function onArrayChange(changed) {
            if (!self.isChanged())
            {
                self.isChanged(true);
                self.triggerChange();
            }
        };
        onArrayChange.id = self.id;

        _curves = observeArray(curves, curve_add, curve_del);
        _curves.onChange(onArrayChange);

        def(self, 'points', {
            get: function() {
                if (null == _points)
                {
                    _points = _curves.reduce(function(points, curve) {
                        points.push.apply(points, curve.points);
                        return points;
                    }, []);
                }
                return _points;
            },
            set: function(points) {
                if (null == points)
                {
                    _points = null;
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'curves', {
            get: function() {
                return _curves;
            },
            set: function(curves) {
                if (_curves !== curves)
                {
                    if (is_array(_curves))
                    {
                        unobserveArray(_curves, curve_del);
                    }

                    if (is_array(curves))
                    {
                        _curves = observeArray(curves, curve_add, curve_del);
                        _curves.onChange(onArrayChange);
                        if (!self.isChanged())
                        {
                            self.isChanged(true);
                            self.triggerChange();
                        }
                    }
                    else if (null == curves)
                    {
                        _curves = null;
                    }
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    _length = _curves.reduce(function(l, curve) {
                        l += curve.length;
                        return l;
                    }, 0);
                }
                return _length;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'area', {
            get: function() {
                return 0;
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    _bbox = _curves.reduce(function(_bbox, curve) {
                        var box = curve.getBoundingBox();
                        _bbox.ymin = stdMath.min(_bbox.ymin, box.ymin);
                        _bbox.xmin = stdMath.min(_bbox.xmin, box.xmin);
                        _bbox.ymax = stdMath.max(_bbox.ymax, box.ymax);
                        _bbox.xmax = stdMath.max(_bbox.xmax, box.xmax);
                        return _bbox;
                    }, {
                        ymin: Infinity,
                        xmin: Infinity,
                        ymax: -Infinity,
                        xmax: -Infinity
                    });
                }
                return _bbox;
            },
            enumerable: false,
            configurable: false
        });
        def(self, '_hull', {
            get: function() {
                if (null == _hull)
                {
                    _hull = convex_hull(_curves.reduce(function(hulls, curve) {
                        hulls.push.apply(hulls, curve.getConvexHull());
                        return hulls;
                    }, []));
                }
                return _hull;
            },
            enumerable: false,
            configurable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _points = null;
                _length = null;
                _area = null;
                _bbox = null;
                _hull = null;
            }
            return Primitive.prototype.isChanged.apply(self, arguments);
        };
    },
    dispose: function() {
        var self = this;
        if (self.curves)
        {
            unobserveArray(self.curves, function(c) {
                if (c instanceof Curve) c.onChange(self.id, false);
                return c;
            });
            self.curves = null;
            self.points = null;
        }
        Primitive.prototype.dispose.call(self);
    },
    clone: function() {
        return new CompositeCurve(this.curves.map(function(curve) {return curve.clone();}));
    },
    transform: function(matrix) {
        return new CompositeCurve(this.curves.map(function(curve) {return curve.transform(matrix);}));
    },
    isConnected: function() {
        var c = this.curves, p1, p2, n = c.length-1, i;
        if (0 > n) return false;
        if (!c[0].isConnected()) return false;
        for (i=0; i<n; ++i)
        {
            if (!c[i+1].isConnected()) return false;
            p1 = c[i].points;
            p2 = c[i+1].points;
            if (!p1[p1.length-1].eq(p2[0]))
            {
                return false;
            }
        }
        return true;
    },
    isClosed: function() {
        if (!this.isConnected()) return false;
        var c = this.curves;
        return c[0].points[0].eq(c[c.length-1].points[c[c.length-1].points.length-1]);
    },
    getBoundingBox: function() {
        return this._bbox;
    },
    getConvexHull: function() {
        return this._hull;
    },
    hasPoint: function(point) {
        for (var c=this.curves, n=c.length, i=0; i<n; ++i)
        {
            if (c[i].hasPoint(point))
                return true;
        }
        return false;
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Primitive)
        {
            for (var ii,i=[],c=this.curves,n=c.length,j=0; j<n; ++j)
            {
                ii = c[j].intersects(other);
                if (ii) i.push.apply(i, ii);
            }
            return i ? i.map(Point) : false;
        }
        return false;
    },
    toLines: function() {
        return this.curves.reduce(function(lines, curve) {
            lines.push.apply(lines, curve.toLines());
            return lines;
        }, []);
    },
    toTex: function() {
        return '\\text{CompositeCurve: }\\begin{cases}&'+this.curves.map(Tex).join('\\\\&')+'\\end{cases}';
    },
    toString: function() {
        return 'CompositeCurve('+"\n"+this.curves.map(Str).join("\n")+"\n"+')';
    }
});
// 2D Line segment class (equivalent to Linear Bezier curve)
var Bezier1 = makeClass(Bezier, {
    constructor: function Bezier1(start, end) {
        var self = this,
            _length = null,
            _bbox = null,
            _hull = null
        ;

        if (start instanceof Bezier1) return start;
        if (!(self instanceof Bezier1)) return new Bezier1(start, end);

        self.$super('constructor', [[start, end]]);

        def(self, 'start', {
            get: function() {
                return self.points[0];
            },
            set: function(start) {
                self.points[0] = start;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'end', {
            get: function() {
                return self.points[1];
            },
            set: function(end) {
                self.points[1] = end;
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_lines', {
            get: function() {
                return self._points;
            },
            set: function(lines) {
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    var p = self._points;
                    _length = dist(p[0], p[1]);
                }
                return _length;
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    var p = self._points,
                        p1 = p[0], p2 = p[1],
                        xmin = stdMath.min(p1.x, p2.x),
                        xmax = stdMath.max(p1.x, p2.x),
                        ymin = stdMath.min(p1.y, p2.y),
                        ymax = stdMath.max(p1.y, p2.y)
                    ;
                    _bbox = {
                        ymin: ymin,
                        xmin: xmin,
                        ymax: ymax,
                        xmax: xmax
                    };
                }
                return _bbox;
            },
            enumerable: false,
            configurable: false
        });
        def(self, '_hull', {
            get: function() {
                if (null == _hull)
                {
                    var p = self._points,
                        p1 = p[0], p2 = p[1],
                        xmin = stdMath.min(p1.x, p2.x),
                        xmax = stdMath.max(p1.x, p2.x),
                        ymin = stdMath.min(p1.y, p2.y),
                        ymax = stdMath.max(p1.y, p2.y)
                    ;
                    _hull = [
                        new Point(xmin, ymin),
                        new Point(xmax, ymin),
                        new Point(xmax, ymax),
                        new Point(xmin, ymax)
                    ];
                }
                return _hull;
            },
            enumerable: false,
            configurable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _length = null;
                _bbox = null;
                _hull = null;
            }
            return self.$super('isChanged', arguments);
        };
    },
    name: 'Line',
    clone: function() {
        return new Line(this.start.clone(), this.end.clone());
    },
    transform: function(matrix) {
        return new Line(this.start.transform(matrix), this.end.transform(matrix));
    },
    getBoundingBox: function() {
        return this._bbox;
    },
    getConvexHull: function() {
        return this._hull;
    },
    hasPoint: function(point) {
        var p = this._points;
        return !!point_between(point, p[0], p[1]);
    },
    intersects: function(other) {
        var i, p;
        if (other instanceof Point)
        {
            p = this._points;
            i = point_between(other, p[0], p[1]);
            return i ? [other] : false;
        }
        else if (other instanceof Line)
        {
            p = this._points;
            i = line_segments_intersection(p[0], p[1], other._points[0], other._points[1]);
            return i ? [Point(i)] : false;
        }
        else if (other instanceof Circle)
        {
            p = this._points;
            i = line_circle_intersection(p[0], p[1], other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Ellipse)
        {
            p = this._points;
            i = line_ellipse_intersection(p[0], p[1], other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Arc)
        {
            p = this._points;
            i = curve_line_intersection(other._lines, p[0], p[1]);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier2)
        {
            return false;
        }
        else if (other instanceof Bezier3)
        {
            return false;
        }
        else if ((other instanceof Primitive))
        {
            return other.intersects(this);
        }
        return false;
    },
    f: function(t) {
        return bezier1(t, this.points);
    },
    getPointAt: function(t) {
        t = Num(t);
        return 0 > t || 1 < t ? null : Point(this.f(t));
    },
    distanceToPoint: function(point) {
        return point_line_segment_distance(point, this._points[0], this._points[1]);
    },
    toSVG: function(svg) {
        var p = this._points;
        return SVG('line', {
            'id': [this.id, false],
            'x1': [p[0].x, this.start.isChanged() || this.values.matrix.isChanged()],
            'y1': [p[0].y, this.start.isChanged() || this.values.matrix.isChanged()],
            'x2': [p[1].x, this.end.isChanged() || this.values.matrix.isChanged()],
            'y2': [p[1].y, this.end.isChanged() || this.values.matrix.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var p = this._points,
            path = 'M '+Str(p[0].x)+' '+Str(p[0].y)+' L '+Str(p[1].x)+' '+Str(p[1].y);
        return arguments.length ? SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, svg) : path;
    },
    toTex: function() {
        var p1 = this.start, p2 = this.end;
        return '\\text{Line: }'+signed(p2.y - p1.y, false)+' \\cdot x '+signed(p1.x - p2.x)+' \\cdot y '+signed(p2.x*p1.y - p1.x*p2.y)+'\\text{, }'+Str(stdMath.min(p1.x, p2.x))+' \\le x \\le '+Str(stdMath.max(p1.x, p2.x))+'\\text{, }'+Str(stdMath.min(p1.y, p2.y))+' \\le y \\le '+Str(stdMath.max(p1.y, p2.y));
    },
    toString: function() {
        return 'Line('+[Str(this.start), Str(this.end)].join(',')+')';
    }
});
var Line = Bezier1;
// 2D Polyline class
// assembly of consecutive line segments between given points
var Polyline = makeClass(Curve, {
    constructor: function Polyline(points) {
        var self = this,
            _length = null,
            _bbox = null,
            _hull = null,
            _is_convex = null
        ;

        if (points instanceof Polyline) return points;
        if (!(self instanceof Polyline)) return new Polyline(points);
        self.$super('constructor', [points]);

        def(self, 'lines', {
            get: function() {
                var p = self.points;
                return 1 < p.length ? p.reduce(function(lines, point, i) {
                    if (i+1 < p.length)
                    {
                        lines[i] = new Line(point, p[i+1]);
                    }
                    return lines;
                }, new Array(p.length-1)) : [];
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_lines', {
            get: function() {
                return self._points;
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    _length = curve_length(self._points);
                }
                return _length;
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    _bbox = {
                        ymin: Infinity,
                        xmin: Infinity,
                        ymax: -Infinity,
                        xmax: -Infinity
                    };
                    for (var i=0,p=self._points,n=p.length; i<n; ++i)
                    {
                        _bbox.ymin = stdMath.min(_bbox.ymin, p[i].y);
                        _bbox.ymax = stdMath.max(_bbox.ymax, p[i].y);
                        _bbox.xmin = stdMath.min(_bbox.xmin, p[i].x);
                        _bbox.xmax = stdMath.max(_bbox.xmax, p[i].x);
                    }
                }
                return _bbox;
            },
            enumerable: false,
            configurable: false
        });
        def(self, '_hull', {
            get: function() {
                if (null == _hull)
                {
                    _hull = convex_hull(self._points);
                }
                return _hull;
            },
            enumerable: false,
            configurable: false
        });
        def(self, '_is_convex', {
            get: function() {
                if (!self.isClosed()) return false;
                if (null == _is_convex)
                {
                    _is_convex = is_convex(self._points);
                }
                return _is_convex;
            },
            enumerable: false,
            configurable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _length = null;
                _bbox = null;
                _hull = null;
                _is_convex = null;
            }
            return self.$super('isChanged', arguments);
        };
    },
    name: 'Polyline',
    clone: function() {
        return new Polyline(this.points.map(function(point) {return point.clone();}));
    },
    transform: function(matrix) {
        return new Polyline(this.points.map(function(point) {return point.transform(matrix);}));
    },
    isClosed: function() {
        return 2 < this.points.length ? this.points[0].eq(this.points[this.points.length-1]) : false;
    },
    isConvex: function() {
        return this._is_convex;
    },
    getBoundingBox: function() {
        return this._bbox;
    },
    getConvexHull: function() {
        return this._hull;
    },
    hasPoint: function(point) {
        return point_on_curve(point, this._points);
    },
    hasInsidePoint: function(point, strict) {
        if (!this.isClosed()) return false;
        var inside = point_inside_curve(point, {x:this._bbox.xmax+10, y:point.y}, this._points);
        return strict ? 1 === inside : 0 < inside;
    },
    f: function(t, i) {
        var p = this.points;
        return bezier1(t, [p[i], p[i+1]]);
    },
    getPointAt: function(t) {
        t = Num(t);
        if (0 > t || 1 < t) return null;
        // 0-1/n, 1/n-2/n,..,(n-1)/n,n/n
        var n = this.points.length-1;
        return Point(this.f(t, stdMath.floor(n * t)));
    },
    intersects: function(other) {
        var i;
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Line)
        {
            i = curve_line_intersection(this._points, other._points[0], other._points[1]);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Circle)
        {
            i = curve_circle_intersection(this._points, other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Ellipse)
        {
            i = curve_ellipse_intersection(this._points, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false;
        }
        else if ((other instanceof Polyline) || (other instanceof Arc))
        {
            i = curve_curve_intersection(this._points, other._lines);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(this);
        }
        return false;
    },
    distanceToPoint: function(point) {
        var points = this.points;
        return !points.length ? NaN : (1 === points.length ? hypot(point.x - points[0].x, point.y - points[0].y) : points.reduce(function(dist, _, i) {
            if (i+1 < points.length)
            {
                dist = stdMath.min(dist, point_line_segment_distance(point, points[i], points[i+1]));
            }
            return dist;
        }, Infinity));
    },
    toSVG: function(svg) {
        return SVG('polyline', {
            'id': [this.id, false],
            'points': [this._points.map(function(p) {return Str(p.x)+','+Str(p.y);}).join(' '), this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var path = 'M '+(this._points.map(function(p) {
            return Str(p.x)+' '+Str(p.y);
        }).join(' L '));
        return arguments.length ? SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, svg) : path;
    },
    toTex: function() {
        var lines = this.lines;
        return '\\text{Polyline: }\\begin{cases}&'+lines.map(Tex).join('\\\\&')+'\\end{cases}';
    },
    toString: function() {
        return 'Polyline('+this.points.map(Str).join(',')+')';
    }
});
// 2D Elliptic Arc class
var Arc = makeClass(Curve, {
    constructor: function Arc(start, end, radiusX, radiusY, angle, largeArc, sweep) {
        var self = this,
            _radiusX = null,
            _radiusY = null,
            _angle = null,
            _largeArc = null,
            _sweep = null,
            _cos = 0,
            _sin = 0,
            _params = null,
            _length = null,
            _bbox = null,
            _hull = null
        ;

        if (start instanceof Arc) return start;
        if (!(self instanceof Arc)) return new Arc(start, end, radiusX, radiusY, angle, largeArc, sweep);
        _radiusX = new Value(stdMath.abs(Num(radiusX)));
        _radiusY = new Value(stdMath.abs(Num(radiusY)));
        _angle = new Value(angle);
        _cos = stdMath.cos(rad(_angle.val()));
        _sin = stdMath.sin(rad(_angle.val()));
        _largeArc = new Value(!!largeArc);
        _sweep = new Value(!!sweep);

        self.$super('constructor', [[start, end], {radiusX:_radiusX, radiusY:_radiusY, angle:_angle, largeArc:_largeArc, sweep:_sweep}]);

        def(self, 'start', {
            get: function() {
                return self.points[0];
            },
            set: function(start) {
                self.points[0] = start;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'end', {
            get: function() {
                return self.points[1];
            },
            set: function(end) {
                self.points[1] = end;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'radiusX', {
            get: function() {
                return _radiusX.val();
            },
            set: function(radiusX) {
                _radiusX.val(stdMath.abs(Num(radiusX)));
                if (_radiusX.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'radiusY', {
            get: function() {
                return _radiusY.val();
            },
            set: function(radiusY) {
                _radiusY.val(stdMath.abs(Num(radiusY)));
                if (_radiusY.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'angle', {
            get: function() {
                return _angle.val();
            },
            set: function(angle) {
                _angle.val(angle);
                _cos = stdMath.cos(rad(_angle.val()));
                _sin = stdMath.sin(rad(_angle.val()));
                if (_angle.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'cs', {
            get: function() {
                return [_cos, _sin];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'largeArc', {
            get: function() {
                return _largeArc.val();
            },
            set: function(largeArc) {
                _largeArc.val(!!largeArc);
                if (_largeArc.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'sweep', {
            get: function() {
                return _sweep.val();
            },
            set: function(sweep) {
                _sweep.val(!!sweep);
                if (_sweep.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'center', {
            get: function() {
                if (null == _params)
                {
                    _params = ellipse_params(self.start.x, self.start.y, self.end.x, self.end.y, self.largeArc, self.sweep, self.radiusX, self.radiusY, self.cs);
                }
                return _params[0];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'theta', {
            get: function() {
                if (null == _params)
                {
                    var c = self.center;
                }
                return [_params[1], _params[2]];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    // approximate
                    _length = curve_length(self._lines);
                }
                return _length;
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    _bbox = {
                        ymin: -Infinity,
                        xmin: -Infinity,
                        ymax: Infinity,
                        xmax: Infinity
                    };
                }
                return _bbox;
            },
            enumerable: false,
            configurable: false
        });
        def(self, '_hull', {
            get: function() {
                if (null == _hull)
                {
                    _hull = convex_hull(self._lines);
                }
                return _hull;
            },
            enumerable: false,
            configurable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _params = null;
                _length = null;
                _bbox = null;
                _hull = null;
            }
            return self.$super('isChanged', arguments);
        };
    },
    name: 'Arc',
    clone: function() {
        return new Arc(this.start.clone(), this.end.clone(), this.radiusX, this.radiusY, this.angle, this.largeArc, this.sweep);
    },
    transform: function(matrix) {
        var s = this.start.transform(matrix),
            e = this.end.transform(matrix),
            rX = this.radiusX,
            rY = this.radiusY,
            a = this.angle,
            r = deg(matrix.getRotationAngle()),
            s = matrix.getScale()
        ;
        return new Arc(
            s, e,
            rX * s.x,
            rY * s.y,
            a + r,
            this.largeArc,
            this.sweep
        );
    },
    isClosed: function() {
        return false;
    },
    isConvex: function() {
        return false;
    },
    hasMatrix: function() {
        return false;
    },
    getBoundingBox: function() {
        return this._bbox;
    },
    getConvexHull: function() {
        return this._hull;
    },
    f: function(t) {
        var c = this.center,
            theta = this.theta,
            rX = this.radiusX,
            rY = this.radiusY,
            cs = this.cs,
            ct = stdMath.cos(theta[0] + t*theta[1]),
            st = stdMath.sin(theta[0] + t*theta[1])
        ;
        return {
            x: c.x + rX*cs[0]*ct - rY*cs[1]*st,
            y: c.y + rY*cs[0]*st + rX*cs[1]*ct
        };
    },
    getPointAt: function(t) {
        t = Num(t);
        return 0 > t || 1 < t ? null : Point(this.f(t));
    },
    hasPoint: function(point) {
        return point_on_curve(point, this._lines);
    },
    hasInsidePoint: function(point, strict) {
        return strict ? false : this.hasPoint(point);
    },
    intersects: function(other) {
        var i;
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Circle)
        {
            i = curve_circle_intersection(this._lines, other.center, other.radius);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Ellipse)
        {
            i = curve_ellipse_intersection(this._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Arc)
        {
            i = curve_curve_intersection(this._lines, other._lines);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(this);
        }
        return false;
    },
    toSVG: function(svg) {
        var path = this.toSVGPath();
        return SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var p1 = this.start, p2 = this.end,
            rX = Str(this.radiusX), rY = Str(this.radiusY),
            a = Str(this.angle),
            l = Str(this.largeArc ? 1 : 0),
            s = Str(this.sweep ? 1 : 0),
            path = 'M '+Str(p1.x)+' '+Str(p1.y)+' A '+rX+' '+rY+' '+a+' '+l+' '+s+' '+Str(p2.x)+' '+Str(p2.y);
        return arguments.length ? SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, svg) : path;
    },
    toTex: function() {
        return '\\text{Arc: }\\left('+[Tex(this.start), Tex(this.end), Str(this.radiusX), Str(this.radiusY), Str(this.angle)+'\\text{°}', Str(this.largeArc ? 1 : 0), Str(this.sweep ?1 : 0)].join(',')+'\\right)';
    },
    toString: function() {
        return 'Arc('+[Str(this.start), Str(this.end), Str(this.radiusX), Str(this.radiusY), Str(this.angle)+'°', Str(this.largeArc), Str(this.sweep)].join(',')+')';
    }
});// 2D Quadratic Bezier class
var Bezier2 = makeClass(Bezier, {});// 2D Cubic Bezier class
var Bezier3 = makeClass(Bezier, {});// 2D Polygon class
// defined by vertices as a closed polyline
var Polygon = makeClass(Curve, {
    constructor: function Polygon(vertices) {
        var self = this,
            _length = null,
            _area = null,
            _bbox = null,
            _hull = null,
            _is_convex = null
        ;

        if (vertices instanceof Polygon) return vertices;
        if (!(self instanceof Polygon)) return new Polygon(vertices);
        self.$super('constructor', [vertices]);

        def(self, 'vertices', {
            get: function() {
                return self.points;
            },
            set: function(vertices) {
                self.points = vertices;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'edges', {
            get: function() {
                var v = self.points;
                return 1 < v.length ? v.map(function(vertex, i) {
                    return new Line(vertex, v[(i+1) % v.length]);
                }) : [];
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_lines', {
            get: function() {
                return self._points.concat([self._points[0]]);
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    _length = curve_length(self._lines);
                }
                return _length;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'area', {
            get: function() {
                if (null == _area)
                {
                    _area = curve_area(self._lines);
                }
                return _area;
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    _bbox = {
                        ymin: Infinity,
                        xmin: Infinity,
                        ymax: -Infinity,
                        xmax: -Infinity
                    };
                    for (var i=0,p=self._points,n=p.length; i<n; ++i)
                    {
                        _bbox.ymin = stdMath.min(_bbox.ymin, p[i].y);
                        _bbox.ymax = stdMath.max(_bbox.ymax, p[i].y);
                        _bbox.xmin = stdMath.min(_bbox.xmin, p[i].x);
                        _bbox.xmax = stdMath.max(_bbox.xmax, p[i].x);
                    }
                }
                return _bbox;
            },
            enumerable: false,
            configurable: false
        });
        def(self, '_hull', {
            get: function() {
                if (null == _hull)
                {
                    _hull = convex_hull(self._points);
                }
                return _hull;
            },
            enumerable: false,
            configurable: false
        });
        def(self, '_is_convex', {
            get: function() {
                if (null == _is_convex)
                {
                    _is_convex = is_convex(self._points);
                }
                return _is_convex;
            },
            enumerable: false,
            configurable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _length = null;
                _area = null;
                _bbox = null;
                _hull = null;
                _is_convex = null;
            }
            return self.$super('isChanged', arguments);
        };
    },
    name: 'Polygon',
    clone: function() {
        return new Polygon(this.vertices.map(function(vertex) {return vertex.clone();}));
    },
    transform: function(matrix) {
        return new Polygon(this.vertices.map(function(vertex) {return vertex.transform(matrix);}));
    },
    isClosed: function() {
        return true;
    },
    isConvex: function() {
        return this._is_convex;
    },
    getBoundingBox: function() {
        return this._bbox;
    },
    getConvexHull: function() {
        return this._hull;
    },
    hasPoint: function(point) {
        return 2 === point_inside_curve(point, {x:this._bbox.xmax+10, y:point.y}, this._lines);
    },
    hasInsidePoint: function(point, strict) {
        var inside = point_inside_curve(point, {x:this._bbox.xmax+10, y:point.y}, this._lines);
        return strict ? 1 === inside : 0 < inside;
    },
    intersects: function(other) {
        var i;
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Line)
        {
            i = curve_line_intersection(this._lines, other._points[0], other._points[1]);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Circle)
        {
            i = curve_circle_intersection(this._lines, other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Ellipse)
        {
            i = curve_ellipse_intersection(this._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false;
        }
        else if ((other instanceof Polyline) || (other instanceof Polygon) || (other instanceof Arc))
        {
            i = curve_curve_intersection(this._lines, other._lines);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(this);
        }
        return false;
    },
    toSVG: function(svg) {
        return SVG('polygon', {
            'id': [this.id, false],
            'points': [this._points.map(function(p) {return Str(p.x)+','+Str(p.y);}).join(' '), this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var path = 'M '+(this._lines.map(function(p) {
            return Str(p.x)+' '+Str(p.y);
        }).join(' L '))+' z';
        return arguments.length ? SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, svg) : path;
    },
    toTex: function() {
        return '\\text{Polygon: }'+'\\left(' + this.vertices.map(Tex).join(',') + '\\right)';
    },
    toString: function() {
        return 'Polygon('+this.vertices.map(Str).join(',')+')';
    }
});
// 2D Circle class
var Circle = makeClass(Curve, {
    constructor: function Circle(center, radius) {
        var self = this,
            _radius = null,
            _length = null,
            _area = null,
            _bbox = null,
            _hull = null
        ;

        if (center instanceof Circle) return center;
        if (!(self instanceof Circle)) return new Circle(center, radius);
        _radius = new Value(stdMath.abs(Num(radius)));
        self.$super('constructor', [[center], {radius:_radius}]);

        def(self, 'center', {
            get: function() {
                return self.points[0];
            },
            set: function(center) {
                self.points[0] = center;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'radius', {
            get: function() {
                return _radius.val();
            },
            set: function(radius) {
                _radius.val(stdMath.abs(Num(radius)));
                if (_radius.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    _length = TWO_PI * _radius.val();
                }
                return _length;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'area', {
            get: function() {
                if (null == _area)
                {
                    _area = PI * _radius.val() * _radius.val();
                }
                return _area;
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    var c = self.center, r = _radius.val();
                    _bbox = {
                        ymin: c.y - r,
                        xmin: c.x - r,
                        ymax: c.y + r,
                        xmax: c.x + r
                    };
                }
                return _bbox;
            },
            enumerable: false,
            configurable: false
        });
        def(self, '_hull', {
            get: function() {
                if (null == _hull)
                {
                    var c = self.center, r = _radius.val();
                    _hull = [
                        new Point(c.x-r, c.y-r),
                        new Point(c.x+r, c.y-r),
                        new Point(c.x+r, c.y+r),
                        new Point(c.x-r, c.y+r)
                    ];
                }
                return _hull;
            },
            enumerable: false,
            configurable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _length = null;
                _area = null;
                _bbox = null;
                _hull = null;
            }
            return self.$super('isChanged', arguments);
        };
    },
    name: 'Circle',
    clone: function() {
        return new Circle(this.center.clone(), this.radius);
    },
    transform: function(matrix) {
        var c = this.center,
            r = this.radius,
            ct = c.transform(matrix),
            pt = new Point(c.x+r, c.y+r).transform(matrix)
        ;
        return new Circle(ct, dist(ct, pt));
    },
    isClosed: function() {
        return true;
    },
    isConvex: function() {
        return true;
    },
    hasMatrix: function() {
        return false;
    },
    getBoundingBox: function() {
        return this._bbox;
    },
    getConvexHull: function() {
        return this._hull;
    },
    f: function(t) {
        var c = this.center, r = this.radius;
        t *= TWO_PI;
        return {
            x: c.x + r*stdMath.cos(t),
            y: c.y + r*stdMath.sin(t)
        };
    },
    getPointAt: function(t) {
        t = Num(t);
        return 0 > t || 1 < t ? null : Point(this.f(t));
    },
    hasPoint: function(point) {
        return 2 === point_inside_circle(point, this.center, this.radius);
    },
    hasInsidePoint: function(point, strict) {
        var inside = point_inside_circle(point, this.center, this.radius);
        return strict ? 1 === inside : 0 < inside;
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Circle)
        {
            var i = circle_circle_intersection(this.center, this.radius, other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(this);
        }
        return false;
    },
    toSVG: function(svg) {
        var c = this.center, r = this.radius;
        return SVG('circle', {
            'id': [this.id, false],
            'cx': [c.x, this.center.isChanged()],
            'cy': [c.y, this.center.isChanged()],
            'r': [r, this.values.radius.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var c = this.center, r = this.radius,
            path = 'M '+Str(c.x - r)+' '+Str(c.y)+' a '+Str(r)+' '+Str(r)+' 0 0 0 '+Str(r + r)+' 0 a '+Str(r)+' '+Str(r)+' 0 0 0 '+Str(-r - r)+' 0 z';
        return arguments.length ? SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, svg) : path;
    },
    toTex: function() {
        var c = this.center, r = Str(this.radius);
        return '\\text{Circle: }\\left|\\begin{pmatrix}\\frac{x'+signed(-c.x)+'}{'+r+'}\\\\\\frac{y'+signed(-c.y)+'}{'+r+'}\\end{pmatrix}\\right|^2 = 1';
    },
    toString: function() {
        return 'Circle('+[Str(this.center), Str(this.radius)].join(',')+')';
    }
});
// 2D Ellipse class
var Ellipse = makeClass(Curve, {
    constructor: function Ellipse(center, radiusX, radiusY, angle) {
        var self = this,
            _radiusX = null,
            _radiusY = null,
            _angle = null,
            _cos = 0,
            _sin = 0,
            _length = null,
            _area = null,
            _bbox = null,
            _hull = null
        ;

        if (center instanceof Ellipse) return center;
        if (!(self instanceof Ellipse)) return new Ellipse(center, radiusX, radiusY, angle);
        _radiusX = new Value(stdMath.abs(Num(radiusX)));
        _radiusY = new Value(stdMath.abs(Num(radiusY)));
        _angle = new Value(angle);
        _cos = stdMath.cos(rad(_angle.val()));
        _sin = stdMath.sin(rad(_angle.val()));

        self.$super('constructor', [[center], {radiusX:_radiusX, radiusY:_radiusY, angle:_angle}]);

        def(self, 'center', {
            get: function() {
                return self.points[0];
            },
            set: function(center) {
                self.points[0] = center;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'radiusX', {
            get: function() {
                return _radiusX.val();
            },
            set: function(radiusX) {
                _radiusX.val(stdMath.abs(Num(radiusX)));
                if (_radiusX.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'radiusY', {
            get: function() {
                return _radiusY.val();
            },
            set: function(radiusY) {
                _radiusY.val(stdMath.abs(Num(radiusY)));
                if (_radiusY.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'angle', {
            get: function() {
                return _angle.val();
            },
            set: function(angle) {
                _angle.val(angle);
                _cos = stdMath.cos(rad(_angle.val()));
                _sin = stdMath.sin(rad(_angle.val()));
                if (_angle.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'cs', {
            get: function() {
                return [_cos, _sin];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    // approximate
                    _length = PI * (3*(_radiusX.val()+_radiusY.val())-sqrt((3*_radiusX.val()+_radiusY.val())*(_radiusX.val()+3*_radiusY.val())));
                }
                return _length;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'area', {
            get: function() {
                if (null == _area)
                {
                    _area = PI * _radiusX.val() * _radiusY.val();
                }
                return _area;
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    var ch = self._hull;
                    _bbox = {
                        ymin: stdMath.min(ch[0].y,ch[1].y,ch[2].y,ch[3].y),
                        xmin: stdMath.min(ch[0].x,ch[1].x,ch[2].x,ch[3].x),
                        ymax: stdMath.max(ch[0].y,ch[1].y,ch[2].y,ch[3].y),
                        xmax: stdMath.max(ch[0].x,ch[1].x,ch[2].x,ch[3].x)
                    };
                }
                return _bbox;
            },
            enumerable: false,
            configurable: false
        });
        def(self, '_hull', {
            get: function() {
                if (null == _hull)
                {
                    var c = self.center, rX = _radiusX.val(), rX = _radiusY.val(),
                        m = new Matrix(
                            _cos, -_sin, c.x,
                            _sin, _cos, c.y,
                            0, 0, 1
                        );
                    _hull = [
                        new Point(-rX, -rY).transform(m),
                        new Point(rX, -rY).transform(m),
                        new Point(rX, rY).transform(m),
                        new Point(-rX, rY).transform(m)
                    ];
                }
                return _hull;
            },
            enumerable: false,
            configurable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _length = null;
                _area = null;
                _bbox = null;
                _hull = null;
            }
            return self.$super('isChanged', arguments);
        };
    },
    name: 'Ellipse',
    clone: function() {
        return new Ellipse(this.center.clone(), this.radiusX, this.radiusY, this.angle);
    },
    transform: function(matrix) {
        var c = this.center,
            rX = this.radiusX,
            rY = this.radiusY,
            a = this.angle,
            t = matrix.getTranslation(),
            r = deg(matrix.getRotationAngle()),
            s = matrix.getScale()
        ;
        return new Ellipse(
            new Point(c.x + t.x, c.y + t.y),
            rX * s.x,
            rY * s.y,
            a + r
        );
    },
    isClosed: function() {
        return true;
    },
    isConvex: function() {
        return true;
    },
    hasMatrix: function() {
        return false;
    },
    getBoundingBox: function() {
        return this._bbox;
    },
    getConvexHull: function() {
        return this._hull;
    },
    f: function(t) {
        var c = this.center,
            rX = this.radiusX,
            rY = this.radiusY,
            cs = this.cs,
            ct = stdMath.cos(t*TWO_PI),
            st = stdMath.sin(t*TWO_PI)
        ;
        return {
            x: c.x + rX*cs[0]*ct - rY*cs[1]*st,
            y: c.y + rY*cs[0]*st + rX*cs[1]*ct
        };
    },
    getPointAt: function(t) {
        t = Num(t);
        return 0 > t || 1 < t ? null : Point(this.f(t));
    },
    hasPoint: function(point) {
        return 2 === point_inside_ellipse(point, this.center, this.radiusX, this.radiusY, this.cs);
    },
    hasInsidePoint: function(point, strict) {
        var inside = point_inside_ellipse(point, this.center, this.radiusX, this.radiusY, this.cs);
        return strict ? 1 === inside : 0 < inside;
    },
    intersects: function(other) {
        var i;
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Circle)
        {
            i = curve_circle_intersection(this._lines, other.center, other.radius);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Ellipse)
        {
            i = curve_ellipse_intersection(this._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(this);
        }
        return false;
    },
    toSVG: function(svg) {
        var c = this.center,
            rX = this.radiusX,
            rY = this.radiusY,
            a = this.angle;
        return SVG('ellipse', {
            'id': [this.id, false],
            'cx': [c.x, this.center.isChanged()],
            'cy': [c.y, this.center.isChanged()],
            'rx': [rX, this.values.radiusX.isChanged()],
            'ry': [rY, this.values.radiusY.isChanged()],
            'transform': ['rotate('+Str(a)+' '+Str(c.x)+' '+Str(c.y)+')', this.center.isChanged() || this.values.angle.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var c = this.center, rX = this.radiusX, rY = this.radiusY, a = this.angle,
            p1 = this.f(0), p2 = this.f(0.5),
            path = 'M '+Str(p1.x)+' '+Str(p1.y)+' A '+Str(rX)+' '+Str(rY)+' '+Str(a)+' 0 1 '+Str(p2.x)+' '+Str(p2.y)+' A '+Str(rX)+' '+Str(rY)+' '+Str(a)+' 0 1 '+Str(p1.x)+' '+Str(p1.y)+' z';
        return arguments.length ? SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, svg) : path;
    },
    toTex: function() {
        var a = Str(this.angle)+'\\text{°}',
            c = this.center, rX = Str(this.radiusX), rY = Str(this.radiusY);
        return '\\text{Ellipse: }\\left|\\begin{pmatrix}\\cos('+a+')&-\\sin('+a+')\\\\sin('+a+')&\\cos('+a+')\\end{pmatrix}\\begin{pmatrix}\\frac{x'+signed(-c.x)+'}{'+rX+'}\\\\\\frac{y'+signed(-c.y)+'}{'+rY+'}\\end{pmatrix}\\right|^2 = 1';
    },
    toString: function() {
        return 'Ellipse('+[Str(this.center), Str(this.radiusX), Str(this.radiusY), Str(this.angle)+'°'].join(',')+')';
    }
});
// 2D generic Shape class
// container for primitives shapes
var Shape = makeClass(Primitive, {});// Plane
// scene container for 2D geometric objects
var Plane = makeClass(null, {
    constructor: function Plane(dom, width, height) {
        var self = this,
            svg = null,
            svgEl = null,
            objects = null,
            isChanged = true,
            render, raf;

        if (!(self instanceof Plane)) return new Plane(dom, width, height);

        width = stdMath.abs(Num(width));
        height = stdMath.abs(Num(height));
        objects = [];
        svgEl = {};

        def(self, 'width', {
            get: function() {
                return width;
            },
            set: function(w) {
                w = stdMath.abs(Num(w));
                if (width !== w) isChanged = true;
                width = w;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'height', {
            get: function() {
                return height;
            },
            set: function(h) {
                h = stdMath.abs(Num(h));
                if (height !== h) isChanged = true;
                height = h;
            },
            enumerable: true,
            configurable: false
        });
        self.add = function(o) {
            if (o instanceof Primitive)
            {
                if (!HAS.call(svgEl, o.id))
                {
                    svgEl[o.id] = undef;
                    objects.push(o);
                    isChanged = true;
                }
            }
            return self;
        };
        self.remove = function(o) {
            var el, index = objects.indexOf(o);
            if (-1 !== index)
            {
                el = svgEl[o.id];
                if (isBrowser && el) el.parentNode.removeChild(el);
                delete svgEl[o.id];
                objects.splice(index, 1);
                isChanged = true;
            }
            return self;
        };
        self.dispose = function() {
            if (isBrowser && svg && svg.parentNode) svg.parentNode.removeChild(svg);
            if (isBrowser) cancelAnimationFrame(raf);
            svg = null;
            svgEl = null;
            objects = null;
            return self;
        };
        self.toSVG = function() {
        };
        render = function render() {
            if (!objects) return;
            if (!svg)
            {
                svg = SVG('svg', {
                'xmlns': ['http://www.w3.org/2000/svg', false],
                'style': ['position:absolute;width:100%;height:100%', false],
                'viewBox': ['0 0 '+Str(width)+' '+Str(height)+'', isChanged]
                }, null);
                dom.appendChild(svg);
            }
            else if (isChanged)
            {
                SVG('svg', {
                'viewBox': ['0 0 '+Str(width)+' '+Str(height)+'', isChanged]
                }, svg);
            }
            objects.forEach(function(o) {
                if (o instanceof Primitive)
                {
                    var el = svgEl[o.id];
                    if (undef === el)
                    {
                        svgEl[o.id] = el = o.toSVG(null);
                        if (el) svg.appendChild(el);
                    }
                    else if (el && o.isChanged())
                    {
                        o.toSVG(el);
                    }
                    o.isChanged(false);
                }
            });
            isChanged = false;
            raf = requestAnimationFrame(render);
        };
        if (isBrowser) raf = requestAnimationFrame(render);
    },
    dispose: null,
    add: null,
    remove: null,
    toSVG: null
});
// ---- utilities -----
function is_strictly_zero(x)
{
    return abs(x) < Number.EPSILON;
}
function is_almost_zero(x, eps)
{
    if (null == eps) eps = EPS;
    return abs(x) < eps;
}
function is_almost_equal(a, b, eps)
{
    if (null == eps) eps = EPS;
    return abs(a - b) < eps;
}
function deg(rad)
{
    return rad * 180 / PI;
}
function rad(deg)
{
    return deg * PI / 180;
}
function hypot(dx, dy)
{
    dx = abs(dx);
    dy = abs(dy)
    var r = 0;
    if (0 === dx)
    {
        return dy;
    }
    else if (0 === dy)
    {
        return dx;
    }
    else if (dx < dy)
    {
        r = dy/dx;
        return dx*sqrt(1 + r*r);
    }
    else if (dx > dy)
    {
        r = dx/dy;
        return dy*sqrt(1 + r*r);
    }
    return dx*sqrt2;
}
function dotp(x1, y1, x2, y2)
{
    return x1*x2 + y1*y2;
}
function crossp(x1, y1, x2, y2)
{
    return x1*y2 - y1*x2;
}
function angle(x1, y1, x2, y2)
{
    return stdMath.acos(dotp(x1, y1, x2, y2)/hypot(x1, y1)/hypot(x2, y2));
}
function sign(x)
{
    return 0 > x ? -1 : 1;
}
function signed(x, add)
{
    return 0 > x ? Str(x) : ((false === add ? '' : '+') + Str(x));
}
function dist(p1, p2)
{
    return hypot(p1.x - p2.x, p1.y - p2.y);
}
function dist2(p1, p2)
{
    var dx = p1.x - p2.x, dy = p1.y - p2.y;
    return dx*dx + dy*dy;
}
function polar_angle(p1, p2)
{
    var a = stdMath.atan2(p2.y - p1.y, p2.x - p1.x);
    return a < 0 ? a + TWO_PI : a;
}
function dir(p1, p2, p3)
{
    var dx1 = p1.x - p3.x, dx2 = p2.x - p3.x,
        dy1 = p1.y - p3.y, dy2 = p2.y - p3.y;
    return dx1*dy2 - dy1*dx2;
}
function p_eq(p1, p2)
{
    return is_almost_zero(p1.x - p2.x) && is_almost_zero(p1.y - p2.y);
}
function point_line_distance(p0, p1, p2)
{
    var x1 = p1.x, y1 = p1.y,
        x2 = p2.x, y2 = p2.y,
        x = p0.x, y = p0.y,
        dx = x2 - x1, dy = y2 - y1,
        d = hypot(dx, dy)
    ;
    if (is_strictly_zero(d)) return hypot(x - x1, y - y1);
    return abs(dx*(y1 - y) - dy*(x1 - x)) / d;
}
function point_line_segment_distance(p0, p1, p2)
{
    var x1 = p1.x, y1 = p1.y,
        x2 = p2.x, y2 = p2.y,
        x = p0.x, y = p0.y,
        t = 0, dx = x2 - x1, dy = y2 - y1,
        d = hypot(dx, dy)
    ;
    if (is_strictly_zero(d)) return hypot(x - x1, y - y1);
    t = stdMath.max(0, stdMath.min(1, ((x - x1)*dx + (y - y1)*dy) / d));
    return hypot(x - x1 - t*dx, y - y1 - t*dy);
}
function point_between(p, p1, p2)
{
    var t = 0,
        dxp = p.x - p1.x,
        dx = p2.x - p1.x,
        dyp = p.y - p1.y,
        dy = p2.y - p1.y
    ;
    if (is_almost_equal(dyp*dx, dy*dxp))
    {
        // colinear and inside line segment of p1-p2
        t = is_strictly_zero(dx) ? dyp/dy : dxp/dx;
        return (t >= 0) && (t <= 1);
    }
    return false;
}
function lin_solve(a, b)
{
    return is_strictly_zero(a) ? false : [-b/a];
}
function quad_solve(a, b, c)
{
    if (is_strictly_zero(a)) return lin_solve(b, c);
    var D = b*b - 4*a*c, DS = 0;
    if (is_almost_zero(D)) return [-b/(2*a)];
    if (0 > D) return false;
    DS = sqrt(D);
    return [(-b-DS)/(2*a), (-b+DS)/(2*a)];
}
function cub_solve(a, b, c, d)
{
    if (is_strictly_zero(a)) return quad_solve(b, c, d);
    var A = b/a, B = c/a, C = d/a,
        Q = (3*B - A*A)/9, QS = 0,
        R = (9*A*B - 27*C - 2*pow(A, 3))/54,
        D = pow(Q, 3) + pow(R, 2), DS = 0,
        S = 0, T = 0, Im = 0, th = 0
    ;
    if (D >= 0)
    {
        // complex or duplicate roots
        DS = sqrt(D);
        S = sign(R + DS)*pow(abs(R + DS), 1/3);
        T = sign(R - DS)*pow(abs(R - DS), 1/3);
        Im = abs(sqrt3*(S - T)/2); // imaginary part
        return is_almost_zero(Im) ? [
        -A/3 + (S + T),
        -A/3 - (S + T)/2
        ] : [
        -A/3 + (S + T)
        ];
    }
    else
    {
        // distinct real roots
        th = stdMath.acos(R/sqrt(-pow(Q, 3)));
        QS = 2*sqrt(-Q);
        return [
        QS*stdMath.cos(th/3) - A/3,
        QS*stdMath.cos((th + TWO_PI)/3) - A/3,
        QS*stdMath.cos((th + 2*TWO_PI)/3) - A/3
        ];
    }
}
function line_line_intersection(a, b, c, k, l, m)
{
    /*
    https://live.sympy.org/
    ax+by+c=0
    kx+ly+m=0
    x,y={((b*m - c*l)/(a*l - b*k), -(a*m - c*k)/(a*l - b*k))}
    */
    var D = a*l - b*k;
    // zero, infinite or one point
    return is_strictly_zero(D) ? false : {x:(b*m - c*l)/D, y:(c*k - a*m)/D};
}
function line_quadratic_intersection(m, n, k, a, b, c, d, e, f)
{
    /*
    https://live.sympy.org/
    mx+ny+k=0
    ax^2+by^2+cxy+dx+ey+f=0
    x,y,a,b,c,d,e,f,n,m,k = symbols('x y a b c d e f n m k', real=True)
    nonlinsolve([a*x**2+b*y**2+c*x*y+d*x+e*y+f, m*x+n*y+k], [x, y])
    x,y={(-(k + n*(-m*sqrt(-4*a*b*k**2 + 4*a*e*k*n - 4*a*f*n**2 + 4*b*d*k*m - 4*b*f*m**2 + c**2*k**2 - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d**2*n**2 - 2*d*e*m*n + e**2*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)) - (2*a*k*n - c*k*m - d*m*n + e*m**2)/(2*(a*n**2 + b*m**2 - c*m*n))))/m, -m*sqrt(-4*a*b*k**2 + 4*a*e*k*n - 4*a*f*n**2 + 4*b*d*k*m - 4*b*f*m**2 + c**2*k**2 - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d**2*n**2 - 2*d*e*m*n + e**2*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)) - (2*a*k*n - c*k*m - d*m*n + e*m**2)/(2*(a*n**2 + b*m**2 - c*m*n))), (-(k + n*(m*sqrt(-4*a*b*k**2 + 4*a*e*k*n - 4*a*f*n**2 + 4*b*d*k*m - 4*b*f*m**2 + c**2*k**2 - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d**2*n**2 - 2*d*e*m*n + e**2*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)) - (2*a*k*n - c*k*m - d*m*n + e*m**2)/(2*(a*n**2 + b*m**2 - c*m*n))))/m, m*sqrt(-4*a*b*k**2 + 4*a*e*k*n - 4*a*f*n**2 + 4*b*d*k*m - 4*b*f*m**2 + c**2*k**2 - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d**2*n**2 - 2*d*e*m*n + e**2*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)) - (2*a*k*n - c*k*m - d*m*n + e*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)))}
    */
    var x, y, x1 = 0, y1 = 0, x2 = 0, y2 = 0, D = 0, R = 0, F = 0;
    if (is_strictly_zero(m))
    {
        y = lin_solve(n, k);
        if (!y) return false;
        y1 = y[0];
        x = quad_solve(a, c*y1+d, b*y1*y1+e*y1+f);
        if (!x) return false;
        return 2 === x.length ? [{x:x[0],y:y1},{x:x[1],y:y1}] : [{x:x[0],y:y1}];
    }
    else
    {
        R = 2*(a*n*n + b*m*m - c*m*n);
        if (is_strictly_zero(R)) return false;
        D = -4*a*b*k*k + 4*a*e*k*n - 4*a*f*n*n + 4*b*d*k*m - 4*b*f*m*m + c*c*k*k - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d*d*n*n - 2*d*e*m*n + e*e*m*m;
        if (0 > D) return false;
        F = 2*a*k*n - c*k*m - d*m*n + e*m*m;
        if (is_strictly_zero(D)) return [{x:-(k + n*(-F/R))/m, y:-F/R}];
        D = sqrt(D);
        return [{x:-(k + n*((-m*D - F)/R))/m, y:(-m*D - F)/R},{x:-(k + n*((m*D - F)/R))/m, y:(m*D - F)/R}];
    }
}
function point_inside_rect(p, ymin, xmin, ymax, xmax)
{
    if (is_almost_equal(p.x, xmin) && p.y >= ymin && p.y <= ymax) return 2;
    if (is_almost_equal(p.x, xmax) && p.y >= ymin && p.y <= ymax) return 2;
    if (is_almost_equal(p.y, ymin) && p.x >= xmin && p.x <= xmax) return 2;
    if (is_almost_equal(p.y, ymax) && p.x >= xmin && p.x <= xmax) return 2;
    return p.x >= xmin && p.x <= xmax && p.y >= ymin && p.y <= ymax ? 1 : 0;
}
function point_inside_circle(p, center, radius)
{
    var dx = p.x - center.x,
        dy = p.y - center.y,
        d2 = dx*dx + dy*dy,
        r2 = radius*radius;
    if (is_almost_equal(d2, r2)) return 2;
    return d2 < r2 ? 1 : 0;
}
function point_inside_ellipse(p, center, radiusX, radiusY, cs)
{
    var rX2 = radiusX*radiusX,
        rY2 = radiusY*radiusY,
        c = cs[0],
        s = cs[1],
        dx0 = p.x - center.x,
        dy0 = p.y - center.y,
        dx = c*dx0 - s*dy0,
        dy = c*dy0 + s*dx0,
        d2 = dx*dx/rX2 + dy*dy/rY2
    ;
    if (is_almost_equal(d2, 1)) return 2;
    return d2 < 1 ? 1 : 0;
}
function point_on_curve(p, curve_points)
{
    get_point = get_point || identity;
    for (var i=0,n=curve_points.length-1; i<n; ++i)
    {
        if (point_between(p, curve_points[i], curve_points[i+1]))
            return true;
    }
    return false;
}
function point_inside_curve(p, maxp, curve_points)
{
    get_point = get_point || identity;
    for (var p1,p2,i=0,intersects=0,n=curve_points.length-1; i<n; ++i)
    {
        p1 = curve_points[i];
        p2 = curve_points[i+1];
        if (point_between(p, p1, p2)) return 2;
        if (line_segments_intersection(p, maxp, p1, p2)) ++intersects;
    }
    return intersects & 1 ? 1 : 0;
}
function line2linear(p1, p2)
{
    return [p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y];
}
function circle2quadratic(center, radius)
{
    var x0 = center.x, y0 = center.y;
    return [1, 1, 0, -2*x0, -2*y0, x0*x0 + y0*y0 - radius*radius];
}
function ellipse2quadratic(center, radiusX, radiusY, cs)
{
    //cs = cs || [stdMath.cos(angle), stdMath.sin(angle)];
    var x0 = center.x, y0 = center.y,
        a = radiusX, b = radiusY,
        cos_a = cs[0], sin_a = cs[1],
        A = a*a*sin_a*sin_a + b*b*cos_a*cos_a,
        C = a*a*cos_a*cos_a + b*b*sin_a*sin_a,
        B = 2*(b*b - a*a)*sin_a*cos_a;
    return [A, C, B, -2*A*x0 - B*y0, -B*x0 - 2*C*y0, A*x0*x0 + B*x0*y0 + C*y0*y0 - a*a*b*b];
}
function line_segments_intersection(p1, p2, p3, p4)
{
    var p = line_line_intersection(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        p4.y - p3.y, p3.x - p4.x, p4.x*p3.y - p3.x*p4.y
        );
    return p && point_between(p, p1, p2) && point_between(p, p3, p4) ? p : false;
}
function line_circle_intersection(p1, p2, abcdef)
{
    if (3 < arguments.length) abcdef = circle2quadratic(abcdef, arguments[3]);
    var p = new Array(2), pi = 0, i, n,
        s = line_quadratic_intersection(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        abcdef[0], abcdef[1], abcdef[2], abcdef[3], abcdef[4], abcdef[5]
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (point_between(s[i], p1, p2))
            p[pi++] = s[i];
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_ellipse_intersection(p1, p2, abcdef)
{
    if (5 < arguments.length) abcdef = ellipse2quadratic(abcdef, arguments[3], arguments[4], arguments[5]);
    var p = new Array(2), pi = 0, i, n,
        s = line_quadratic_intersection(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        abcdef[0], abcdef[1], abcdef[2], abcdef[3], abcdef[4], abcdef[5]
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (point_between(s[i], p1, p2))
            p[pi++] = s[i];
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_bezier2_intersection(p1, p2, c)
{
    var p = new Array(2), pi = 0, i, n,
        M = p2.y - p1.y,
        N = p1.x - p2.x,
        K = p2.x*p1.y - p1.x*p2.y,
        A = c[0].y*c[0].y - 4*c[0].y*c[1].y + 2*c[0].y*c[2].y + 4*c[1].y*c[1].y - 4*c[1].y*c[2].y + c[2].y*c[2].y,
        B = c[0].x*c[0].x - 4*c[0].x*c[1].x + 2*c[0].x*c[2].x + 4*c[1].x*c[1].x - 4*c[1].x*c[2].x + c[2].x*c[2].x,
        C = -2*c[0].x*c[0].y + 4*c[0].x*c[1].y - 2*c[0].x*c[2].y + 4*c[1].x*c[0].y - 8*c[1].x*c[1].y + 4*c[1].x*c[2].y - 2*c[2].x*c[0].y + 4*c[2].x*c[1].y - 2*c[2].x*c[2].y,
        D = 2*c[0].x*c[0].y*c[2].y - 4*c[0].x*c[1].y*c[1].y + 4*c[0].x*c[1].y*c[2].y - 2*c[0].x*c[2].y*c[2].y + 4*c[1].x*c[0].y*c[1].y - 8*c[1].x*c[0].y*c[2].y + 4*c[1].x*c[1].y*c[2].y - 2*c[2].x*c[0].y*c[0].y + 4*c[2].x*c[0].y*c[1].y + 2*c[2].x*c[0].y*c[2].y - 4*c[2].x*c[1].y*c[1].y,
        E = -2*c[0].x*c[0].x*c[2].y + 4*c[0].x*c[1].x*c[1].y + 4*c[0].x*c[1].x*c[2].y + 2*c[0].x*c[2].x*c[0].y - 8*c[0].x*c[2].x*c[1].y + 2*c[0].x*c[2].x*c[2].y - 4*c[1].x*c[1].x*c[0].y - 4*c[1].x*c[1].x*c[2].y + 4*c[1].x*c[2].x*c[0].y + 4*c[1].x*c[2].x*c[1].y - 2*c[2].x*c[2].x*c[0].y,
        F = c[0].x*c[0].x*c[2].y*c[2].y - 4*c[0].x*c[1].x*c[1].y*c[2].y - 2*c[0].x*c[2].x*c[0].y*c[2].y + 4*c[0].x*c[2].x*c[1].y*c[1].y + 4*c[1].x*c[1].x*c[0].y*c[2].y - 4*c[1].x*c[2].x*c[0].y*c[1].y + c[2].x*c[2].x*c[0].y*c[0].y,
        s = line_quadratic_intersection(
        M, N, K,
        A, B, C, D, E, F
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (point_between(s[i], p1, p2))
            p[pi++] = s[i];
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_bezier3_intersection(p1, p2, c)
{
}
function circle_circle_intersection(c1, r1, c2, r2)
{
    if (r2 > r1)
    {
        var tmp = r1;
        r1 = r2;
        r2 = tmp;
        tmp = c1;
        c1 = c2;
        c2 = tmp;
    }
    var dx = c2.x - c1.x, dy = c2.y - c1.y, d = hypot(dx, dy);
    if (is_almost_zero(d) && is_almost_equal(r1, r2))
    {
        // same circles, they intersect at all points
        return false;
    }
    if (d > r1+r2 || d+r2 < r1)
    {
        // circle (c2,r2) is outside circle (c1,r1) and does not intersect
        // or
        // circle (c2,r2) is inside circle (c1,r1) and does not intersect
        return false;
    }
    // circles intersect at 1 or 2 points
    dx /= d; dy /= d;
    var a = (r1*r1 - r2*r2 + d*d) / (2 * d),
        px = c1.x + a*dx,
        py = c1.y + a*dy,
        h = sqrt(r1*r1 - a*a)
    ;
    return is_strictly_zero(h) ? [{x:px, y:py}] : [{x:px + h*dy, y:py - h*dx}, {x:px - h*dy, y:py + h*dx}];
}
function curve_line_intersection(curve_points, p1, p2)
{
    var i = [], j, p, n = curve_points.length-1;
    for (j=0; j<n; ++j)
    {
        p = line_segments_intersection(
            curve_points[j], curve_points[j+1],
            p1, p2
        );
        if (p) i.push(p);
    }
    return i.length ? i : false;
}
function curve_circle_intersection(curve_points, center, radius)
{
    var i = [], j, k, p, n = curve_points.length-1,
        abcdef = circle2quadratic(center, radius);
    for (j=0; j<n; ++j)
    {
        p = line_circle_intersection(curve_points[j], curve_points[j+1], abcdef);
        if (p) i.push.apply(i, p);
    }
    return i.length ? i : false;
}
function curve_ellipse_intersection(curve_points, center, radiusX, radiusY, cs)
{
    var i = [], j, k, p, n = curve_points.length-1,
        abcdef = ellipse2quadratic(center, radiusX, radiusY, cs);
    for (j=0; j<n; ++j)
    {
        p = line_ellipse_intersection(curve_points[j], curve_points[j+1], abcdef);
        if (p) i.push.apply(i, p);
    }
    return i.length ? i : false;
}
function curve_curve_intersection(curve1_points, curve2_points)
{
    var i = [], j, k, p,
        n1 = curve1_points.length-1,
        n2 = curve2_points.length-1;
    for (j=0; j<n1; ++j)
    {
        for (k=0; k<n2; ++k)
        {
            p = line_segments_intersection(
                curve1_points[j], curve1_points[j+1],
                curve2_points[k], curve2_points[k+1]
            );
            if (p) i.push(p);
        }
    }
    return i.length ? i : false;
}
function curve_length(curve_points)
{
    get_point = get_point || identity;
    for (var p1,p2,length=0,i=0,n=curve_points.length-1; i<n; ++i)
    {
        p1 = curve_points[i];
        p2 = curve_points[i+1];
        length += hypot(p1.x - p2.x, p1.y - p2.y);
    }
    return length;
}
function curve_area(curve_points)
{
    get_point = get_point || identity;
    for (var p1,p2,area=0,i=0,n=curve_points.length-1; i<n; ++i)
    {
        p1 = curve_points[i];
        p2 = curve_points[i+1];
        // shoelace formula
        area += crossp(p1.x, p1.y, p2.x, p2.y)/2;
    }
    return area;
}
function sample_curve(f, n, pixelSize, do_refine)
{
    if (null == n) n = NUM_POINTS;
    if (null == pixelSize) pixelSize = PIXEL_SIZE;
    var i, points = [];
    if (do_refine)
    {
        points.push(f(0));
        for (i=0; i<n; ++i)
        {
            subdivide_curve(points, f, 0 === i ? 0 : i/n, n === i+1 ? 1 : (i+1)/n, pixelSize);
        }
    }
    else
    {
        for (i=0; i<=n; ++i)
        {
            points.push(f(0 === i ? 0 : (n === i ? 1 : i/n)));
        }
    }
    return points;
}
function subdivide_curve(points, f, l, r, pixelSize, pl, pr)
{
    if ((l >= r) || is_almost_equal(l, r)) return;
    var m = (l + r) / 2, left = pl || f(l), right = pr || f(r), middle = f(m);
    if (point_line_distance(middle, left, right) <= pixelSize)
    {
        // no more refinement
        // return linear interpolation between left and right
        points.push(right);
    }
    else
    {
        // recursively subdivide to refine samples with high enough curvature
        subdivide_curve(points, f, l, m, pixelSize, left, middle);
        subdivide_curve(points, f, m, r, pixelSize, middle, right);
    }
}
/*function bezier0(t, p)
{
    return p[0];
}*/
function bezier1(t, p)
{
    var b00 = p[0], b01 = p[1], i = 1-t;
    return {
        x: i*b00.x + t*b01.x,
        y: i*b00.y + t*b01.y
    };
}
function bezier2(t, p)
{
    return bezier1(t, [bezier1(t, [p[0], p[1]]), bezier1(t, [p[1], p[2]])]);
}
function bezier3(t, p)
{
    return bezier1(t, [bezier2(t, [p[0], p[1], p[2]]), bezier2(t, [p[1], p[2], p[3]])]);
}
function convex_hull(points)
{
    // https://en.wikipedia.org/wiki/Convex_hull
    var pc = points.length;

    // at least 3 points must define a non-trivial convex hull
    if (3 > pc) return points;

    var p0 = points[0], i0 = 0;
    points.forEach(function(p, i) {
        if ((p.y < p0.y) || (is_almost_equal(p.y, p0.y) && (p.x < p0.x)))
        {
            p0 = p;
            i0 = i;
        }
    });
    points.splice(i0, 1);
    --pc;

    var ps = points
        .map(function(p, i) {
            return [polar_angle(p0, p), i];
        })
        .sort(sort_asc0)
        .map(function(a) {
            return points[a[1]];
        });

    var convexHull = [p0, ps[0], ps[1]], hullSize = 3, i;

    for (i=2; i<pc; ++i)
    {
        while (0 <= dir(ps[i], convexHull[hullSize-1], convexHull[hullSize-2]))
        {
            convexHull.pop();
            --hullSize;
        }
        convexHull.push(ps[i]);
        ++hullSize;
    }
    return convexHull;
}
function in_convex_hull(convexHull, p, strict)
{
    var hl = convexHull.length, i, p0, p1, xp;
    if (!hl) return false;

    for (i=0; i<hl; ++i)
    {
        p0 = convexHull[i];
        p1 = convexHull[(i+1) % hl];
        xp = dir(p1, p, p0);
        if ((strict && xp < 0) || (!strict && xp <= 0))  return false;
    }
    return true;
}
function is_convex(points)
{
    // https://stackoverflow.com/a/45372025/3591273
    var n = points.length;
    if (n < 3) return false;

    var old_x = points[n-2].x, old_y = points[n-2].y,
        new_x = points[n-1].x, new_y = points[n-1].y,
        old_direction = 0,
        new_direction = stdMath.atan2(new_y - old_y, new_x - old_x),
        angle_sum = 0, angle = 0, orientation = 0,
        newpoint = null
    ;
    for (ndx=0; ndx<n; ++ndx)
    {
        newpoint = points[ndx];
        old_x = new_x;
        old_y = new_y;
        old_direction = new_direction;
        new_x = newpoint.x;
        new_y = newpoint.y;
        new_direction = stdMath.atan2(new_y - old_y, new_x - old_x);
        angle = new_direction - old_direction;
        if (angle <= -PI)
        {
            angle += TWO_PI
        }
        else if (angle > PI)
        {
            angle -= TWO_PI
        }
        if (0 === ndx)
        {
            if (0 === angle) return false;
            orientation = 0 < angle ? 1 : -1;
        }
        else
        {
            if (orientation * angle <= 0) return false;
        }
        angle_sum += angle;
    }
    return 1 === abs(stdMath.round(angle_sum / TWO_PI));
}
/*function ellipse_point(cx, cy, rx, ry, angle, theta, cs)
{
    var M = rx*stdMath.cos(theta), N = ry*stdMath.sin(theta);
    cs = cs || [stdMath.cos(angle), stdMath.sin(angle)];
    return {
        x: cx + cs[0]*M - cs[1]*N,
        y: cy + cs[1]*M + cs[0]*N
    };
}*/
function ellipse_params(x1, y1, x2, y2, fa, fs, rx, ry, cs)
{
    // Step 1: simplify through translation/rotation
    var x =  cs[0]*(x1 - x2)/2 + cs[1]*(y1 - y2)/2,
        y = -cs[1]*(x1 - x2)/2 + cs[0]*(y1 - y2)/2,
        px = x*x, py = y*y, prx = rx*rx, pry = ry*ry
        ;/*,L = px/prx + py/pry;

    if (L > 1)
    {
        // correct out-of-range radii
        rx = sqrt(L)*rx;
        ry = sqrt(L)*ry;
    }*/

    // Step 2 + 3: compute center
    var M = sqrt(abs((prx*pry - prx*py - pry*px)/(prx*py + pry*px)))*(fa === fs ? -1 : 1),
        _cx = M*(rx*y)/ry,
        _cy = M*(-ry*x)/rx,

        cx = cs[0]*_cx - cs[1]*_cy + (x1 + x2)/2,
        cy = cs[1]*_cx + cs[0]*_cy + (y1 + y2)/2
    ;

    // Step 4: compute θ and dθ
    var theta = vector_angle(1, 0, (x - _cx)/rx, (y - _cy)/ry),
        dTheta = deg(vector_angle(
            (x - _cx)/rx, (y - _cy)/ry,
            (-x - _cx)/rx, (-y - _cy)/ry
        )) % 360;

    if (!fs && dTheta > 0) dTheta -= 360;
    if (fs && dTheta < 0) dTheta += 360;

    return [{x:cx, y:cy}, theta, rad(dTheta)];
}
function vector_angle(ux, uy, vx, vy)
{
    return sign(ux*vy - uy*vx)*angle(ux, uy, vx, vy);
}

// ----------------------
function merge(keys, a, b)
{
    if (keys)
    {
        keys.forEach(function(k) {
            if (HAS.call(b, k))
                a[k] = b[k];
        });
    }
    else
    {
        for (var k in b)
        {
            if (HAS.call(b, k))
                a[k] = b[k];
        }
    }
    return a;
}
function SVG(tag, atts, svg, g, ga)
{
    var setAnyway = false;
    atts = atts || EMPTY_OBJ;
    if (false === svg)
    {
        svg = '<'+tag+' '+Object.keys(atts).reduce(function(s, a) {
            return s + a+'="'+Str(atts[a][0])+'" ';
        }, '')+'/>';
        if (g)
        {
            svg = '<g '+Object.keys(ga||EMPTY_OBJ).reduce(function(s, a) {
                return s + a+'="'+Str(ga[a][0])+'" ';
            }, '')+'>'+svg+'</g>';
        }
    }
    else
    {
        if (!svg)
        {
            setAnyway = true;
            svg = document.createElementNS('http://www.w3.org/2000/svg', tag);
            if (g)
            {
                g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                g.appendChild(svg);
            }
        }
        else if (g)
        {
            g = svg;
            svg = g.firstChild || g;
        }
        Object.keys(atts).forEach(function(a) {
            if (setAnyway || atts[a][1]) svg.setAttribute(a, atts[a][0]);
        });
        if (g && ga)
        {
            Object.keys(ga).forEach(function(a) {
                if (setAnyway || ga[a][1]) g.setAttribute(a, ga[a][0]);
            });
        }
    }
    return svg;
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
function observeArray(array, onAdd, onDel, equals)
{
    if (is_function(array.onChange)) return array;

    var notify = function(changed) {
        array.$cb.forEach(function(cb) {cb(changed);});
    };

    var doNotifyItems = true;

    equals = equals || equal;

    var methodInterceptor = function() {
        var interceptor = function(method) {
            return function() {
                var args = arguments, result = null,
                    index = 0, deleted = null,
                    initialLength = array.length,
                    finalLength = 0;

                if (onAdd)
                {
                    if ('push' === method || 'unshift' === method)
                    {
                        args = Array.prototype.map.apply(args, onAdd);
                    }
                    if ('splice' === method && 2 < args.length)
                    {
                        args = Array.prototype.slice.call(args, 0, 2).concat(Array.prototype.slice.call(args, 2).map(onAdd));
                    }
                }

                if ('shift' === method || 'unshift' === method || 'splice' === method)
                {
                    // avoid superfluous notifications
                    doNotifyItems = false;
                }
                result = Array.prototype[method].apply(array, args);
                if ('splice' === method && result.length)
                {
                    deleted = result;
                }
                else if (0 < initialLength && 'pop' === method || 'shift' === method)
                {
                    deleted = [result];
                }
                if (deleted && onDel)
                {
                    deleted.forEach(onDel);
                }
                if ('unshift' === method || 'splice' === method)
                {
                    // restore notifications
                    doNotifyItems = true;
                }

                finalLength = array.length;
                if (('push' === method || 'unshift' === method || 'splice' === method) && (finalLength > initialLength))
                {
                    itemInterceptor(initialLength, finalLength);
                }

                if ('push' === method)
                {
                    notify({target:array, method:method, added:{from:initialLength, to:finalLength}});
                }
                else if ('unshift' === method)
                {
                    notify({target:array, method:method, added:{from:0, to:finalLength-initialLength-1}});
                }
                else if ('splice' === method && 2 < args.length)
                {
                    notify({target:array, method:method, added:{from:args[0], to:args[0]+args.length-3}, deleted:deleted});
                }
                else
                {
                    notify({target:array, method:method, deleted:deleted});
                }

                return result;
            };
        };
        ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(function(method) {
            array[method] = interceptor(method);
        });
    };

    var itemInterceptor = function(start, stop) {
        var interceptor = function(index) {
            var key = Str(index), val = array[index];
            def(array, key, {
                get: function() {
                    return val;
                },
                set: function(value) {
                    if (onAdd) value = onAdd(value);
                    var doNotify = !equals(val, value);
                    if (onDel) onDel(val);
                    val = value;
                    if (doNotify && doNotifyItems)
                    {
                        notify({target:array, method:'set', added:{from:index, to:index}});
                    }
                },
                enumerable: true
            });
        };
        for (var index=start; index<stop; ++index)
        {
            interceptor(index);
        }
    };

    array.$cb = [];
    array.onChange = function onChange(cb, add) {
        var index;
        if (is_function(cb))
        {
            if (false === add)
            {
                index = array.$cb.indexOf(cb);
                if (-1 !== index) array.$cb.splice(index, 1);
            }
            else
            {
                index = array.$cb.indexOf(cb);
                if (-1 !== index) array.$cb.push(cb);
            }
        }
    };
    if (onAdd && array.length)
    {
        for (var i=0,n=array.length; i<n; ++i)
        {
            array[i] = onAdd(array[i]);
        }
    }
    methodInterceptor();
    itemInterceptor(0, array.length);

    return array;
}
function unobserveArray(array, onDel)
{
    if (!is_function(array.onChange)) return array;

    delete array.$cb;
    delete array.onChange;

    ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(function(method) {
        array[method] = Array.prototype[method];
    });

    var values = onDel ? array.map(onDel) : array.slice();
    array.length = 0;
    array.push.apply(array, values);

    return array;
}
function identity(x)
{
    return x;
}
function equal(a, b)
{
    return a === b;
}
function sort_asc(a, b)
{
    return a - b;
}
function sort_asc0(a, b)
{
    return a[0] - b[0];
}
function pad(x, n, c, post)
{
    var s = Str(x), l = s.length, p = '';
    if (l < n)
    {
        c = c || ' ';
        p = (new Array(n-l+1)).join(c);
        s = post ? s + p : p + s;
    }
    return s;
}
var cnt = 0, Str = String;
function uuid(ns)
{
    return Str(ns||'')+'_'+Str(++cnt)+'_'+Str(new Date().getTime())+'_'+Str(stdMath.round(1000*stdMath.random()));
}
function Num(x)
{
    return (+x) || 0;
}
function Tex(o)
{
    return is_function(o.toTex) ? o.toTex() : o.toString();
}
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
// export it
return {
    VERSION: "0.2.0",
    Util: {
        hypot: hypot,
        deg: deg,
        rad: rad
    },
    Value: Value,
    Matrix: Matrix,
    Style: Style,
    Primitive: Primitive,
    Point: Point,
    Line: Line,
    Polyline: Polyline,
    Bezier1: Bezier1,
    Bezier2: Bezier2,
    Bezier3: Bezier3,
    Arc: Arc,
    Polygon: Polygon,
    Circle: Circle,
    Ellipse: Ellipse,
    CompositeCurve: CompositeCurve,
    Shape: Shape,
    Plane: Plane
};
});
