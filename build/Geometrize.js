/**
*   Geometrize
*   computational geometry and rendering library for JavaScript
*
*   @version 0.9.5 (2022-12-13 15:01:12)
*   https://github.com/foo123/Geometrize
*
**//**
*   Geometrize
*   computational geometry and rendering library for JavaScript
*
*   @version 0.9.5 (2022-12-13 15:01:12)
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
    PI = stdMath.PI, TWO_PI = 2*PI, EPS = 1e-6/*Number.EPSILON*/,
    HALF_PI = PI/2, PI3_2 = 3*PI/2,
    sqrt2 = sqrt(2), sqrt3 = sqrt(3),
    NUM_POINTS = 20, PIXEL_SIZE = 1e-2,
    EMPTY_ARR = [], EMPTY_OBJ = {},
    NOP = function() {},
    isNode = ("undefined" !== typeof global) && ("[object global]" === toString.call(global)),
    isBrowser = ("undefined" !== typeof window) && ("[object Window]" === toString.call(window)),
    root = isNode ? global : (isBrowser ? window : this),
    Geometrize = {VERSION: "0.9.5", Math: {}, Geometry: {}}
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

        if (is_strictly_equal(det2, 0)) return null;

        /*
        var det = self.det();
        return new Matrix(
        (a11*a22-a12*a21)/det, (a02*a21-a01*a22)/det, (a01*a12-a02*a11)/det,
        (a12*a20-a10*a22)/det, (a00*a22-a02*a20)/det, (a02*a10-a00*a12)/det,
        //(a10*a21-a11*a20)/det, (a01*a20-a00*a21)/det, (a00*a11-a01*a10)/det
        0, 0, 1
        );
        */
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
        /*
        if matrix can be factored as:
        T * R * S = |1 0 tx| * |cos -sin 0| * |sx 0  0| = |sxcos -sysin tx| = |00 01 02|
                    |0 1 ty|   |sin cos  0|   |0  sy 0|   |sxsin sycos  ty|   |10 11 12|
                    |0 0 1 |   |0   0    1|   |0  0  1|   |0      0     1 |   |20 21 22|
        */
        var self = this;
        return {
            x: self.$02,
            y: self.$12
        };
    },
    getRotationAngle: function() {
        /*
        if matrix can be factored as:
        T * R * S = |1 0 tx| * |cos -sin 0| * |sx 0  0| = |sxcos -sysin tx| = |00 01 02|
                    |0 1 ty|   |sin cos  0|   |0  sy 0|   |sxsin sycos  ty|   |10 11 12|
                    |0 0 1 |   |0   0    1|   |0  0  1|   |0      0     1 |   |20 21 22|
        */
        var self = this;
        return stdMath.atan2(self.$10, self.$00);
    },
    getScale: function() {
        /*
        if matrix can be factored as:
        T * R * S = |1 0 tx| * |cos -sin 0| * |sx 0  0| = |sxcos -sysin tx| = |00 01 02|
                    |0 1 ty|   |sin cos  0|   |0  sy 0|   |sxsin sycos  ty|   |10 11 12|
                    |0 0 1 |   |0   0    1|   |0  0  1|   |0      0     1 |   |20 21 22|
        */
        var self = this,
            a = self.$00, b = -self.$01,
            c = self.$10, d = self.$11;
        return {
        x: sign(a)*hypot(a, c),
        y: sign(d)*hypot(b, d)
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
        return 'matrix('+Str(self.$00)+','+Str(self.$10)+','+Str(self.$01)+','+Str(self.$11)+','+Str(self.$02)+','+Str(self.$12)+')';
    },
    toCanvas: function(ctx) {
        var self = this;
        ctx.transform(self.$00, self.$10, self.$01, self.$11, self.$02, self.$12);
        return ctx;
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
    translate: function(tx, ty) {
        return new Matrix(
        1, 0, Num(tx),
        0, 1, Num(ty),
        0, 0, 1
        );
    },
    rotate: function(theta, ox, oy) {
        // (ox,oy) is rotation origin, default (0,0)
        oy = Num(oy || 0);
        ox = Num(ox || 0);
        theta = Num(theta);
        var cos = stdMath.cos(theta), sin = stdMath.sin(theta);
        return new Matrix(
        cos, -sin, ox - cos*ox + sin*oy,
        sin,  cos, oy - cos*oy - sin*ox,
        0,    0,   1
        );
    },
    scale: function(sx, sy, ox, oy) {
        // (ox,oy) is scale origin, default (0,0)
        oy = Num(oy || 0);
        ox = Num(ox || 0);
        sx = Num(sx);
        sy = Num(sy);
        return new Matrix(
        sx, 0,  -sx*ox + ox,
        0,  sy, -sy*oy + oy,
        0,  0,  1
        );
    },
    reflectX: function() {
        return new Matrix(
        -1, 0, 0,
        0,  1, 0,
        0,  0, 1
        );
    },
    reflectY: function() {
        return new Matrix(
        1,  0, 0,
        0, -1, 0,
        0,  0, 1
        );
    },
    shearX: function(s) {
        return new Matrix(
        1, Num(s), 0,
        0, 1,      0,
        0, 0,      1
        );
    },
    shearY: function(s) {
        return new Matrix(
        1,      0, 0,
        Num(s), 1, 0,
        0,      0, 1
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
var EYE = Matrix.eye();
Geometrize.Matrix = Matrix;
// Color utilities
// eg for stroke, fill, ..
var hexRE = /^#([0-9a-fA-F]{3,6})\b/,
    rgbRE = /^(rgba?)\b\s*\(([^\)]*)\)/i,
    hslRE = /^(hsla?)\b\s*\(([^\)]*)\)/i,
    hwbRE = /^(hwba?)\b\s*\(([^\)]*)\)/i,
    sepRE = /\s+|,/gm, aRE = /\/\s*(\d*?\.?\d+%?)/;

function hex2rgb(h)
{
    if (!h || 3 > h.length)
    {
        return [0, 0, 0, 0];
    }
    else if (6 > h.length)
    {
        return [
        clamp(parseInt(h[0]+h[0], 16)||0, 0, 255),
        clamp(parseInt(h[1]+h[1], 16)||0, 0, 255),
        clamp(parseInt(h[2]+h[2], 16)||0, 0, 255),
        1
        ];
    }
    else
    {
        return [
        clamp(parseInt(h[0]+h[1], 16)||0, 0, 255),
        clamp(parseInt(h[2]+h[3], 16)||0, 0, 255),
        clamp(parseInt(h[4]+h[5], 16)||0, 0, 255),
        1
        ];
    }
}
function hsl2rgb(h, s, l, a)
{
    var c, hp, d, x, m, r, g, b;
    s /= 100;
    l /= 100;
    c = (1 - abs(2*l - 1))*s;
    hp = h/60;
    d = stdMath.floor(hp / 2);
    x = c*(1 - abs(hp - 2*d - 1));
    m = l - c/2;
    if (hp >= 0 && hp < 1)
    {
        r = c + m;
        g = x + m;
        b = 0 + m;
    }
    else if (hp >= 1 && hp < 2)
    {
        r = x + m;
        g = c + m;
        b = 0 + m;
    }
    else if (hp >= 2 && hp < 3)
    {
        r = 0 + m;
        g = c + m;
        b = x + m;
    }
    else if (hp >= 3 && hp < 4)
    {
        r = 0 + m;
        g = x + m;
        b = c + m;
    }
    else if (hp >= 4 && hp < 5)
    {
        r = x + m;
        g = 0 + m;
        b = c + m;
    }
    else //if (hp >= 5 && hp < 6)
    {
        r = c + m;
        g = 0 + m;
        b = x + m;
    }
    return [
    clamp(stdMath.round(r*255), 0, 255),
    clamp(stdMath.round(g*255), 0, 255),
    clamp(stdMath.round(b*255), 0, 255),
    a
    ];
}
function hsv2rgb(h, s, v, a)
{
    v /= 100;
    var l = v*(1 - s/200), lm = stdMath.min(l, 1-l);
    return hsl2rgb(h, 0 === lm ? 0 : 100*(v-l)/lm, 100*l, a);
}
function hwb2rgb(h, w, b, a)
{
    var b1 = 1 - b/100;
    return hsv2rgb(h, 100 - w/b1, 100*b1, a);
}
function parseColor(s)
{
    var m, hasOpacity;
    s = trim(Str(s)).toLowerCase();
    if (m = s.match(hexRE))
    {
        // hex
        return hex2rgb(m[1]);
    }
    if (m = s.match(hwbRE))
    {
        // hwb(a)
        hasOpacity = m[2].match(aRE);
        var col = trim(m[2]).split(sepRE).map(trim),
            h = col[0] ? col[0] : '0',
            w = col[1] ? col[1] : '0',
            b = col[2] ? col[2] : '0',
            a = hasOpacity ? hasOpacity[1] : '1';
        h = parseFloat(h, 10);
        w = '%' === w.slice(-1) ? parseFloat(w, 10) : parseFloat(w, 10)*100/255;
        b = '%' === b.slice(-1) ? parseFloat(b, 10) : parseFloat(b, 10)*100/255;
        a = '%' === a.slice(-1) ? parseFloat(a, 10)/100 : parseFloat(a, 10);
        return hwb2rgb(h, w, b, a);
    }
    if (m = s.match(hslRE))
    {
        // hsl(a)
        hasOpacity = m[2].match(aRE);
        var col = trim(m[2]).split(sepRE).map(trim),
            h = col[0] ? col[0] : '0',
            s = col[1] ? col[1] : '0',
            l = col[2] ? col[2] : '0',
            a = hasOpacity ? hasOpacity[1] : ('hsla' === m[1] && null != col[3] ? col[3] : '1');
        h = parseFloat(h, 10);
        s = '%' === s.slice(-1) ? parseFloat(s, 10) : parseFloat(s, 10)*100/255;
        l = '%' === l.slice(-1) ? parseFloat(l, 10) : parseFloat(l, 10)*100/255;
        a = '%' === a.slice(-1) ? parseFloat(a, 10)/100 : parseFloat(a, 10);
        return hsl2rgb(h, s, l, a);
    }
    if (m = s.match(rgbRE))
    {
        // rgb(a)
        hasOpacity = m[2].match(aRE);
        var col = trim(m[2]).split(sepRE).map(trim),
            r = col[0] ? col[0] : '0',
            g = col[1] ? col[1] : '0',
            b = col[2] ? col[2] : '0',
            a = hasOpacity ? hasOpacity[1] : ('rgba' === m[1] && null != col[3] ? col[3] : '1');
        r = '%' === r.slice(-1) ? parseFloat(r, 10)*2.55 : parseFloat(r, 10);
        g = '%' === g.slice(-1) ? parseFloat(g, 10)*2.55 : parseFloat(g, 10);
        b = '%' === b.slice(-1) ? parseFloat(b, 10)*2.55 : parseFloat(b, 10);
        a = '%' === a.slice(-1) ? parseFloat(a, 10)/100 : parseFloat(a, 10);
        return [r, g, b, a];
    }
    if (HAS.call(Color.keywords, s))
    {
        // keyword
        return Color.keywords[s].slice();
    }
}
function interpolateRGB(r0, g0, b0, a0, r1, g1, b1, a1, t)
{
    if (9 <= arguments.length)
    {
        var t0 = (t||0), t1 = 1 - t0;
        return [
        clamp(stdMath.round(t1*r0 + t0*r1), 0, 255),
        clamp(stdMath.round(t1*g0 + t0*g1), 0, 255),
        clamp(stdMath.round(t1*b0 + t0*b1), 0, 255),
        clamp(t1*a0 + t0*a1, 0, 1)
        ];
    }
    else
    {
        var t0 = (b0||0), t1 = 1 - t0, rgba0 = r0, rgba1 = g0;
        return 3 < rgba0.length ? [
        clamp(stdMath.round(t1*rgba0[0] + t0*rgba1[0]), 0, 255),
        clamp(stdMath.round(t1*rgba0[1] + t0*rgba1[1]), 0, 255),
        clamp(stdMath.round(t1*rgba0[2] + t0*rgba1[2]), 0, 255),
        clamp(t1*rgba0[3] + t0*rgba1[3], 0, 1)
        ] : [
        clamp(stdMath.round(t1*rgba0[0] + t0*rgba1[0]), 0, 255),
        clamp(stdMath.round(t1*rgba0[1] + t0*rgba1[1]), 0, 255),
        clamp(stdMath.round(t1*rgba0[2] + t0*rgba1[2]), 0, 255)
        ];
    }
}
var Color = {
    keywords: {
    // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
    /* extended */
     'transparent'         : [  0,0,0        ,0]
    ,'aliceblue'           : [  240,248,255  ,1]
    ,'antiquewhite'        : [  250,235,215  ,1]
    ,'aqua'                : [  0,255,255    ,1]
    ,'aquamarine'          : [  127,255,212  ,1]
    ,'azure'               : [  240,255,255  ,1]
    ,'beige'               : [  245,245,220  ,1]
    ,'bisque'              : [  255,228,196  ,1]
    ,'black'               : [  0,0,0    ,    1]
    ,'blanchedalmond'      : [  255,235,205  ,1]
    ,'blue'                : [  0,0,255  ,    1]
    ,'blueviolet'          : [  138,43,226   ,1]
    ,'brown'               : [  165,42,42    ,1]
    ,'burlywood'           : [  222,184,135  ,1]
    ,'cadetblue'           : [  95,158,160   ,1]
    ,'chartreuse'          : [  127,255,0    ,1]
    ,'chocolate'           : [  210,105,30   ,1]
    ,'coral'               : [  255,127,80   ,1]
    ,'cornflowerblue'      : [  100,149,237  ,1]
    ,'cornsilk'            : [  255,248,220  ,1]
    ,'crimson'             : [  220,20,60    ,1]
    ,'cyan'                : [  0,255,255    ,1]
    ,'darkblue'            : [  0,0,139  ,    1]
    ,'darkcyan'            : [  0,139,139    ,1]
    ,'darkgoldenrod'       : [  184,134,11   ,1]
    ,'darkgray'            : [  169,169,169  ,1]
    ,'darkgreen'           : [  0,100,0  ,    1]
    ,'darkgrey'            : [  169,169,169  ,1]
    ,'darkkhaki'           : [  189,183,107  ,1]
    ,'darkmagenta'         : [  139,0,139    ,1]
    ,'darkolivegreen'      : [  85,107,47    ,1]
    ,'darkorange'          : [  255,140,0    ,1]
    ,'darkorchid'          : [  153,50,204   ,1]
    ,'darkred'             : [  139,0,0  ,    1]
    ,'darksalmon'          : [  233,150,122  ,1]
    ,'darkseagreen'        : [  143,188,143  ,1]
    ,'darkslateblue'       : [  72,61,139    ,1]
    ,'darkslategray'       : [  47,79,79 ,    1]
    ,'darkslategrey'       : [  47,79,79 ,    1]
    ,'darkturquoise'       : [  0,206,209    ,1]
    ,'darkviolet'          : [  148,0,211    ,1]
    ,'deeppink'            : [  255,20,147   ,1]
    ,'deepskyblue'         : [  0,191,255    ,1]
    ,'dimgray'             : [  105,105,105  ,1]
    ,'dimgrey'             : [  105,105,105  ,1]
    ,'dodgerblue'          : [  30,144,255   ,1]
    ,'firebrick'           : [  178,34,34    ,1]
    ,'floralwhite'         : [  255,250,240  ,1]
    ,'forestgreen'         : [  34,139,34    ,1]
    ,'fuchsia'             : [  255,0,255    ,1]
    ,'gainsboro'           : [  220,220,220  ,1]
    ,'ghostwhite'          : [  248,248,255  ,1]
    ,'gold'                : [  255,215,0    ,1]
    ,'goldenrod'           : [  218,165,32   ,1]
    ,'gray'                : [  128,128,128  ,1]
    ,'green'               : [  0,128,0  ,    1]
    ,'greenyellow'         : [  173,255,47   ,1]
    ,'grey'                : [  128,128,128  ,1]
    ,'honeydew'            : [  240,255,240  ,1]
    ,'hotpink'             : [  255,105,180  ,1]
    ,'indianred'           : [  205,92,92    ,1]
    ,'indigo'              : [  75,0,130 ,    1]
    ,'ivory'               : [  255,255,240  ,1]
    ,'khaki'               : [  240,230,140  ,1]
    ,'lavender'            : [  230,230,250  ,1]
    ,'lavenderblush'       : [  255,240,245  ,1]
    ,'lawngreen'           : [  124,252,0    ,1]
    ,'lemonchiffon'        : [  255,250,205  ,1]
    ,'lightblue'           : [  173,216,230  ,1]
    ,'lightcoral'          : [  240,128,128  ,1]
    ,'lightcyan'           : [  224,255,255  ,1]
    ,'lightgoldenrodyellow': [  250,250,210  ,1]
    ,'lightgray'           : [  211,211,211  ,1]
    ,'lightgreen'          : [  144,238,144  ,1]
    ,'lightgrey'           : [  211,211,211  ,1]
    ,'lightpink'           : [  255,182,193  ,1]
    ,'lightsalmon'         : [  255,160,122  ,1]
    ,'lightseagreen'       : [  32,178,170   ,1]
    ,'lightskyblue'        : [  135,206,250  ,1]
    ,'lightslategray'      : [  119,136,153  ,1]
    ,'lightslategrey'      : [  119,136,153  ,1]
    ,'lightsteelblue'      : [  176,196,222  ,1]
    ,'lightyellow'         : [  255,255,224  ,1]
    ,'lime'                : [  0,255,0  ,    1]
    ,'limegreen'           : [  50,205,50    ,1]
    ,'linen'               : [  250,240,230  ,1]
    ,'magenta'             : [  255,0,255    ,1]
    ,'maroon'              : [  128,0,0  ,    1]
    ,'mediumaquamarine'    : [  102,205,170  ,1]
    ,'mediumblue'          : [  0,0,205  ,    1]
    ,'mediumorchid'        : [  186,85,211   ,1]
    ,'mediumpurple'        : [  147,112,219  ,1]
    ,'mediumseagreen'      : [  60,179,113   ,1]
    ,'mediumslateblue'     : [  123,104,238  ,1]
    ,'mediumspringgreen'   : [  0,250,154    ,1]
    ,'mediumturquoise'     : [  72,209,204   ,1]
    ,'mediumvioletred'     : [  199,21,133   ,1]
    ,'midnightblue'        : [  25,25,112    ,1]
    ,'mintcream'           : [  245,255,250  ,1]
    ,'mistyrose'           : [  255,228,225  ,1]
    ,'moccasin'            : [  255,228,181  ,1]
    ,'navajowhite'         : [  255,222,173  ,1]
    ,'navy'                : [  0,0,128  ,    1]
    ,'oldlace'             : [  253,245,230  ,1]
    ,'olive'               : [  128,128,0    ,1]
    ,'olivedrab'           : [  107,142,35   ,1]
    ,'orange'              : [  255,165,0    ,1]
    ,'orangered'           : [  255,69,0 ,    1]
    ,'orchid'              : [  218,112,214  ,1]
    ,'palegoldenrod'       : [  238,232,170  ,1]
    ,'palegreen'           : [  152,251,152  ,1]
    ,'paleturquoise'       : [  175,238,238  ,1]
    ,'palevioletred'       : [  219,112,147  ,1]
    ,'papayawhip'          : [  255,239,213  ,1]
    ,'peachpuff'           : [  255,218,185  ,1]
    ,'peru'                : [  205,133,63   ,1]
    ,'pink'                : [  255,192,203  ,1]
    ,'plum'                : [  221,160,221  ,1]
    ,'powderblue'          : [  176,224,230  ,1]
    ,'purple'              : [  128,0,128    ,1]
    ,'red'                 : [  255,0,0  ,    1]
    ,'rosybrown'           : [  188,143,143  ,1]
    ,'royalblue'           : [  65,105,225   ,1]
    ,'saddlebrown'         : [  139,69,19    ,1]
    ,'salmon'              : [  250,128,114  ,1]
    ,'sandybrown'          : [  244,164,96   ,1]
    ,'seagreen'            : [  46,139,87    ,1]
    ,'seashell'            : [  255,245,238  ,1]
    ,'sienna'              : [  160,82,45    ,1]
    ,'silver'              : [  192,192,192  ,1]
    ,'skyblue'             : [  135,206,235  ,1]
    ,'slateblue'           : [  106,90,205   ,1]
    ,'slategray'           : [  112,128,144  ,1]
    ,'slategrey'           : [  112,128,144  ,1]
    ,'snow'                : [  255,250,250  ,1]
    ,'springgreen'         : [  0,255,127    ,1]
    ,'steelblue'           : [  70,130,180   ,1]
    ,'tan'                 : [  210,180,140  ,1]
    ,'teal'                : [  0,128,128    ,1]
    ,'thistle'             : [  216,191,216  ,1]
    ,'tomato'              : [  255,99,71    ,1]
    ,'turquoise'           : [  64,224,208   ,1]
    ,'violet'              : [  238,130,238  ,1]
    ,'wheat'               : [  245,222,179  ,1]
    ,'white'               : [  255,255,255  ,1]
    ,'whitesmoke'          : [  245,245,245  ,1]
    ,'yellow'              : [  255,255,0    ,1]
    ,'yellowgreen'         : [  154,205,50   ,1]
    },
    parse: parseColor,
    interpolateRGB: interpolateRGB,
    toCSS: function(r, g, b, a) {
        if (1 === arguments.length)
        {
            var rgba = r;
            return 3 < rgba.length ? 'rgba('+rgba[0]+','+rgba[1]+','+rgba[2]+','+rgba[3]+')' : 'rgb('+rgba[0]+','+rgba[1]+','+rgba[2]+')';
        }
        else
        {
            return 3 < arguments.length ? 'rgba('+r+','+g+','+b+','+a+')' : 'rgb('+r+','+g+','+b+')';
        }
    }
};
Geometrize.Color = Color;
// 2D Style class
// eg stroke, fill, width, ..
var Style = makeClass(null, merge(null, {
    constructor: function Style(style) {
        var self = this, styleProps = null, _style = null;

        if (style instanceof Style) return style;
        if (!(self instanceof Style)) return new Style(style);

        // defaults
        styleProps = Style.Properties;
        _style = merge(styleProps, {}, Style.Defaults);
        if (is_object(style)) _style = merge(styleProps, _style, style);

        styleProps.forEach(function(p) {
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
            return styleProps.reduce(function(o, p) {
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
    },
    toCanvas: function(ctx) {
        var self = this;
        ctx.lineCap = self['stroke-linecap'];
        ctx.lineJoin = self['stroke-linejoin'];
        ctx.lineWidth = self['stroke-width'];
        ctx.fillStyle = 'none' === self['fill'] ? 'transparent' : self['fill'];
        ctx.strokeStyle = self['stroke'];
        return ctx;
    }
}, Changeable), {
    Properties: [
    'stroke-width',
    'stroke',
    'stroke-opacity',
    'stroke-linecap',
    'stroke-linejoin',
    'fill',
    'fill-opacity',
    'fill-rule'
    ],
    Defaults: {
    'stroke-width': 1,
    'stroke': '#000000',
    'stroke-opacity': 1,
    'stroke-linecap': 'butt',
    'stroke-linejoin': 'miter',
    'fill': 'none',
    'fill-opacity': 1,
    'fill-rule': 'evenodd'
    }
});
Geometrize.Style = Style;
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
        self.setStyle = function(prop, val) {
            if (arguments.length)
            {
                if (1 < arguments.length)
                {
                    self.style[prop] = val;
                }
                else
                {
                    self.style = prop;
                }
            }
            return self;
        };
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
    setStyle: null,
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
        var bb = this.getBoundingBox();
        return {
            x: (bb.xmin + bb.xmax)/2,
            y: (bb.ymin + bb.ymax)/2
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
    intersectsSelf: function() {
        return false;
    },
    toSVG: function(svg) {
        return arguments.length ? svg : '';
    },
    toSVGPath: function(svg) {
        return arguments.length ? svg : '';
    },
    toCanvas: function(ctx) {
    },
    toCanvasPath: function(ctx) {
    },
    toTex: function() {
        return '\\text{Primitive}';
    },
    toString: function() {
        return 'Primitive()';
    }
}, Changeable));
Geometrize.Primitive = Primitive;
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
        var self = this;
        return {
        ymin: self.y,
        xmin: self.x,
        ymax: self.y,
        xmax: self.x
        };
    },
    eq: function(other) {
        var self = this;
        if (other instanceof Point)
        {
            return p_eq(self, other);
        }
        else if (null != other.x && null != other.y)
        {
            return p_eq(self, other);
        }
        else if (is_array(other))
        {
            return p_eq(self, {x: other[0], y: other[1]});
        }
        return false;
    },
    add: function(other) {
        var self = this;
        return other instanceof Point ? new Point(self.x+other.x, self.y+other.y) : new Point(self.x+Num(other), self.y+Num(other));
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
        return !!(p1 instanceof Line ? point_on_line_segment(this, p1.start, p1.end) : point_on_line_segment(this, p1, p2));
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
    toObj: function() {
        return {
            x: this.x,
            y: this.y
        };
    },
    bezierPoints: function() {
        var x = this.x, y = this.y;
        return [
        [{x:x, y:y}, {x:x, y:y}, {x:x, y:y}, {x:x, y:y}]
        ];
    },
    toSVG: function(svg) {
        var self = this;
        return SVG('circle', {
            'id': [self.id, false],
            'cx': [self.x, self.isChanged()],
            'cy': [self.y, self.isChanged()],
            'r': [self.style['stroke-width'], self.style.isChanged()],
            'style': ['fill:'+Str(self.style['stroke'])+';', self.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var c = this, r = c.style['stroke-width'],
            path = 'M '+Str(c.x - r)+' '+Str(c.y)+' a '+Str(r)+' '+Str(r)+' 0 0 0 '+Str(r + r)+' 0 a '+Str(r)+' '+Str(r)+' 0 0 0 '+Str(-r - r)+' 0 Z';
        return arguments.length ? SVG('path', {
            'id': [c.id, false],
            'd': [path, c.isChanged()],
            'style': ['fill:'+Str(c.style['stroke'])+';', c.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var self = this;
        ctx.fillStyle = self.style['stroke']
        self.toCanvasPath(ctx);
    },
    toCanvasPath: function(ctx) {
        var self = this;
        ctx.beginPath();
        ctx.arc(self.x, self.y, self.style['stroke-width'], 0, TWO_PI);
        ctx.closePath();
        ctx.fill();
    },
    toTex: function() {
        var self = this;
        return '\\begin{pmatrix}'+Str(self.x)+'\\\\'+Str(self.y)+'\\end{pmatrix}';
    },
    toString: function() {
        var self = this;
        return 'Point('+Str(self.x)+','+Str(self.y)+')';
    }
});
Geometrize.Point = Point;
// 2D geometric Topos ie set of points
var Topos = makeClass(Primitive, {
    constructor: function Topos(points) {
        var self = this,
            _points = null,
            onPointChange,
            onArrayChange,
            point_add,
            point_del
        ;
        if (points instanceof Topos) return points;
        if (!(self instanceof Topos)) return new Topos(points);
        if (null == points) points = [];

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

        _points = observeArray(points, point_add, point_del, p_eq);
        _points.onChange(onArrayChange);

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
                        _points = observeArray(points, point_add, point_del, p_eq);
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
    },
    name: 'Topos',
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
        self.$super('dispose');
    },
    isChanged: function(isChanged) {
        var self = this;
        if (false === isChanged)
        {
            self.points.forEach(function(point) {point.isChanged(false);});
        }
        return self.$super('isChanged', arguments);
    },
    clone: function() {
        return new Topos(this.points.map(function(p) {return p.clone();}));
    },
    transform: function(matrix) {
        return new Topos(this.points.map(function(p) {return matrix.transform(p);}));
    },
    hasPoint: function(point) {
        var p = this.points, n = p.length, j;
        for (j=0; j<n; ++j)
        {
            if (p_eq(p[j], point))
                return true;
        }
        return false;
    },
    hasInsidePoint: function(point, strict) {
        return this.hasPoint(point);
    },
    intersects: function(other) {
        if (other instanceof Primitive)
        {
            var p = this.points, n = p.length, j, i = [];
            for (j=0; j<n; ++j)
            {
                if (other.intersects(p[j]))
                    i.push(p[j]);
            }
            return i.length ? i : false;
        }
        return false;
    },
    toSVG: function(svg) {
        return this.toSVGPath(arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, path = self.points.map(function(p) {return p.toSVGPath();}).join(' ');
        return arguments.length ? SVG('path', {
            'id': [self.id, false],
            'd': [path, self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        this.style.toCanvas(ctx)
        this.toCanvasPath(ctx);
    },
    toCanvasPath: function(ctx) {
        this.points.forEach(function(p) {
            p.toCanvasPath(ctx);
        });
    },
    toTex: function() {
        return '\\text{Topos}';
    },
    toString: function() {
        return 'Topos()';
    }
});
Geometrize.Topos = Topos;
// 2D generic Curve base class
var Curve = makeClass(Topos, {
    constructor: function Curve(points, values) {
        var self = this,
            _matrix = null,
            _points = null,
            _lines = null,
            _values = null,
            _bbox = null,
            _hull = null
        ;

        self.$super('constructor', [points]);
        if (null == values) values = {};

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
        self.setMatrix = function(m) {
            if (arguments.length)
            {
                self.matrix = m;
            }
            return self;
        };
        def(self, '_points', {
            get: function() {
                if (null == _points)
                {
                    _points = !_matrix || _matrix.eq(EYE) ? self.points.map(function(p) {
                        return p.clone();
                    }) : self.points.map(function(p) {
                        return _matrix.transform(p);
                    });
                }
                return _points;
            },
            set: function(points) {
                if (null == points)
                {
                    _points = null;
                }
            },
            enumerable: false,
            configurable: true
        });
        def(self, '_lines', {
            get: function() {
                if (null == _lines)
                {
                    _lines = sample_curve(self.f.bind(self), NUM_POINTS, PIXEL_SIZE, true);
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
        def(self, '_bbox', {
            get: function() {
                return {
                    ymin: -Infinity,
                    xmin: -Infinity,
                    ymax: Infinity,
                    xmax: Infinity
                };
            },
            enumerable: false,
            configurable: true
        });
        def(self, '_hull', {
            get: function() {
                var bb = null;
                if (null == _bbox) bb = _bbox = self._bbox;
                else bb = self._bbox;
                if (null == _hull || _bbox !== bb)
                {
                    _bbox = bb;
                    _hull = [
                        new Point(bb.xmin, bb.ymin),
                        new Point(bb.xmax, bb.ymin),
                        new Point(bb.xmax, bb.ymax),
                        new Point(bb.xmin, bb.ymax)
                    ];
                }
                return _hull;
            },
            enumerable: false,
            configurable: true
        });
    },
    name: 'Curve',
    dispose: function() {
        var self = this;
        self.values = null;
        self.$super('dispose');
    },
    isChanged: function(isChanged) {
        var self = this;
        if (false === isChanged)
        {
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
    setMatrix: null,
    f: function(t) {
        // override
        return {x:0, y:0};
    },
    d: function() {
        // override
        return this.clone();
    },
    getPointAt: function(t) {
        // 0 <= t <= 1
        t = Num(t);
        if (0 > t || 1 < t) return null;
        var p = this.f(t);
        return null == p ? null : Point(p);
    },
    getBoundingBox: function() {
        var bb = this._bbox;
        return {
        ymin: bb.ymin,
        xmin: bb.xmin,
        ymax: bb.ymax,
        xmax: bb.xmax
        };
    },
    getConvexHull: function() {
        return this._hull.map(function(p) {return p.clone();});
    },
    derivative: function() {
        var self = this, d = self.d();
        if (self.hasMatrix()) d.setMatrix(self.matrix.clone());
        d.setStyle(self.style.toObj());
        return d;
    },
    polylinePoints: function() {
        return this._lines.slice();
    },
    bezierPoints: function() {
        return [
        {x:0, y:0},
        {x:0, y:0},
        {x:0, y:0},
        {x:0, y:0}
        ];
    },
    toTex: function() {
        return '\\text{Curve}';
    },
    toString: function() {
        return 'Curve()';
    }
});
Geometrize.Curve = Curve;

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
    name: 'Bezier',
    d: function() {
        var self = this, p = self.points, n = p.length - 1, d;
        if (self instanceof Bezier1)
        {
            // point
            d = new Bezier1([{x:n*(p[1].x - p[0].x), y:n*(p[1].y - p[0].y)}, {x:n*(p[1].x - p[0].x), y:n*(p[1].y - p[0].y)}]);
        }
        else if (self instanceof Bezier2)
        {
            // line
            d = new Bezier1([{x:n*(p[1].x - p[0].x), y:n*(p[1].y - p[0].y)}, {x:n*(p[2].x - p[1].x), y:n*(p[2].y - p[1].y)}]);
        }
        else if (self instanceof Bezier3)
        {
            // quadratic
            d = new Bezier2([{x:n*(p[1].x - p[0].x), y:n*(p[1].y - p[0].y)}, {x:n*(p[2].x - p[1].x), y:n*(p[2].y - p[1].y)}, {x:n*(p[3].x - p[2].x), y:n*(p[3].y - p[2].y)}]);
        }
        else
        {
            // zero
            d = new Bezier1([{x:0, y:0}, {x:0, y:0}]);
        }
        return d;
    },
    toTex: function() {
        var self = this;
        return '\\text{'+self.name+': }\\left('+self.points.map(Tex).join(',')+'\\right)';
    },
    toString: function() {
        var self = this;
        return ''+self.name+'('+self.points.map(Str).join(',')+')';
    }
});
Geometrize.Bezier = Bezier;

// 2D Composite Curve class (container of multiple, joined, curves)
var MZ = /[M]/g,
    XY = /^\s*(-?\s*\d+(?:\.\d+)?)\s+(-?\s*\d+(?:\.\d+)?)/,
    PXY = /(-?\s*\d+(?:\.\d+)?)\s+(-?\s*\d+(?:\.\d+)?)\s*$/
;
var CompositeCurve = makeClass(Curve, {
    constructor: function CompositeCurve(curves) {
        var self = this,
            _curves = null,
            _points = null,
            _length = null,
            _bbox = null,
            _hull = null,
            onCurveChange,
            onArrayChange,
            curve_add,
            curve_del;

        if (!(self instanceof CompositeCurve)) return new CompositeCurve(curves);
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
                        var bb = curve.getBoundingBox();
                        _bbox.ymin = stdMath.min(_bbox.ymin, bb.ymin);
                        _bbox.xmin = stdMath.min(_bbox.xmin, bb.xmin);
                        _bbox.ymax = stdMath.max(_bbox.ymax, bb.ymax);
                        _bbox.xmax = stdMath.max(_bbox.xmax, bb.xmax);
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
                        hulls.push.apply(hulls, curve._hull);
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
    name: 'CompositeCurve',
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
        var c = this.curves, c1, c2, p1, p2, n = c.length-1, i;
        if (0 > n) return false;
        if (!c[0].isConnected()) return false;
        for (i=0; i<n; ++i)
        {
            c1 = c[i]; c2 = c[i+1];
            if (!c2.isConnected() || c2.isClosed()) return false;
            p1 = c1._points; p2 = c2._points;
            if (!p1[p1.length-1].eq(p2[0])) return false;
        }
        return true;
    },
    isClosed: function(isConnected) {
        var self = this;
        isConnected = true === isConnected || false === isConnected ? isConnected : self.isConnected();
        if (!isConnected) return false;
        var c = self.curves, n = c.length;
        if (!n) return false;
        if ((1 === n) && c[0].isClosed()) return true;
        return c[0]._points[0].eq(c[n-1]._points[c[n-1]._points.length-1]);
    },
    derivative: function() {
        return new CompositeCurve(this.curves.map(function(c) {return c.derivative();}));
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
        var self = this;
        if (other instanceof Point)
        {
            return self.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Primitive)
        {
            for (var ii,i=[],c=self.curves,n=c.length,j=0; j<n; ++j)
            {
                ii = c[j].intersects(other);
                if (ii) i.push.apply(i, ii);
            }
            return i ? i.map(Point) : false;
        }
        return false;
    },
    intersectsSelf: function() {
        var self = this, ii, i = [], c = self.curves, n = c.length,
            j, k, p1, p2, p3, p4;
        for (j=0; j<n; ++j)
        {
            ii = c[j].intersectsSelf();
            if (ii) i.push.apply(i, ii);
            for (k=j+1; k<n; ++k)
            {
                ii = c[j].intersects(c[k]);
                if (ii)
                {
                    p1 = c[j]._points[0];
                    p2 = c[j]._points[c[j]._points.length-1];
                    p3 = c[k]._points[0];
                    p4 = c[k]._points[c[k]._points.length-1];
                    if ((j === 0) && (k === n-1) && p_eq(p1, p4)) ii = ii.filter(function(p) {return !p_eq(p, p1);});
                    else if ((k === j+1) && p_eq(p2, p3)) ii = ii.filter(function(p) {return !p_eq(p, p2);});
                    i.push.apply(i, ii);
                }
            }
        }
        return i ? i.map(Point) : false;
    },
    polylinePoints: function() {
        return this.curves.reduce(function(lines, curve) {
            lines.push.apply(lines, curve.polylinePoints());
            return lines;
        }, []);
    },
    bezierPoints: function() {
        return this.curves.reduce(function(beziers, curve) {
            beziers.push.apply(beziers, curve.bezierPoints());
            return beziers;
        }, []);
    },
    toSVG: function(svg) {
        return this.toSVGPath(arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this,
            curves = self.curves,
            isConnected = self.isConnected(),
            isClosed = self.isClosed(isConnected),
            mz, p,
            path = curves.map(function(c) {return c.toSVGPath();}).join(' ');
        if (isConnected)
        {
            mz = path.match(MZ);
            p = path.split(MZ);
            path = mz.reduce(function(path, command, i) {
                var pp, xy, pxy;
                switch (command)
                {
                    case 'M':
                    pp = p[i+1] || '';
                    // x,y of next point
                    xy = pp.match(XY);
                    // x,y of previous point
                    pxy = (p[i] || '').match(PXY);
                    if (xy && pxy)
                    {
                        if (
                            is_almost_equal(Num(xy[1]), Num(pxy[1])) &&
                            is_almost_equal(Num(xy[2]), Num(pxy[2]))
                        )
                        {
                            path = trim(path);
                            pp = pp.slice(xy[0].length);
                        }
                        else
                        {
                            pp = 'M' + pp;
                        }
                    }
                    else
                    {
                        pp = 'M' + pp;
                    }
                    path += pp;
                    break;
                }
                return path;
            }, p[0] || '') + (isClosed && (1 < curves.length) ? ' Z' : '');
        }
        return arguments.length ? SVG('path', {
            'id': [self.id, false],
            'd': [path, self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var self = this;
        self.style.toCanvas(ctx);
        self.toCanvasPath(ctx);
        if ('none' !== self.style['fill']) ctx.fill();
        ctx.stroke();
    },
    toCanvasPath: function(ctx) {
        var self = this,
            curves = self.curves,
            n = curves.length, i,
            isConnected, isClosed,
            m, b, c;
        if (!n) return;
        isConnected = self.isConnected();
        isClosed = self.isClosed(isConnected);
        ctx.beginPath();
        if (isConnected)
        {
            ctx.moveTo(curves[0]._points[0].x, curves[0]._points[0].y);
            m = ctx.moveTo;
            b = ctx.beginPath;
            c = ctx.closePath;
            ctx.moveTo = NOP;
            ctx.beginPath = NOP;
            ctx.closePath = NOP;
        }
        for (i=0; i<n; ++i) curves[i].toCanvasPath(ctx);
        if (isConnected)
        {
            ctx.moveTo = m;
            ctx.beginPath = b;
            ctx.closePath = c;
            if (isClosed) ctx.closePath();
        }
    },
    toTex: function() {
        return '\\text{CompositeCurve: }\\begin{cases}&'+this.curves.map(Tex).join('\\\\&')+'\\end{cases}';
    },
    toString: function() {
        return 'CompositeCurve('+"\n"+this.curves.map(Str).join("\n")+"\n"+')';
    }
});
Geometrize.CompositeCurve = CompositeCurve;
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

        if (is_array(start) && null == end)
        {
            end = start[1];
            start = start[0];
        }
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
        var self = this;
        return new Line(self.start.clone(), self.end.clone());
    },
    transform: function(matrix) {
        var self = this;
        return new Line(self.start.transform(matrix), self.end.transform(matrix));
    },
    hasPoint: function(point) {
        var p = this._points;
        return !!point_on_line_segment(point, p[0], p[1]);
    },
    intersects: function(other) {
        var self = this, i, p;
        if (other instanceof Point)
        {
            p = self._points;
            i = point_on_line_segment(other, p[0], p[1]);
            return i ? [other] : false;
        }
        else if (other instanceof Line)
        {
            p = self._points;
            i = line_segments_intersection(p[0], p[1], other._points[0], other._points[1]);
            return i ? [Point(i)] : false;
        }
        else if (other instanceof Circle)
        {
            p = self._points;
            i = line_circle_intersection(p[0], p[1], other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Ellipse)
        {
            p = self._points;
            i = line_ellipse_intersection(p[0], p[1], other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Arc)
        {
            p = self._points;
            i = line_arc_intersection(p[0], p[1], null, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier2)
        {
            p = self._points;
            i = line_qbezier_intersection(p[0], p[1], null, other._points);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier3)
        {
            p = self._points;
            i = line_cbezier_intersection(p[0], p[1], null, other._points);
            return i ? i.map(Point) : false;
        }
        else if ((other instanceof Primitive))
        {
            return other.intersects(this);
        }
        return false;
    },
    f: function(t) {
        return bezier1(t, this._points);
    },
    distanceToPoint: function(point) {
        return point_line_segment_distance(point, this._points[0], this._points[1]);
    },
    bezierPoints: function() {
        var p = this._points;
        return [
        [
        bezier1(0, p),
        bezier1(0.5, p),
        bezier1(0.5, p),
        bezier1(1, p)
        ]
        ];
    },
    toSVG: function(svg) {
        var self = this, p = self._points;
        return SVG('line', {
            'id': [self.id, false],
            'x1': [p[0].x, self.start.isChanged() || self.values.matrix.isChanged()],
            'y1': [p[0].y, self.start.isChanged() || self.values.matrix.isChanged()],
            'x2': [p[1].x, self.end.isChanged() || self.values.matrix.isChanged()],
            'y2': [p[1].y, self.end.isChanged() || self.values.matrix.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, p = self._points,
            path = ['M',p[0].x,p[0].y,'L',p[1].x,p[1].y].join(' ');
        return arguments.length ? SVG('path', {
            'id': [self.id, false],
            'd': [path, self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var self = this;
        self.style.toCanvas(ctx);
        self.toCanvasPath(ctx);
        ctx.stroke();
    },
    toCanvasPath: function(ctx) {
        var self = this, p1 = self._points[0], p2 = self._points[1];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
    },
    toTex: function() {
        var self = this, p1 = self.start, p2 = self.end;
        return '\\text{Line: }'+signed(p2.y - p1.y, false)+' \\cdot x '+signed(p1.x - p2.x)+' \\cdot y '+signed(p2.x*p1.y - p1.x*p2.y)+' = 0\\text{, }'+Str(stdMath.min(p1.x, p2.x))+' \\le x \\le '+Str(stdMath.max(p1.x, p2.x))+'\\text{, }'+Str(stdMath.min(p1.y, p2.y))+' \\le y \\le '+Str(stdMath.max(p1.y, p2.y));
    },
    toString: function() {
        var self = this;
        return 'Line('+[Str(self.start), Str(self.end)].join(',')+')';
    }
});
var Line = Bezier1;
Geometrize.Bezier1 = Bezier1;
Geometrize.Line = Line;

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
                    _length = polyline_length(self._points);
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
                    _hull = convex_hull(self._points).map(Point);
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
        var self = this, p = self.points;
        return 2 < p.length ? p[0].eq(p[p.length-1]) : false;
    },
    isConvex: function() {
        return this._is_convex;
    },
    hasPoint: function(point) {
        return point_on_polyline(point, this._points);
    },
    hasInsidePoint: function(point, strict) {
        if (!this.isClosed()) return false;
        var inside = point_inside_polyline(point, {x:this._bbox.xmax+10, y:point.y}, this._points);
        return strict ? 1 === inside : 0 < inside;
    },
    f: function(t) {
        var p = this._points, n = p.length - 1, i = stdMath.floor(t*n);
        return 1 === t ? {x:p[n].x, y:p[n].y} : bezier1(n*(t - i/n), [p[i], p[i+1]]);
    },
    intersects: function(other) {
        var self = this, i;
        if (other instanceof Point)
        {
            return self.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Line)
        {
            i = polyline_line_intersection(self._points, other._points[0], other._points[1]);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Circle)
        {
            i = polyline_circle_intersection(self._points, other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Ellipse)
        {
            i = polyline_ellipse_intersection(self._points, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Arc)
        {
            i = polyline_arc_intersection(self._points, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier2)
        {
            i = polyline_qbezier_intersection(self._points, other._points);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier3)
        {
            i = polyline_cbezier_intersection(self._points, other._points);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Polyline)
        {
            i = polyline_polyline_intersection(self._points, other._points);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(self = this);
        }
        return false;
    },
    intersectsSelf: function() {
        var self = this, ii, i = [], p = self._points, n = p.length,
            j, k, p1, p2, p3, p4;
        for (j=0; j<n; ++j)
        {
            if (j+1 >= n) break;
            for (k=j+2; k<n; ++k)
            {
                if (k+1 >= n) break;
                p1 = p[j]; p2 = p[j+1];
                p3 = p[k]; p4 = p[k+1];
                ii = line_segments_intersection(p1, p2, p3, p4);
                if (ii)
                {
                    if ((j === 0) && (k === n-2) && p_eq(p1, p4)) ii = ii.filter(function(p) {return !p_eq(p, p1);});
                    else if ((k === j+2) && p_eq(p2, p3)) ii = ii.filter(function(p) {return !p_eq(p, p2);});
                    i.push.apply(i, ii);
                }
            }
        }
        return i ? i.map(Point) : false;
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
    bezierPoints: function() {
        var p = this._points, n = p.length;
        return p.reduce(function(b, _, i) {
            if (i+1 < n)
            {
                var pp = [p[i], p[i+1]];
                b.push([bezier1(0, pp), bezier1(0.5, pp), bezier1(0.5, pp), bezier1(1, pp)]);
            }
            return b;
        }, []);
    },
    toSVG: function(svg) {
        var self = this;
        return SVG('polyline', {
            'id': [self.id, false],
            'points': [self._points.map(function(p) {return Str(p.x)+' '+Str(p.y);}).join(' '), self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, path = 'M '+(self._points.map(function(p) {
            return Str(p.x)+' '+Str(p.y);
        }).join(' L ')) + (self.isClosed() ? ' Z' : '');
        return arguments.length ? SVG('path', {
            'id': [self.id, false],
            'd': [path, self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var self = this;
        self.style.toCanvas(ctx);
        elf.toCanvasPath(ctx);
        if (self.isClosed() && 'none' !== self.style['fill'])
        {
            ctx.fill();
        }
        ctx.stroke();
    },
    toCanvasPath: function(ctx) {
        var self = this, p = self._points, n = p.length, i;
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        for (i=1; i<n; ++i) ctx.lineTo(p[i].x, p[i].y);
        if (self.isClosed()) ctx.closePath();
    },
    toTex: function() {
        var lines = this.lines;
        return '\\text{Polyline: }\\begin{cases}&'+lines.map(Tex).join('\\\\&')+'\\end{cases}';
    },
    toString: function() {
        return 'Polyline('+this.points.map(Str).join(',')+')';
    }
});
Geometrize.Polyline = Polyline;
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
            _hull = null,
            BB = null
        ;

        if (start instanceof Arc) return start;
        if (!(self instanceof Arc)) return new Arc(start, end, radiusX, radiusY, angle, largeArc, sweep);
        _radiusX = new Value(stdMath.abs(Num(radiusX)));
        _radiusY = new Value(stdMath.abs(Num(radiusY)));
        _angle = new Value(angle);
        _cos = stdMath.cos(rad(_angle.val()));
        _sin = stdMath.sin(rad(_angle.val()));
        _largeArc = new Value(!!largeArc ? 1 : 0);
        _sweep = new Value(!!sweep ? 1 : 0);

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
        def(self, 'largeArc', {
            get: function() {
                return _largeArc.val();
            },
            set: function(largeArc) {
                _largeArc.val(!!largeArc ? 1 : 0);
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
                _sweep.val(!!sweep ? 1 : 0);
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
                return self._params[0];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'theta', {
            get: function() {
                return self._params[1];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'dtheta', {
            get: function() {
                return self._params[2];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'rX', {
            get: function() {
                return self._params[3];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'rY', {
            get: function() {
                return self._params[4];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'cs', {
            get: function() {
                return [_cos, _sin];
            },
            enumerable: false,
            configurable: false
        });
        def(self, '_params', {
            get: function() {
                if (null == _params)
                {
                    _params = arc2ellipse(self.start.x, self.start.y, self.end.x, self.end.y, self.largeArc, self.sweep, self.radiusX, self.radiusY, self.cs);
                }
                return _params;
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    // approximate
                    _length = polyline_length(self._lines);
                }
                return _length;
            },
            enumerable: true,
            configurable: false
        });
        BB = function BB(o1, o2, cx, cy, rx, ry, theta, dtheta, angle, sweep) {
            var theta2 = theta + dtheta,
                otherArc = false,
                tan = stdMath.tan(rad(angle)),
                p1, p2, p3, p4, t,
                xmin, xmax, ymin, ymax,
                txmin, txmax, tymin, tymax
            ;
            if (!sweep)
            {
                t = theta;
                theta = theta2;
                theta2 = t;
            }
            if (theta > theta2)
            {
                t = theta;
                theta = theta2;
                theta2 = t;
                otherArc = true;
            }
            // find min/max from zeroes of directional derivative along x and y
            // first get of whole ellipse
            // along x axis
            t = stdMath.atan2(-ry*tan, rx);
            if (t < 0) t += TWO_PI;
            p1 = arc(t, cx, cy, rx, ry, _cos, _sin);
            t += PI;
            p2 = arc(t, cx, cy, rx, ry, _cos, _sin);
            // along y axis
            t = stdMath.atan2(ry, rx*tan);
            if (t < 0) t += TWO_PI;
            p3 = arc(t, cx, cy, rx, ry, _cos, _sin);
            t += PI;
            p4 = arc(t, cx, cy, rx, ry, _cos, _sin);
            if (p2.x < p1.x)
            {
                xmin = p2;
                xmax = p1;
            }
            else
            {
                xmin = p1;
                xmax = p2;
            }
            if (p3.y < p4.y)
            {
                ymin = p3;
                ymax = p4;
            }
            else
            {
                ymin = p4;
                ymax = p3;
            }
            // refine bounding box by elliminating points not on the arc
            txmin = vector_angle(1, 0, xmin.x - cx, xmin.y - cy);
            txmax = vector_angle(1, 0, xmax.x - cx, xmax.y - cy);
            tymin = vector_angle(1, 0, ymin.x - cx, ymin.y - cy);
            tymax = vector_angle(1, 0, ymax.x - cx, ymax.y - cy);
            if (txmin < 0) txmin += TWO_PI;
            if (txmin > TWO_PI) txmin -= TWO_PI;
            if (txmax < 0) txmax += TWO_PI;
            if (txmax > TWO_PI) txmax -= TWO_PI;
            if (tymin < 0) tymin += TWO_PI;
            if (tymin > TWO_PI) tymin -= TWO_PI;
            if (tymax < 0) tymax += TWO_PI;
            if (tymax > TWO_PI) tymax -= TWO_PI;
            if ((!otherArc && (theta > txmin || theta2 < txmin)) || (otherArc && !(theta > txmin || theta2 < txmin)))
            {
                xmin = o1.x < o2.x ? o1 : o2;
            }
            if ((!otherArc && (theta > txmax || theta2 < txmax)) || (otherArc && !(theta > txmax || theta2 < txmax)))
            {
                xmax = o1.x > o2.x ? o1 : o2;
            }
            if ((!otherArc && (theta > tymin || theta2 < tymin)) || (otherArc && !(theta > tymin || theta2 < tymin)))
            {
                ymin = o1.y < o2.y ? o1 : o2;
            }
            if ((!otherArc && (theta > tymax || theta2 < tymax)) || (otherArc && !(theta > tymax || theta2 < tymax)))
            {
                ymax = o1.y > o2.y ? o1 : o2;
            }
            return {
                ymin: ymin.y,
                xmin: xmin.x,
                ymax: ymax.y,
                xmax: xmax.x
            };
        };
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    _bbox = BB(self.start, self.end, self.center.x, self.center.y, self.rX, self.rY, self.theta, self.dtheta, self.angle, self.sweep);
                }
                return _bbox;
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
        var self = this;
        return new Arc(self.start.clone(), self.end.clone(), self.radiusX, self.radiusY, self.angle, self.largeArc, self.sweep);
    },
    transform: function(matrix) {
        var self = this,
            rX = self.radiusX,
            rY = self.radiusY,
            a = self.angle,
            r = deg(matrix.getRotationAngle()),
            s = matrix.getScale()
        ;
        return new Arc(
            self.start.transform(matrix),
            self.end.transform(matrix),
            rX * s.x,
            rY * s.y,
            a + r,
            self.largeArc,
            self.sweep
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
    f: function(t) {
        var self = this, c = self.center, cs = self.cs;
        return arc(self.theta + t*self.dtheta, c.x, c.y, self.rX, self.rY, cs[0], cs[1]);
    },
    d: function() {
        var self = this,
            p = ellipse2arc(self.center.x, self.center.y, self.rY, self.rX, [self.cs[0], -self.cs[1]], -self.theta, -self.dtheta);
        return new Arc(
            p.p0,
            p.p1,
            -self.angle,
            p.fa,
            p.fs
        );
    },
    hasPoint: function(point) {
        var self = this;
        return point_on_arc(point, self.center, self.rX, self.rY, self.cs, self.theta, self.dtheta);
    },
    hasInsidePoint: function(point, strict) {
        return strict ? false : this.hasPoint(point);
    },
    intersects: function(other) {
        var self = this, i;
        if (other instanceof Point)
        {
            return self.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Circle)
        {
            i = polyline_circle_intersection(self._lines, other.center, other.radius);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Ellipse)
        {
            i = polyline_ellipse_intersection(self._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Arc)
        {
            i = polyline_arc_intersection(self._lines, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(self);
        }
        return false;
    },
    bezierPoints: function() {
        var self = this,
            c = self.center,
            cx = c.x,
            cy = c.y,
            rx = self.rX,
            ry = self.rY,
            cs = self.cs,
            cos = cs[0],
            sin = cs[1],
            theta = self.theta,
            dtheta = self.dtheta,
            r = 2*abs(dtheta)/PI,
            i, n, beziers
        ;
        if (is_almost_equal(r, 1)) r = 1;
        if (is_almost_equal(r, stdMath.floor(r))) r = stdMath.floor(r);
        n = stdMath.max(1, stdMath.ceil(r));
        dtheta /= n;
        beziers = new Array(n);
        for (i=0; i<n; ++i,theta+=dtheta)
        {
            beziers[i] = arc2bezier(theta, dtheta, cx, cy, rx, ry, cos, sin);
        }
        return beziers;
    },
    toSVG: function(svg) {
        return this.toSVGPath(arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, p1 = self.start, p2 = self.end,
            rx = self.radiusX, ry = self.radiusY,
            a = self.angle,
            l = self.largeArc ? 1 : 0,
            s = self.sweep ? 1 : 0,
            path = ['M',p1.x,p1.y,'A',rx,ry,a,l,s,p2.x,p2.y].join(' ');
        return arguments.length ? SVG('path', {
            'id': [self.id, false],
            'd': [path, self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var self = this;
        self.style.toCanvas(ctx);
        self.toCanvasPath(ctx);
        ctx.stroke();
    },
    toCanvasPath: function(ctx) {
        var self = this, c = self.center, rx = self.rX, ry = self.rY, fs = !self.sweep,
            a = rad(self.angle), t1 = self.theta, dt = self.dtheta;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, rx, ry, a, t1, t1 + dt, fs);
        if (abs(dt) + EPS >= TWO_PI) ctx.closePath();
    },
    toTex: function() {
        var self = this;
        return '\\text{Arc: }\\left('+[Tex(self.start), Tex(self.end), Str(self.radiusX), Str(self.radiusY), Str(self.angle)+'\\text{°}', Str(self.largeArc ? 1 : 0), Str(self.sweep ? 1 : 0)].join(',')+'\\right)';
    },
    toString: function() {
        var self = this;
        return 'Arc('+[Str(self.start), Str(self.end), Str(self.radiusX), Str(self.radiusY), Str(self.angle)+'°', Str(self.largeArc), Str(self.sweep)].join(',')+')';
    }
});
Geometrize.Arc = Arc;
// 2D Quadratic Bezier class
var Bezier2 = makeClass(Bezier, {
    constructor: function Bezier2(points) {
        var self = this,
            _length = null,
            _bbox = null,
            _hull = null,
            BB = null
        ;

        if (points instanceof Bezier2) return points;
        if (!(self instanceof Bezier2)) return new Bezier2(points);

        self.$super('constructor', [points]);

        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    // approximate
                    _length = polyline_length(self._lines);
                }
                return _length;
            },
            enumerable: true,
            configurable: false
        });
        BB = function BB(p) {
            // find min/max from zeroes of directional derivative along x and y
            var tx = solve_linear(p[0].x - 2*p[1].x + p[2].x, p[1].x - p[0].x),
                px = false === tx ? [p[1]] : tx.map(function(t) {
                    return 0 <= t && t <= 1 ? bezier2(t, p) : p[1];
                }),
                ty = solve_linear(p[0].y - 2*p[1].y + p[2].y, p[1].y - p[0].y),
                py = false === ty ? [p[1]] : ty.map(function(t) {
                    return 0 <= t && t <= 1 ? bezier2(t, p) : p[1];
                }),
                xmin = stdMath.min.apply(stdMath, px.concat([p[0], p[2]]).map(x)),
                xmax = stdMath.max.apply(stdMath, px.concat([p[0], p[2]]).map(x)),
                ymin = stdMath.min.apply(stdMath, py.concat([p[0], p[2]]).map(y)),
                ymax = stdMath.max.apply(stdMath, py.concat([p[0], p[2]]).map(y))
            ;
            return {
                ymin: ymin,
                xmin: xmin,
                ymax: ymax,
                xmax: xmax
            };
        };
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    _bbox = BB(self._points);
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
                        // transform curve to be aligned to x-axis
                        T = align_curve(p),
                        m = Matrix.rotate(T.R).mul(Matrix.translate(T.Tx, T.Ty)),
                        // compute transformed bounding box
                        bb = BB(p.map(function(pi) {return m.transform(pi, {x:0, y:0});})),
                        // reverse back to original curve
                        invm = m.inv()
                    ;
                    _hull = [
                        invm.transform(new Point(bb.xmin, bb.ymin)),
                        invm.transform(new Point(bb.xmax, bb.ymin)),
                        invm.transform(new Point(bb.xmax, bb.ymax)),
                        invm.transform(new Point(bb.xmin, bb.ymax))
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
    name: 'QBezier',
    clone: function() {
        return new Bezier2(this.points.map(function(p) {return p.clone();}));
    },
    transform: function(matrix) {
        return new Bezier2(this.points.map(function(p) {return p.transform(matrix);}));
    },
    hasPoint: function(point) {
        return point_on_qbezier(point, this._points)
    },
    intersects: function(other) {
        var self = this, i;
        if (other instanceof Point)
        {
            i = point_on_qbezier(other, self._points)
            return i ? [other] : false;
        }
        else if (other instanceof Circle)
        {
            i = polyline_circle_intersection(self._lines, other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Ellipse)
        {
            i = polyline_ellipse_intersection(self._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Arc)
        {
            i = polyline_arc_intersection(self._lines, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier2)
        {
            i = polyline_qbezier_intersection(self._lines, other._points);
            return i ? i.map(Point) : false;
        }
        else if ((other instanceof Primitive))
        {
            return other.intersects(self);
        }
        return false;
    },
    f: function(t) {
        return bezier2(t, this._points);
    },
    bezierPoints: function() {
        var p = this._points;
        return [
        [
        {x:p[0].x, y:p[0].y},
        {x:p[0].x + (p[1].x - p[0].x)*2/3, y:p[0].y + (p[1].y - p[0].y)*2/3},
        {x:p[2].x + (p[1].x - p[2].x)*2/3, y:p[2].y + (p[1].y - p[2].y)*2/3},
        {x:p[2].x, y:p[2].y}
        ]
        ];
    },
    toSVG: function(svg) {
        return this.toSVGPath(arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, p = self._points,
            path = ['M',p[0].x,p[0].y,'Q',p[1].x,p[1].y,p[2].x,p[2].y].join(' ');
        return arguments.length ? SVG('path', {
            'id': [self.id, false],
            'd': [path, self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var self = this;
        self.style.toCanvas(ctx);
        self.toCanvasPath(ctx);
        ctx.stroke();
    },
    toCanvasPath: function(ctx) {
        var p = this._points;
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        ctx.quadraticCurveTo(p[1].x, p[1].y, p[2].x, p[2].y);
    }
});
Geometrize.QBezier = Geometrize.Bezier2 = Bezier2;
// 2D Cubic Bezier class
var Bezier3 = makeClass(Bezier, {
    constructor: function Bezier3(points) {
        var self = this,
            _length = null,
            _bbox = null,
            _hull = null,
            BB = null
        ;

        if (points instanceof Bezier3) return points;
        if (!(self instanceof Bezier3)) return new Bezier3(points);

        self.$super('constructor', [points]);

        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    // approximate
                    _length = polyline_length(self._lines);
                }
                return _length;
            },
            enumerable: true,
            configurable: false
        });
        BB = function BB(c) {
            // find min/max from zeroes of directional derivative along x and y
            var tx = solve_quadratic(3*(-c[0].x + 3*c[1].x - 3*c[2].x + c[3].x), 2*(3*c[0].x - 6*c[1].x + 3*c[2].x), -3*c[0].x + 3*c[1].x),
                px = false === tx ? [c[1], c[2]] : tx.map(function(t, i) {
                    return 0 <= t && t <= 1 ? bezier3(t, c) : c[i+1];
                }),
                ty = solve_quadratic(3*(-c[0].y + 3*c[1].y - 3*c[2].y + c[3].y), 2*(3*c[0].y - 6*c[1].y + 3*c[2].y), -3*c[0].y + 3*c[1].y),
                py = false === ty ? [c[1], c[2]] : ty.map(function(t, i) {
                    return 0 <= t && t <= 1 ? bezier3(t, c) : c[i+1];
                }),
                xmin = stdMath.min.apply(stdMath, px.concat([c[0], c[3]]).map(x)),
                xmax = stdMath.max.apply(stdMath, px.concat([c[0], c[3]]).map(x)),
                ymin = stdMath.min.apply(stdMath, py.concat([c[0], c[3]]).map(y)),
                ymax = stdMath.max.apply(stdMath, py.concat([c[0], c[3]]).map(y))
            ;
            return {
                ymin: ymin,
                xmin: xmin,
                ymax: ymax,
                xmax: xmax
            };
        };
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    _bbox = BB(self._points);
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
                        // transform curve to be aligned to x-axis
                        T = align_curve(p),
                        m = Matrix.rotate(T.R).mul(Matrix.translate(T.Tx, T.Ty)),
                        // compute transformed bounding box
                        bb = BB(p.map(function(pi) {return m.transform(pi, {x:0, y:0});})),
                        // reverse back to original curve
                        invm = m.inv()
                    ;
                    _hull = [
                        invm.transform(new Point(bb.xmin, bb.ymin)),
                        invm.transform(new Point(bb.xmax, bb.ymin)),
                        invm.transform(new Point(bb.xmax, bb.ymax)),
                        invm.transform(new Point(bb.xmin, bb.ymax))
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
    name: 'CBezier',
    clone: function() {
        return new Bezier3(this.points.map(function(p) {return p.clone();}));
    },
    transform: function(matrix) {
        return new Bezier3(this.points.map(function(p) {return p.transform(matrix);}));
    },
    hasPoint: function(point) {
        return point_on_cbezier(point, this._points)
    },
    intersects: function(other) {
        var self = this, i;
        if (other instanceof Point)
        {
            i = point_on_cbezier(other, self._points)
            return i ? [other] : false;
        }
        else if (other instanceof Circle)
        {
            i = polyline_circle_intersection(self._lines, other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Ellipse)
        {
            i = polyline_ellipse_intersection(self._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Arc)
        {
            i = polyline_arc_intersection(self._lines, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier2)
        {
            i = polyline_qbezier_intersection(self._lines, other._points);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier3)
        {
            i = polyline_cbezier_intersection(self._lines, other._points);
            return i ? i.map(Point) : false;
        }
        else if ((other instanceof Primitive))
        {
            return other.intersects(self);
        }
        return false;
    },
    f: function(t) {
        return bezier3(t, this._points);
    },
    bezierPoints: function() {
        var p = this._points;
        return [
        [
        {x:p[0].x, y:p[0].y},
        {x:p[1].x, y:p[1].y},
        {x:p[2].x, y:p[2].y},
        {x:p[3].x, y:p[3].y}
        ]
        ];
    },
    toSVG: function(svg) {
        return this.toSVGPath(arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, p = self._points,
            path = ['M',p[0].x,p[0].y,'C',p[1].x,p[1].y,p[2].x,p[2].y,p[3].x,p[3].y].join(' ');
        return arguments.length ? SVG('path', {
            'id': [self.id, false],
            'd': [path, self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var self = this;
        self.style.toCanvas(ctx);
        self.toCanvasPath(ctx);
        ctx.stroke();
    },
    toCanvasPath: function(ctx) {
        var p = this._points;
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        ctx.bezierCurveTo(p[1].x, p[1].y, p[2].x, p[2].y, p[3].x, p[3].y);
    }
});
Geometrize.CBezier = Geometrize.Bezier3 = Bezier3;
// 2D Polygon class
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
                    _length = polyline_length(self._lines);
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
                    _area = polyline_area(self._lines);
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
                    _hull = convex_hull(self._points).map(Point);
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
    hasPoint: function(point) {
        return 2 === point_inside_polyline(point, {x:this._bbox.xmax+10, y:point.y}, this._lines);
    },
    hasInsidePoint: function(point, strict) {
        var inside = point_inside_polyline(point, {x:this._bbox.xmax+10, y:point.y}, this._lines);
        return strict ? 1 === inside : 0 < inside;
    },
    f: function(t) {
        var p = this._lines, n = p.length - 1, i = stdMath.floor(t*n);
        return 1 === t ? {x:p[n].x, y:p[n].y} : bezier1(n*(t - i/n), [p[i], p[i+1]]);
    },
    intersects: function(other) {
        var self = this, i;
        if (other instanceof Point)
        {
            return self.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Line)
        {
            i = polyline_line_intersection(self._lines, other._points[0], other._points[1]);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Circle)
        {
            i = polyline_circle_intersection(self._lines, other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Ellipse)
        {
            i = polyline_ellipse_intersection(self._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Arc)
        {
            i = polyline_arc_intersection(self._lines, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier2)
        {
            i = polyline_qbezier_intersection(self._lines, other._points);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier3)
        {
            i = polyline_cbezier_intersection(self._lines, other._points);
            return i ? i.map(Point) : false;
        }
        else if ((other instanceof Polyline) || (other instanceof Polygon))
        {
            i = polyline_polyline_intersection(self._lines, other._lines);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(self);
        }
        return false;
    },
    intersectsSelf: function() {
        var self = this, ii, i = [], p = self._lines, n = p.length,
            j, k, p1, p2, p3, p4;
        for (j=0; j<n; ++j)
        {
            if (j+1 >= n) break;
            for (k=j+2; k<n; ++k)
            {
                if (k+1 >= n) break;
                p1 = p[j]; p2 = p[j+1];
                p3 = p[k]; p4 = p[k+1];
                ii = line_segments_intersection(p1, p2, p3, p4);
                if (ii)
                {
                    if ((j === 0) && (k === n-2) && p_eq(p1, p4)) ii = ii.filter(function(p) {return !p_eq(p, p1);});
                    else if ((k === j+2) && p_eq(p2, p3)) ii = ii.filter(function(p) {return !p_eq(p, p2);});
                    i.push.apply(i, ii);
                }
            }
        }
        return i ? i.map(Point) : false;
    },
    bezierPoints: function() {
        var p = this._lines, n = p.length;
        return p.reduce(function(b, _, i) {
            if (i+1 < n)
            {
                var pp = [p[i], p[i+1]];
                b.push([bezier1(0, pp), bezier1(0.5, pp), bezier1(0.5, pp), bezier1(1, pp)]);
            }
            return b;
        }, []);
    },
    toSVG: function(svg) {
        var self = this;
        return SVG('polygon', {
            'id': [self.id, false],
            'points': [self._points.map(function(p) {return Str(p.x)+' '+Str(p.y);}).join(' '), self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, path = 'M '+(self._lines.map(function(p) {
            return Str(p.x)+' '+Str(p.y);
        }).join(' L '))+' Z';
        return arguments.length ? SVG('path', {
            'id': [self.id, false],
            'd': [path, self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var self = this;
        self.style.toCanvas(ctx);
        self.toCanvasPath(ctx);
        if ('none' !== self.style['fill']) ctx.fill();
        ctx.stroke();
    },
    toCanvasPath: function(ctx) {
        var p = this._lines, n = p.length, i;
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        for (i=1; i<n; ++i) ctx.lineTo(p[i].x, p[i].y);
        ctx.closePath();
    },
    toTex: function() {
        return '\\text{Polygon: }'+'\\left(' + this.vertices.map(Tex).join(',') + '\\right)';
    },
    toString: function() {
        return 'Polygon('+this.vertices.map(Str).join(',')+')';
    }
});
Geometrize.Polygon = Polygon;

// 2D Rect class
var Rect = makeClass(Polygon, {
    constructor: function Rect(top, width, height) {
        var self = this, topLeft, bottomRight;
        if (top instanceof Rect) return top;
        if (!(self instanceof Rect)) return new Rect(top, width, height);
        topLeft = Point(top);
        if (is_numeric(width) && is_numeric(height))
        {
            bottomRight = new Point(topLeft.x + Num(width), topLeft.y + Num(height));
        }
        else
        {
            bottomRight = Point(width);
        }
        self.$super('constructor', [[topLeft, new Point(bottomRight.x, topLeft.y), bottomRight, new Point(topLeft.x, bottomRight.y)]]);

        def(self, 'topLeft', {
            get: function() {
                return self.points[0];
            },
            set: function(topLeft) {
                self.points[0] = topLeft;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'bottomRight', {
            get: function() {
                return self.points[2];
            },
            set: function(bottomRight) {
                self.points[2] = bottomRight;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'width', {
            get: function() {
                return abs(self.bottomRight.x - self.topLeft.x);
            },
            set: function(width) {
                self.bottomRight.x = self.topLeft.x + Num(width);
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'height', {
            get: function() {
                return abs(self.bottomRight.y - self.topLeft.y);
            },
            set: function(height) {
                self.bottomRight.y = self.topLeft.y + Num(height);
            },
            enumerable: true,
            configurable: false
        });
    }
});
Geometrize.Rect = Rect;
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
        var self = this;
        return new Circle(self.center.clone(), self.radius);
    },
    transform: function(matrix) {
        var self = this,
            c = self.center,
            r = self.radius,
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
    f: function(t) {
        var self = this, c = self.center, r = self.radius;
        return arc(t*TWO_PI, c.x, c.y, r, r, 1, 0);
    },
    hasPoint: function(point) {
        self = this;
        return 2 === point_inside_circle(point, self.center, self.radius);
    },
    hasInsidePoint: function(point, strict) {
        var self = this, inside = point_inside_circle(point, self.center, self.radius);
        return strict ? 1 === inside : 0 < inside;
    },
    intersects: function(other) {
        var self = this;
        if (other instanceof Point)
        {
            return self.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Circle)
        {
            var i = circle_circle_intersection(self.center, self.radius, other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(self);
        }
        return false;
    },
    bezierPoints: function() {
        var self = this, c = self.center, r = self.radius;
        return [
        arc2bezier(0, -HALF_PI, c.x, c.y, r, r, 1, 0/*, 0*/),
        arc2bezier(-HALF_PI, -HALF_PI, c.x, c.y, r, r, 1, 0/*, 1*/),
        arc2bezier(-PI, -HALF_PI, c.x, c.y, r, r, 1, 0/*, 0*/),
        arc2bezier(-PI3_2, -HALF_PI, c.x, c.y, r, r, 1, 0/*, 1*/)
        ];
    },
    toSVG: function(svg) {
        var self = this, c = self.center, r = self.radius;
        return SVG('circle', {
            'id': [self.id, false],
            'cx': [c.x, self.center.isChanged()],
            'cy': [c.y, self.center.isChanged()],
            'r': [r, self.values.radius.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, c = self.center, r = self.radius,
            path = ['M',c.x - r,c.y,'A',r,r,0,0,0,c.x + r,c.y,'A',r,r,0,0,0,c.x - r,c.y,'Z'].join(' ');
        return arguments.length ? SVG('path', {
            'id': [self.id, false],
            'd': [path, self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var self = this;
        self.style.toCanvas(ctx);
        self.toCanvasPath(ctx);
        if ('none' !== self.style['fill']) ctx.fill();
        ctx.stroke();
    },
    toCanvasPath: function(ctx) {
        var self = this, c = self.center, r = self.radius;
        ctx.beginPath();
        ctx.arc(c.x, c.x, r, 0, TWO_PI);
        ctx.closePath();
    },
    toTex: function() {
        var self = this, c = self.center, r = Str(self.radius);
        return '\\text{Circle: }\\left|\\begin{pmatrix}\\frac{x'+signed(-c.x)+'}{'+r+'}\\\\\\frac{y'+signed(-c.y)+'}{'+r+'}\\end{pmatrix}\\right|^2 = 1';
    },
    toString: function() {
        var self = this;
        return 'Circle('+[Str(self.center), Str(self.radius)].join(',')+')';
    }
});
Geometrize.Circle = Circle;
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
                    var c = self.center,
                        rx = _radiusX.val(), ry = _radiusY.val(),
                        tan = stdMath.tan(rad(self.angle)),
                        p1, p2, p3, p4, t
                    ;
                    // find min/max from zeroes of directional derivative along x and y
                    // along x axis
                    t = stdMath.atan2(-ry*tan, rx);
                    p1 = arc(t, c.x, c.y, rx, ry, _cos, _sin);
                    p2 = arc(t + PI, c.x, c.y, rx, ry, _cos, _sin);
                    // along y axis
                    t = stdMath.atan2(ry, rx*tan);
                    p3 = arc(t, c.x, c.y, rx, ry, _cos, _sin);
                    p4 = arc(t + PI, c.x, c.y, rx, ry, _cos, _sin);
                    _bbox = {
                        ymin: stdMath.min(p3.y, p4.y),
                        xmin: stdMath.min(p1.x, p2.x),
                        ymax: stdMath.max(p3.y, p4.y),
                        xmax: stdMath.max(p1.x, p2.x)
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
                    var c = self.center, rx = _radiusX.val(), ry = _radiusY.val();
                    _hull = [
                        new Point(toarc(-1, -1, c.x, c.y, rx, ry, _cos, _sin)),
                        new Point(toarc(1, -1, c.x, c.y, rx, ry, _cos, _sin)),
                        new Point(toarc(1, 1, c.x, c.y, rx, ry, _cos, _sin)),
                        new Point(toarc(-1, 1, c.x, c.y, rx, ry, _cos, _sin))
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
        var self = this;
        return new Ellipse(self.center.clone(), self.radiusX, self.radiusY, self.angle);
    },
    transform: function(matrix) {
        var self = this,
            c = self.center,
            rX = self.radiusX,
            rY = self.radiusY,
            a = self.angle,
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
    f: function(t) {
        var self = this, c = self.center, cs = self.cs;
        return arc(t*TWO_PI, c.x, c.y, self.radiusX, self.radiusY, cs[0], cs[1]);
    },
    d: function() {
        var self = this;
        return new Ellipse(
            self.center,
            self.radiusY,
            self.radiusX,
            -self.angle
        );
    },
    hasPoint: function(point) {
        var self = this;
        return 2 === point_inside_ellipse(point, self.center, self.radiusX, self.radiusY, self.cs);
    },
    hasInsidePoint: function(point, strict) {
        var self = this, inside = point_inside_ellipse(point, self.center, self.radiusX, self.radiusY, self.cs);
        return strict ? 1 === inside : 0 < inside;
    },
    intersects: function(other) {
        var self = this, i;
        if (other instanceof Point)
        {
            return self.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Circle)
        {
            i = polyline_circle_intersection(self._lines, other.center, other.radius);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Ellipse)
        {
            i = polyline_ellipse_intersection(self._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(self);
        }
        return false;
    },
    bezierPoints: function() {
        var self = this, c = self.center, cs = self.cs,
            cos = cs[0], sin = cs[1],
            rx = self.radiusX, ry = self.radiusY;
        return [
        arc2bezier(0, -HALF_PI, c.x, c.y, rx, ry, cos, sin/*, 0*/),
        arc2bezier(-HALF_PI, -HALF_PI, c.x, c.y, rx, ry, cos, sin/*, 1*/),
        arc2bezier(-PI, -HALF_PI, c.x, c.y, rx, ry, cos, sin/*, 0*/),
        arc2bezier(-PI3_2, -HALF_PI, c.x, c.y, rx, ry, cos, sin/*, 1*/)
        ];
    },
    toSVG: function(svg) {
        var self = this,
            c = self.center,
            rX = self.radiusX,
            rY = self.radiusY,
            a = self.angle;
        return SVG('ellipse', {
            'id': [self.id, false],
            'cx': [c.x, self.center.isChanged()],
            'cy': [c.y, self.center.isChanged()],
            'rx': [rX, self.values.radiusX.isChanged()],
            'ry': [rY, self.values.radiusY.isChanged()],
            'transform': ['rotate('+Str(a)+' '+Str(c.x)+' '+Str(c.y)+')', self.center.isChanged() || self.values.angle.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, rx = self.radiusX, ry = self.radiusY, a = self.angle,
            p1 = self.f(0), p2 = self.f(0.5),
            path = ['M',p1.x,p1.y,'A',rx,ry,a,0,1,p2.x,p2.y,'A',rx,ry,a,0,1,p1.x,p1.y,'Z'].join(' ');
        return arguments.length ? SVG('path', {
            'id': [self.id, false],
            'd': [path, self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var self = this;
        self.style.toCanvas(ctx);
        self.toCanvasPath(ctx);
        if ('none' !== self.style['fill']) ctx.fill();
        ctx.stroke();
    },
    toCanvasPath: function(ctx) {
        var self = this, c = self.center, rx = self.radiusX, ry = self.radiusY, a = rad(self.angle);
        ctx.beginPath();
        ctx.ellipse(c.x, c.x, rx, ry, a, 0, TWO_PI);
        ctx.closePath();
    },
    toTex: function() {
        var self = this, a = Str(self.angle)+'\\text{°}',
            c = self.center, rX = Str(self.radiusX), rY = Str(self.radiusY);
        return '\\text{Ellipse: }\\left|\\begin{pmatrix}\\cos('+a+')&-\\sin('+a+')\\\\sin('+a+')&\\cos('+a+')\\end{pmatrix}\\begin{pmatrix}\\frac{x'+signed(-c.x)+'}{'+rX+'}\\\\\\frac{y'+signed(-c.y)+'}{'+rY+'}\\end{pmatrix}\\right|^2 = 1';
    },
    toString: function() {
        var self = this;
        return 'Ellipse('+[Str(self.center), Str(self.radiusX), Str(self.radiusY), Str(self.angle)+'°'].join(',')+')';
    }
});
Geometrize.Ellipse = Ellipse;
// 2D generic Shape class
// container for primitives shapes
var Shape = makeClass(Primitive, {});
Geometrize.Shape = Shape;
// https://easings.net/
var Easing = {
    // x is in [0, 1], 0=start, 1=end of animation
    // linear
    'linear': function(x) {
        return x;
    },
    // quadratic
    'ease-in-quad': function(x) {
        return x*x;
    },
    'ease-out-quad': function(x) {
        var xp = 1 - x;
        return 1 - xp*xp;
    },
    'ease-in-out-quad': function(x) {
        return x < 0.5 ? 2*x*x : 1 - stdMath.pow(2 - 2*x, 2)/2;
    },
    // cubic
    'ease-in-cubic': function(x) {
        return x*x*x;
    },
    'ease-out-cubic': function(x) {
        return 1 - stdMath.pow(1 - x, 3);
    },
    'ease-in-out-cubic': function(x) {
        return x < 0.5 ? 4*x*x*x : 1 - stdMath.pow(2 - 2*x, 3)/2;
    },
    // cubic bezier
    'cubic-bezier': function(c0, c1, c2, c3) {
        return bezier([c0, c1, c2, c3]);
    },
    // exponential
    'ease-in-expo': function(x) {
        return 0 === x ? 0 : stdMath.pow(2, 10*x - 10);
    },
    'ease-out-expo': function(x) {
        return 1 === x ? 1 : 1 - stdMath.pow(2, -10*x);
    },
    'ease-in-out-expo': function(x) {
        return 0 === x
              ? 0
              : (1 === x
              ? 1
              : (x < 0.5
              ? stdMath.pow(2, 20*x - 10)/2
              : (2 - stdMath.pow(2, 10 - 20*x))/2));
    },
    // back
    'ease-in-back': function(x) {
        var c1 = 1.70158, c3 = c1 + 1;
        return c3*x*x*x - c1*x*x;
    },
    'ease-out-back': function(x) {
        var c1 = 1.70158, c3 = c1 + 1, xp = x - 1;
        return 1 + c3*stdMath.pow(xp, 3) + c1*stdMath.pow(xp, 2);
    },
    'ease-in-out-back': function(x) {
        var c1 = 1.70158, c2 = c1*1.525;
        return x < 0.5
            ? (stdMath.pow(2*x, 2)*((c2 + 1)*2*x - c2))/2
            : (stdMath.pow(2*x - 2, 2)*((c2 + 1)*(x*2 - 2) + c2) + 2)/2;
    },
    //elastic
    'ease-in-elastic': function(x) {
        return 0 === x
            ? 0
            : (1 === x
            ? 1
            : -stdMath.pow(2, 10*x - 10)*stdMath.sin((x*10 - 10.75)*TWO_PI/3));
    },
    'ease-out-elastic': function(x) {
        return 0 === x
          ? 0
          : (1 === x
          ? 1
          : stdMath.pow(2, -10*x)*stdMath.sin((x*10 - 0.75)*TWO_PI/3) + 1);
    },
    'ease-in-out-elastic': function(x) {
        return 0 === x
          ? 0
          : (1 === x
          ? 1
          : (x < 0.5
          ? -(stdMath.pow(2, 20*x - 10)*stdMath.sin((20*x - 11.125)*TWO_PI/4.5))/2
          : (stdMath.pow(2, -20*x + 10)*stdMath.sin((20*x - 11.125)*TWO_PI/4.5))/2 + 1));
    },
    // bounce
    'ease-in-bounce': function(x) {
        return 1 - ease_out_bounce(1 - x);
    },
    'ease-out-bounce': function(x) {
        return ease_out_bounce(x);
    },
    'ease-in-out-bounce': function(x) {
        return x < 0.5
          ? (1 - ease_out_bounce(1 - 2*x))/2
          : (1 + ease_out_bounce(2*x - 1))/2;
    }
};
function ease_out_bounce(x)
{
    var n1 = 7.5625, d1 = 2.75, x1;

    if (x < 1/d1)
    {
        return n1*x*x;
    }
    else if (x < 2/d1)
    {
        x1 = x - 1.5;
        return n1*(x1/d1)*x1 + 0.75;
    }
    else if (x < 2.5/d1)
    {
        x1 = x - 2.25;
        return n1*(x1/d1)*x1 + 0.9375;
    }
    x1 = x - 2.625
    return n1*(x1/d1)*x1 + 0.984375;
}
Easing['ease-in'] = Easing['ease-in-quad'];
Easing['ease-out'] = Easing['ease-out-quad'];
Easing['ease-in-out'] = Easing['ease-in-out-quad'];

function prepare_tween(tween, fps)
{
    tween = tween || {};
    if (!tween.keyframes)
    {
        tween.keyframes = {
            "0%": tween.from,
            "100%": tween.to
        };
    }
    var t = {
            duration: null == tween.duration ? 1000 : (tween.duration || 0),
            delay: tween.delay || 0,
            fps: fps,
            nframes: 0,
            keyframes: null,
            kf: 0,
            current: null,
            reverse: false,
            bb: {
                ymin: Infinity,
                xmin: Infinity,
                ymax: -Infinity,
                xmax: -Infinity
            }
        },
        easing = is_function(tween.easing) ? tween.easing : (is_string(tween.easing) && HAS.call(Tween.Easing, tween.easing) ? Tween.Easing[tween.easing] : Tween.Easing.linear)
    ;
    t.nframes = stdMath.ceil(t.duration/1000*t.fps);
    t.keyframes = Object.keys(tween.keyframes || EMPTY_OBJ).map(function(key) {
        var kf = tween.keyframes[key] || EMPTY_OBJ,
            shape = kf.shape && is_function(kf.shape.bezierPoints) ? kf.shape.bezierPoints() : [],
            transform = kf.transform || EMPTY_OBJ,
            sc = transform.scale || EMPTY_OBJ,
            scOrig = sc.origin || {x:0, y:0},
            rot = transform.rotate || EMPTY_OBJ,
            rotOrig = rot.origin || {x:0, y:0},
            tr = transform.translate || EMPTY_OBJ,
            style = kf.style || EMPTY_OBJ,
            stroke = is_string(style.stroke) ? (Color.parse(style.stroke) || style.stroke) : null,
            fill = is_string(style.fill) ? (Color.parse(style.fill) || style.fill) : null,
            hasStroke = is_array(stroke),
            hasFill = is_array(fill),
            hasStrokeOpacity = HAS.call(style, 'stroke-opacity'),
            hasFillOpacity = HAS.call(style, 'fill-opacity'),
            bb
        ;
        if (kf.shape && is_function(kf.shape.getBoundingBox))
        {
            bb = kf.shape.getBoundingBox();
            t.bb.ymin = stdMath.min(t.bb.ymin, bb.ymin||0);
            t.bb.xmin = stdMath.min(t.bb.xmin, bb.xmin||0);
            t.bb.ymax = stdMath.max(t.bb.ymax, bb.ymax||0);
            t.bb.xmax = stdMath.max(t.bb.xmax, bb.xmax||0);
        }
        return {
            frame: stdMath.round(Num(key)/100*(t.nframes - 1)),
            shape: [
                shape.slice(),
                shape.slice()
            ],
            transform: {
                scale: {
                    origin: {
                        x: scOrig.x || 0,
                        y: scOrig.y || 0
                    },
                    x: (null == sc.x ? 1 : sc.x) || 0,
                    y: (null == sc.y ? 1 : sc.y) || 0
                },
                rotate: {
                    origin: {
                        x: rotOrig.x || 0,
                        y: rotOrig.y || 0
                    },
                    angle: rad(rot.angle || 0)
                },
                translate: {
                    x: tr.x || 0,
                    y: tr.y || 0
                }
            },
            style: {
                'stroke': hasStroke ? stroke.slice(0, 3) : stroke,
                'stroke-opacity': hasStrokeOpacity ? Num(style['stroke-opacity']) : (hasStroke ? stroke[3] : 1),
                'fill': hasFill ? fill.slice(0, 3) : fill,
                'fill-opacity': hasFillOpacity ? Num(style['fill-opacity']) : (hasFill ? fill[3] : 1),
                hasStroke: hasStroke,
                hasFill: hasFill
            },
            easing: is_function(kf.easing) ? kf.easing : (is_string(kf.easing) && HAS.call(Tween.Easing, kf.easing) ? Tween.Easing[kf.easing] : easing)
        };
    }).sort(function(a, b) {
        return a.frame - b.frame
    });
    var maxCurves = 0;
    var match_shapes = function match_shapes(kf1, kf2, index, dir) {
        var s1 = kf1.shape[index], s2 = kf2.shape[index+dir],
            l1 = s1.length, l2 = s2.length,
            m = stdMath.max(l1, l2),
            i, i1, i2, p, b1, b2;
        for (i1=0,i2=0,i=0; i<m; ++i)
        {
            if (i1 >= l1)
            {
                p = 0 < l1 ? s1[l1-1][3] : {x:0, y:0};
                s1.push([{x:p.x, y:p.y}, {x:p.x, y:p.y}, {x:p.x, y:p.y}, {x:p.x, y:p.y}]);
                ++l1; ++i1;
                continue;
            }
            if (i2 >= l2)
            {
                p = 0 < l2 ? s2[l2-1][3] : {x:0, y:0};
                s2.push([{x:p.x, y:p.y}, {x:p.x, y:p.y}, {x:p.x, y:p.y}, {x:p.x, y:p.y}]);
                ++l2; ++i2;
                continue;
            }
            b1 = s1[i1];
            b2 = s2[i2];
            if (!same_dir(b1[0], b1[3], b2[0], b2[3]))
            {
                // adjust shape to avoid curves splitting or crossing over
                p = b1[0];
                s1.splice(i1, 0, [{x:p.x, y:p.y}, {x:p.x, y:p.y}, {x:p.x, y:p.y}, {x:p.x, y:p.y}]);
                p = b2[3];
                s2.splice(i2+1, 0, [{x:p.x, y:p.y}, {x:p.x, y:p.y}, {x:p.x, y:p.y}, {x:p.x, y:p.y}]);
                ++l1;
                ++l2;
                ++m;
                i1 += 2;
                i2 += 2;
            }
            else
            {
                ++i1;
                ++i2;
            }
        }
    };
    var add_curves = function add_curves(shape, numCurves) {
        var p = shape.length ? shape[shape.length - 1][3] : {x:0, y:0};
        while (shape.length < numCurves) shape.push([{x:p.x, y:p.y}, {x:p.x, y:p.y}, {x:p.x, y:p.y}, {x:p.x, y:p.y}]);
    };
    t.keyframes.forEach(function(_, i) {
        if (i+1 < t.keyframes.length)
        {
            // forward direction
            match_shapes(t.keyframes[i], t.keyframes[i+1], 0, 1);
            maxCurves = stdMath.max(maxCurves, t.keyframes[i].shape[0].length);
        }
    });
    t.keyframes.forEach(function(kf, i) {
        add_curves(kf.shape[0], maxCurves);
        add_curves(kf.shape[1], maxCurves);
    });
    return t;
}
function first_frame(tween)
{
    if (tween.reverse)
    {
        tween.kf = tween.keyframes.length - 1;
    }
    else
    {
        tween.kf = 0;
    }
    var frame = tween.keyframes[tween.kf],
        a = frame,
        // translate
        tx = a.transform.translate.x,
        ty = a.transform.translate.y,
        // scale
        osx = a.transform.scale.origin.x,
        osy = a.transform.scale.origin.y,
        sx = a.transform.scale.x,
        sy = a.transform.scale.y,
        // rotate
        orx = a.transform.rotate.origin.x,
        ory = a.transform.rotate.origin.y,
        angle = a.transform.rotate.angle,
        cos = 1, sin = 0,
        as = a.shape[tween.reverse ? 1 : 0], ai, aij,
        i, j, n = as.length, x, y,
        s, cs = new Array(n)
    ;
    if (!is_almost_equal(angle, 0))
    {
        cos = stdMath.cos(angle);
        sin = stdMath.sin(angle);
    }
    tx += orx - cos*orx + sin*ory;
    ty += ory - cos*ory - sin*orx;
    for (i=0; i<n; ++i)
    {
        ai = as[i];
        s = new Array(4);
        for (j=0; j<4; ++j)
        {
            aij = ai[j];
            x = sx*(aij.x - osx) + osx;
            y = sy*(aij.y - osy) + osy;
            s[j] = {
            x: cos*x - sin*y + tx,
            y: sin*x + cos*y + ty
           };
        }
        cs[i] = s;
    }
    tween.current = {
        frame: tween.reverse ? tween.nframes - 1 : 0,
        shape: cs,
        transform: frame.transform,
        style: frame.style
    };
}
function is_first_frame(tween)
{
    return tween.reverse ? (tween.nframes - 1 === tween.current.frame) : (0 === tween.current.frame);
}
function is_tween_finished(tween)
{
    return tween.reverse ? (0 > tween.current.frame) : (tween.current.frame >= tween.nframes);
}
function next_frame(tween)
{
    tween.current.frame = clamp(tween.current.frame + (tween.reverse ? -1 : 1), -1, tween.nframes);
    if (is_tween_finished(tween)) return false;
    if (tween.reverse)
    {
        if (tween.kf >= 1 && tween.current.frame <= tween.keyframes[tween.kf-1].frame)
        {
            if (tween.kf-2 >= 0)
                --tween.kf;
        }
        var a = tween.keyframes[tween.kf],
            b = tween.keyframes[tween.kf >= 1 ? tween.kf-1 : 0],
            _t = abs(tween.current.frame - a.frame)/(a.frame - b.frame + 1);
    }
    else
    {
        if (tween.kf+1 < tween.keyframes.length && tween.current.frame >= tween.keyframes[tween.kf+1].frame)
        {
            if (tween.kf+2 < tween.keyframes.length)
                ++tween.kf;
        }
        var a = tween.keyframes[tween.kf],
            b = tween.keyframes[tween.kf+1 < tween.keyframes.length ? tween.kf+1 : tween.keyframes.length-1],
            _t = (tween.current.frame - a.frame)/(b.frame - a.frame + 1);
    }
    var t = a.easing(_t),
        // translate
        tx = interpolate(a.transform.translate.x, b.transform.translate.x, t),
        ty = interpolate(a.transform.translate.y, b.transform.translate.y, t),
        // scale
        osx = interpolate(a.transform.scale.origin.x, b.transform.scale.origin.x, t),
        osy = interpolate(a.transform.scale.origin.y, b.transform.scale.origin.y, t),
        sx = interpolate(a.transform.scale.x, b.transform.scale.x, t),
        sy = interpolate(a.transform.scale.y, b.transform.scale.y, t),
        // rotate
        orx = interpolate(a.transform.rotate.origin.x, b.transform.rotate.origin.x, t),
        ory = interpolate(a.transform.rotate.origin.y, b.transform.rotate.origin.y, t),
        angle = interpolate(a.transform.rotate.angle, b.transform.rotate.angle, t),
        cos = 1, sin = 0,
        as = a.shape[tween.reverse ? 1 : 0],
        bs = b.shape[tween.reverse ? 0 : 1],
        ai, bi, aij, bij,
        i, j, n = as.length, x, y,
        s, cs = new Array(n)
    ;
    if (!is_almost_equal(angle, 0))
    {
        cos = stdMath.cos(angle);
        sin = stdMath.sin(angle);
    }
    tx += orx - cos*orx + sin*ory;
    ty += ory - cos*ory - sin*orx;
    for (i=0; i<n; ++i)
    {
        ai = as[i];
        bi = bs[i];
        s = new Array(4);
        for (j=0; j<4; ++j)
        {
            aij = ai[j];
            bij = bi[j];
            x = sx*(aij.x + t*(bij.x - aij.x) - osx) + osx;
            y = sy*(aij.y + t*(bij.y - aij.y) - osy) + osy;
            s[j] = {
            x: cos*x - sin*y + tx,
            y: sin*x + cos*y + ty
           };
        }
        cs[i] = s;
    }
    tween.current.shape = cs;
    tween.current.style = {
        'stroke': a.style.hasStroke && b.style.hasStroke ? interpolateRGB(a.style['stroke'], b.style['stroke'], t) : (a.style['stroke'] ? a.style['stroke'] : (b.style['stroke'] || tween.current.style['stroke'])),
        'stroke-opacity': interpolate(a.style['stroke-opacity'], b.style['stroke-opacity'], t),
        'fill': a.style.hasFill && b.style.hasFill ? interpolateRGB(a.style['fill'], b.style['fill'], t) : (a.style['fill'] ? a.style['fill'] : (b.style['fill'] || 'none')),
        'fill-opacity': interpolate(a.style['fill-opacity'], b.style['fill-opacity'], t),
        hasStroke: a.style.hasStroke && b.style.hasStroke,
        hasFill: a.style.hasFill && b.style.hasFill
    };
    return true;
}

// Tween between 2D shapes
var Tween = makeClass(Primitive, {
    constructor: function Tween(tween) {
        var self = this, run = false,
            fps = 60, dt = 0,
            onStart = null, onEnd = null, animate;

        if (tween instanceof Tween) return tween;
        if (!(self instanceof Tween)) return new Tween(tween);

        Primitive.call(self);
        self.start = function() {
            run = true;
            if (is_first_frame(tween) && onStart) onStart(self);
            setTimeout(animate, (is_first_frame(tween) ? (tween.delay || 0) : 0) + dt);
            return self;
        };
        self.stop = function() {
            run = false;
            return self;
        };
        self.rewind = function() {
            first_frame(tween);
            self.isChanged(true);
            return self;
        };
        self.reverse = function(bool) {
            tween.reverse = !!bool;
            return self;
        };
        self.onStart = function(cb) {
            onStart = is_function(cb) ? cb : null;
            return self;
        };
        self.onEnd = function(cb) {
            onEnd = is_function(cb) ? cb : null;
            return self;
        };
        self.numberOfFrames = function() {
            return tween.nframes;
        };
        self.getBoundingBox = function() {
            return {
                ymin: tween.bb.ymin,
                xmin: tween.bb.xmin,
                ymax: tween.bb.ymax,
                xmax: tween.bb.xmax
            };
        };
        self.toSVGPath = function(svg) {
            var firstx = 0, firsty = 0,
                lastx = 0, lasty = 0,
                isConnected = true,
                path = tween.current.shape.map(function(b, i) {
                    var connects = true, c;
                    if (0 === i)
                    {
                        firstx = b[0].x;
                        firsty = b[0].y;
                        connects = true;
                        c = ['M',b[0].x,b[0].y,'C',b[1].x,b[1].y,b[2].x,b[2].y,b[3].x,b[3].y].join(' ');
                    }
                    else
                    {
                        connects = is_almost_equal(b[0].x, lastx) && is_almost_equal(b[0].y, lasty);
                        c = (connects ? ['C',b[1].x,b[1].y,b[2].x,b[2].y,b[3].x,b[3].y] : ['M',b[0].x,b[0].y,'C',b[1].x,b[1].y,b[2].x,b[2].y,b[3].x,b[3].y]).join(' ');
                        if (!connects)
                        {
                            if (isConnected && is_almost_equal(firstx, lastx) && is_almost_equal(firsty, lasty))
                            {
                                // close this and start new path
                                c = 'Z ' + c;
                                isConnected = true;
                            }
                            else
                            {
                                isConnected = false;
                            }
                            firstx = b[0].x;
                            firsty = b[0].y;
                        }
                    }
                    lastx = b[3].x;
                    lasty = b[3].y;
                    return c;
                }).join(' ')
            ;
            if (isConnected && is_almost_equal(firstx, lastx) && is_almost_equal(firsty, lasty))
                path += ' Z';
            if (arguments.length)
            {
                if (tween.current.style['stroke'])
                {
                    self.style['stroke'] = tween.current.style.hasStroke ? Color.toCSS(tween.current.style['stroke']) : tween.current.style['stroke'];
                    self.style['stroke-opacity'] = tween.current.style['stroke-opacity'];
                }
                if (tween.current.style['fill'])
                {
                    self.style['fill'] = tween.current.style.hasFill ? Color.toCSS(tween.current.style['fill']) : tween.current.style['fill'];
                    self.style['fill-opacity'] = tween.current.style['fill-opacity'];
                }
            }
            return arguments.length ? SVG('path', {
                'id': [self.id, false],
                'd': [path, self.isChanged()],
                'style': [self.style.toSVG(), self.style.isChanged()]
            }, svg) : path;
        };
        self.toSVG = function(svg) {
            return self.toSVGPath(arguments.length ? svg : false);
        };
        self.toCanvas = function(ctx) {
            ctx.lineWidth = self.style['stroke-width'];
            ctx.strokeStyle = tween.current.style.hasStroke ? Color.toCSS(tween.current.style['stroke'].concat([tween.current.style['stroke-opacity']])) : (tween.current.style['stroke'] || self.style['stroke']);
            if (tween.current.style['fill'])
            {
                ctx.fillStyle = tween.current.style.hasFill ? Color.toCSS(tween.current.style['fill'].concat([tween.current.style['fill-opacity']])) : tween.current.style['fill'];
            }
            self.toCanvasPath(ctx);
            if (tween.current.style['fill']) ctx.fill();
            ctx.stroke();
        };
        self.toCanvasPath = function(ctx) {
            ctx.beginPath();
            tween.current.shape.forEach(function(cb) {
                ctx.moveTo(cb[0].x, cb[0].y);
                ctx.bezierCurveTo(cb[1].x, cb[1].y, cb[2].x, cb[2].y, cb[3].x, cb[3].y);
            });
        };
        self.dispose = function() {
            run = false;
            onStart = null;
            onEnd = null;
            tween = null;
            self.$super('dispose');
        };

        fps = 60;
        dt = stdMath.floor(1000/fps);
        tween = prepare_tween(tween, fps);
        animate = function animate() {
            if (!run || !tween) return;
            if (next_frame(tween))
            {
                self.isChanged(true);
                if (is_tween_finished(tween))
                {
                    if (onEnd) setTimeout(function() {onEnd(self);}, dt);
                }
                else
                {
                    setTimeout(animate, dt);
                }
            }
        };
        self.rewind();
    },
    name: 'Tween',
    rewind: null,
    start: null,
    stop: null,
    onStart: null,
    onEnd: null
}, {Easing: Easing});
Geometrize.Tween = Tween;
// Plane
// scene container for 2D geometric objects
var Plane = makeClass(null, {
    constructor: function Plane(dom, x0, y0, x1, y1) {
        var self = this,
            svg = null,
            svgEl = null,
            objects = null,
            intersections = null,
            isChanged = true,
            renderSVG, renderCanvas, raf;

        if (!(self instanceof Plane)) return new Plane(dom, x0, y0, x1, y1);

        x0 = Num(x0);
        y0 = Num(y0);
        x1 = Num(x1);
        y1 = Num(y1);
        objects = [];
        svgEl = {};

        def(self, 'x0', {
            get: function() {
                return x0;
            },
            set: function(v) {
                v = Num(v);
                if (x0 !== v) isChanged = true;
                x0 = v;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'x1', {
            get: function() {
                return x1;
            },
            set: function(v) {
                v = Num(v);
                if (x1 !== v) isChanged = true;
                x1 = v;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'y0', {
            get: function() {
                return y0;
            },
            set: function(v) {
                v = Num(v);
                if (y0 !== v) isChanged = true;
                y0 = v;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'y1', {
            get: function() {
                return y1;
            },
            set: function(v) {
                v = Num(v);
                if (y1 !== v) isChanged = true;
                y1 = v;
            },
            enumerable: true,
            configurable: false
        });
        self.add = function(o) {
            if (o instanceof Primitive)
            {
                if (!HAS.call(svgEl, o.id))
                {
                    svgEl[o.id] = null;
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
                if (isBrowser && el && el.parentNode) el.parentNode.removeChild(el);
                delete svgEl[o.id];
                objects.splice(index, 1);
                isChanged = true;
            }
            return self;
        };
        self.getIntersections = function() {
            if (!objects || !objects.length) return [];
            if (isChanged || !intersections)
            {
                intersections = [];
                for (var k,i,j=0,n=objects.length; j<n; ++j)
                {
                    i = objects[j].intersectsSelf();
                    if (i) intersections.push.apply(intersections, i);
                    for (k=j+1; k<n; ++k)
                    {
                        i = objects[j].intersects(objects[k]);
                        if (i) intersections.push.apply(intersections, i);
                    }
                }
            }
            return intersections ? intersections.map(function(p) {
                return p.clone();
            }) : [];
        };
        self.dispose = function() {
            if (isBrowser && svg && svg.parentNode) svg.parentNode.removeChild(svg);
            if (isBrowser) window.cancelAnimationFrame(raf);
            svg = null;
            svgEl = null;
            objects = null;
            return self;
        };
        self.toSVG = function() {
            return SVG('svg', {
            'xmlns': ['http://www.w3.org/2000/svg', true],
            'viewBox': [Str(x0)+' '+Str(y0)+' '+Str(x1)+' '+Str(y1), true]
            }, false, objects.map(function(o){return o instanceof Primitive ? o.toSVG() : '';}).join(''));
        };
        self.toCanvas = function(canvas) {
            return isBrowser ? renderCanvas(canvas || document.createElement('canvas')) : canvas;
        };
        self.toIMG = function() {
            return isBrowser ? self.toCanvas(document.createElement('canvas')).toDataURL('image/png') : '';
        };

        renderSVG = function renderSVG() {
            if (!objects) return;
            if (!svg)
            {
                svg = SVG('svg', {
                'xmlns': ['http://www.w3.org/2000/svg', false],
                'style': ['position:absolute;top:0;left:0;width:100%;height:100%', false],
                'viewBox': [Str(x0)+' '+Str(y0)+' '+Str(x1)+' '+Str(y1), isChanged]
                }, null);
                dom.appendChild(svg);
            }
            else if (isChanged)
            {
                SVG('svg', {
                'viewBox': [Str(x0)+' '+Str(y0)+' '+Str(x1)+' '+Str(y1), isChanged]
                }, svg);
            }
            objects.forEach(function(o) {
                if (o instanceof Primitive)
                {
                    var el = svgEl[o.id];
                    if (null === el)
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
            raf = window.requestAnimationFrame(renderSVG);
        };
        renderCanvas = function renderCanvas(canvas) {
            if (objects && canvas)
            {
                var w = stdMath.abs(x1 - x0), h = stdMath.abs(y1 - y0);
                canvas.style.width = Str(w)+'px';
                canvas.style.height = Str(h)+'px';
                canvas.width = w;
                canvas.height = h;
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, w, h);
                ctx.translate(-x0, -y0);
                objects.forEach(function(o) {
                    if (o instanceof Primitive)
                    {
                        o.toCanvas(ctx);
                    }
                });
            }
            return canvas;
        };
        if (isBrowser) raf = window.requestAnimationFrame(renderSVG);
    },
    dispose: null,
    add: null,
    remove: null,
    getIntersections: null,
    toSVG: null,
    toCanvas: null,
    toIMG: null
});
Geometrize.Plane = Plane;

// ---- utilities -----
function p_eq(p1, p2)
{
    return is_almost_equal(p1.x, p2.x) && is_almost_equal(p1.y, p2.y);
}
function point_line_distance(p0, p1, p2)
{
    var x1 = p1.x, y1 = p1.y,
        x2 = p2.x, y2 = p2.y,
        x = p0.x, y = p0.y,
        dx = x2 - x1, dy = y2 - y1,
        d = hypot(dx, dy)
    ;
    if (is_strictly_equal(d, 0)) return hypot(x - x1, y - y1);
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
    if (is_strictly_equal(d, 0)) return hypot(x - x1, y - y1);
    t = stdMath.max(0, stdMath.min(1, ((x - x1)*dx + (y - y1)*dy) / d));
    return hypot(x - x1 - t*dx, y - y1 - t*dy);
}
function point_on_line_segment(p, p1, p2)
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
        t = is_strictly_equal(dx, 0) ? dyp/dy : dxp/dx;
        return (t >= 0) && (t <= 1);
    }
    return false;
}
function point_on_arc(p, center, rx, ry, cs, theta, dtheta)
{
    var cos = cs[0], sin = cs[1],
        x0 = p.x - center.x,
        y0 = p.y - center.y,
        x = cos*x0 + sin*y0,
        y = -sin*x0 + cos*y0,
        t = stdMath.atan2(y/ry, x/rx);
    if (t < 0) t += TWO_PI;
    t = (t - theta)/dtheta;
    return (t >= 0) && (t <= 1);
}
function point_on_qbezier(p, c)
{
    var tx, ty;
    tx = solve_quadratic(c[0].x - 2*c[1].x + c[2].x, -2*c[0].x + 2*c[1].x, c[0].x - p.x);
    if (!tx) return false;
    if (1 < tx.length && (0 > tx[1] || 1 < tx[1])) tx.pop();
    if (tx.length && (0 > tx[0] || 1 < tx[0])) tx.shift();
    if (!tx.length) return false;
    ty = solve_quadratic(c[0].y - 2*c[1].y + c[2].y, -2*c[0].y + 2*c[1].y, c[0].y - p.y);
    if (!ty) return false;
    if (1 < ty.length && (0 > ty[1] || 1 < ty[1])) ty.pop();
    if (ty.length && (0 > ty[0] || 1 < ty[0])) ty.shift();
    if (!ty.length) return false;
    if (1 < tx.length && 1 < ty.length)
    {
        return (is_almost_equal(tx[0], ty[0]) && is_almost_equal(tx[1], ty[1])) || (is_almost_equal(tx[0], ty[1]) && is_almost_equal(tx[1], ty[0]));
    }
    else if (1 < tx.length && 1 === ty.length)
    {
        return is_almost_equal(tx[0], ty[0]) || is_almost_equal(tx[1], ty[0]);
    }
    else if (1 < ty.length && 1 === tx.length)
    {
        return is_almost_equal(ty[0], tx[0]) || is_almost_equal(ty[1], tx[0]);
    }
    return is_almost_equal(tx[0], ty[0]);
}
function point_on_cbezier(p, c)
{
    var tx, ty;
    tx = solve_cubic(-c[0].x + 3*c[1].x - 3*c[2].x + c[3].x, 3*c[0].x - 6*c[1].x + 3*c[2].x, -3*c[0].x + 3*c[1].x, c[0].x - p.x);
    if (!tx) return false;
    if (2 < tx.length && (0 > tx[2] || 1 < tx[2])) tx.pop();
    if (1 < tx.length && (0 > tx[1] || 1 < tx[1])) tx.splice(1, 1);
    if (tx.length && (0 > tx[0] || 1 < tx[0])) tx.shift();
    if (!tx.length) return false;
    ty = solve_cubic(-c[0].y + 3*c[1].y - 3*c[2].y + c[3].y, 3*c[0].y - 6*c[1].y + 3*c[2].y, -3*c[0].y + 3*c[1].y, c[0].y - p.y);
    if (!ty) return false;
    if (2 < ty.length && (0 > ty[2] || 1 < ty[2])) ty.pop();
    if (1 < ty.length && (0 > ty[1] || 1 < ty[1])) ty.splice(1, 1);
    if (ty.length && (0 > ty[0] || 1 < ty[0])) ty.shift();
    if (!ty.length) return false;
    if (2 < tx.length && 2 < ty.length)
    {
        return (
            is_almost_equal(tx[0], ty[0]) && (
            (is_almost_equal(tx[1], ty[1]) && is_almost_equal(tx[2], ty[2])) ||
            (is_almost_equal(tx[1], ty[2]) && is_almost_equal(tx[2], ty[1]))
            )
        ) || (
            is_almost_equal(tx[1], ty[1]) &&
            is_almost_equal(tx[0], ty[2]) &&
            is_almost_equal(tx[2], ty[0])
        ) || (
            is_almost_equal(tx[2], ty[2]) &&
            is_almost_equal(tx[0], ty[1]) &&
            is_almost_equal(tx[1], ty[0])
        ) || (
            is_almost_equal(tx[0], ty[1]) &&
            is_almost_equal(tx[1], ty[2]) &&
            is_almost_equal(tx[2], ty[0])
        ) || (
            is_almost_equal(tx[0], ty[2]) &&
            is_almost_equal(tx[1], ty[0]) &&
            is_almost_equal(tx[2], ty[1])
        );
    }
    else if (2 < tx.length && 1 < ty.length)
    {
        return (
            is_almost_equal(tx[0], ty[0]) && (
            is_almost_equal(tx[1], ty[1]) ||
            is_almost_equal(tx[2], ty[1])
            )
        ) || (
            is_almost_equal(tx[1], ty[1]) && (
            is_almost_equal(tx[0], ty[0]) ||
            is_almost_equal(tx[2], ty[0])
            )
        ) || (
            is_almost_equal(tx[2], ty[0]) && (
            is_almost_equal(tx[1], ty[1]) ||
            is_almost_equal(tx[0], ty[1])
            )
        ) || (
            is_almost_equal(tx[1], ty[0]) && (
            is_almost_equal(tx[2], ty[1]) ||
            is_almost_equal(tx[0], ty[1])
            )
        );
    }
    else if (1 < tx.length && 2 < ty.length)
    {
        return (
            is_almost_equal(ty[0], tx[0]) && (
            is_almost_equal(ty[1], tx[1]) ||
            is_almost_equal(ty[2], tx[1])
            )
        ) || (
            is_almost_equal(ty[1], tx[1]) && (
            is_almost_equal(ty[0], tx[0]) ||
            is_almost_equal(ty[2], tx[0])
            )
        ) || (
            is_almost_equal(ty[2], tx[0]) && (
            is_almost_equal(ty[1], tx[1]) ||
            is_almost_equal(ty[0], tx[1])
            )
        ) || (
            is_almost_equal(ty[1], tx[0]) && (
            is_almost_equal(ty[2], tx[1]) ||
            is_almost_equal(ty[0], tx[1])
            )
        );
    }
    else if (2 < tx.length && 1 === ty.length)
    {
        return is_almost_equal(tx[0], ty[0]) || is_almost_equal(tx[1], ty[0]) || is_almost_equal(tx[2], ty[0]);
    }
    else if (2 < ty.length && 1 === tx.length)
    {
        return is_almost_equal(ty[0], tx[0]) || is_almost_equal(ty[1], tx[0]) || is_almost_equal(ty[2], tx[0]);
    }
    else if (1 < tx.length && 1 === ty.length)
    {
        return is_almost_equal(tx[0], ty[0]) || is_almost_equal(tx[1], ty[0]);
    }
    else if (1 < ty.length && 1 === tx.length)
    {
        return is_almost_equal(ty[0], tx[0]) || is_almost_equal(ty[1], tx[0]);
    }
    return is_almost_equal(tx[0], ty[0]);
}
function point_inside_rect(p, xmin, ymin, xmax, ymax)
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
        cos = cs[0], sin = cs[1],
        dx0 = p.x - center.x,
        dy0 = p.y - center.y,
        dx = cos*dx0 - sin*dy0,
        dy = cos*dy0 + sin*dx0,
        d2 = dx*dx/rX2 + dy*dy/rY2
    ;
    if (is_almost_equal(d2, 1)) return 2;
    return d2 < 1 ? 1 : 0;
}
function point_on_polyline(p, polyline_points)
{
    for (var i=0,n=polyline_points.length-1; i<n; ++i)
    {
        if (point_on_line_segment(p, polyline_points[i], polyline_points[i+1]))
            return true;
    }
    return false;
}
function point_inside_polyline(p, maxp, polyline_points)
{
    for (var p1,p2,i=0,intersects=0,n=polyline_points.length-1; i<n; ++i)
    {
        p1 = polyline_points[i];
        p2 = polyline_points[i+1];
        if (point_on_line_segment(p, p1, p2)) return 2;
        if (line_segments_intersection(p, maxp, p1, p2)) ++intersects;
    }
    return intersects & 1 ? 1 : 0;
}
function line_segments_intersection(p1, p2, p3, p4)
{
    var p = solve_linear_linear_system(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        p4.y - p3.y, p3.x - p4.x, p4.x*p3.y - p3.x*p4.y
        );
    return p && point_on_line_segment(p, p1, p2) && point_on_line_segment(p, p3, p4) ? p : false;
}
function line_circle_intersection(p1, p2, abcdef)
{
    if (3 < arguments.length) abcdef = circle2quadratic(abcdef, arguments[3]);
    var p = new Array(2), pi = 0, i, n,
        s = solve_linear_quadratic_system(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        abcdef[0], abcdef[1], abcdef[2], abcdef[3], abcdef[4], abcdef[5]
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (point_on_line_segment(s[i], p1, p2))
            p[pi++] = s[i];
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_ellipse_intersection(p1, p2, abcdef)
{
    if (5 < arguments.length) abcdef = ellipse2quadratic(abcdef, arguments[3], arguments[4], arguments[5]);
    var p = new Array(2), pi = 0, i, n,
        s = solve_linear_quadratic_system(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        abcdef[0], abcdef[1], abcdef[2], abcdef[3], abcdef[4], abcdef[5]
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (point_on_line_segment(s[i], p1, p2))
            p[pi++] = s[i];
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_arc_intersection(p1, p2, abcdef, c, rX, rY, cs, t, d)
{
    if (null == abcdef) abcdef = ellipse2quadratic(c, rX, rY, cs);
    var p = new Array(2), pi = 0, i, n,
        x, y, x0, y0, t,
        s = solve_linear_quadratic_system(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        abcdef[0], abcdef[1], abcdef[2], abcdef[3], abcdef[4], abcdef[5]
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (point_on_line_segment(s[i], p1, p2) && point_on_arc(s[i], c, rX, rY, cs, t, d))
        {
            p[pi++] = s[i];
        }
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_qbezier_intersection(p1, p2, coeff, c)
{
    //if (null == abcdef) abcdef = qbezier2quadratic(c);
    if (null == coeff) coeff = qbezier_t_quadratic(c);
    var p = new Array(2), pi = 0, i, n, pt,
        /*s = solve_linear_quadratic_system(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        abcdef[0], abcdef[1], abcdef[2], abcdef[3], abcdef[4], abcdef[5]
        )*/
        A = p2.y - p1.y,
        B = p1.x - p2.x,
        C = p1.x*(p1.y - p2.y) + p1.y*(p2.x - p1.x),
        s = solve_quadratic(
            A*coeff[0].x + B*coeff[0].y,
            A*coeff[1].x + B*coeff[1].y,
            A*coeff[2].x + B*coeff[2].y + C
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (0 > s[i] || 1 < s[i]) continue;
        pt = bezier2(s[i], c);
        if (point_on_line_segment(pt, p1, p2)/* && point_on_qbezier(pt, c)*/)
            p[pi++] = pt;
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_cbezier_intersection(p1, p2, coeff, c)
{
    if (null == coeff) coeff = cbezier_t_cubic(c);
    var p = new Array(3), pi = 0, i, n, pt,
        A = p2.y - p1.y,
        B = p1.x - p2.x,
        C = p1.x*(p1.y - p2.y) + p1.y*(p2.x - p1.x),
        s = solve_cubic(
            A*coeff[0].x + B*coeff[0].y,
            A*coeff[1].x + B*coeff[1].y,
            A*coeff[2].x + B*coeff[2].y,
            A*coeff[3].x + B*coeff[3].y + C
        );
    for (i=0,n=s.length; i<n; ++i)
    {
        if (0 > s[i] || 1 < s[i]) continue;
        pt = bezier3(s[i], c);
        if (point_on_line_segment(pt, p1, p2)/* && point_on_cbezier(pt, c)*/)
            p[pi++] = pt;
    }
    p.length = pi;
    return p.length ? p : false;
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
    if (is_almost_equal(d, 0) && is_almost_equal(r1, r2))
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
    return is_strictly_equal(h, 0) ? [{x:px, y:py}] : [{x:px + h*dy, y:py - h*dx}, {x:px - h*dy, y:py + h*dx}];
}
function polyline_line_intersection(polyline_points, p1, p2)
{
    var i = [], j, p, n = polyline_points.length-1;
    for (j=0; j<n; ++j)
    {
        p = line_segments_intersection(
            polyline_points[j], polyline_points[j+1],
            p1, p2
        );
        if (p) i.push(p);
    }
    return i.length ? i : false;
}
function polyline_circle_intersection(polyline_points, center, radius)
{
    var i = [], j, k, p, n = polyline_points.length-1,
        abcdef = circle2quadratic(center, radius);
    for (j=0; j<n; ++j)
    {
        p = line_circle_intersection(polyline_points[j], polyline_points[j+1], abcdef);
        if (p) i.push.apply(i, p);
    }
    return i.length ? i : false;
}
function polyline_ellipse_intersection(polyline_points, center, radiusX, radiusY, cs)
{
    var i = [], j, k, p, n = polyline_points.length-1,
        abcdef = ellipse2quadratic(center, radiusX, radiusY, cs);
    for (j=0; j<n; ++j)
    {
        p = line_ellipse_intersection(polyline_points[j], polyline_points[j+1], abcdef);
        if (p) i.push.apply(i, p);
    }
    return i.length ? i : false;
}
function polyline_arc_intersection(polyline_points, center, radiusX, radiusY, cs, theta, dtheta)
{
    var i = [], j, k, p, n = polyline_points.length-1,
        abcdef = ellipse2quadratic(center, radiusX, radiusY, cs);
    for (j=0; j<n; ++j)
    {
        p = line_arc_intersection(polyline_points[j], polyline_points[j+1], abcdef, center, radiusX, radiusY, cs, theta, dtheta);
        if (p) i.push.apply(i, p);
    }
    return i.length ? i : false;
}
function polyline_qbezier_intersection(polyline_points, control_points)
{
    var i = [], j, k, p, n = polyline_points.length-1,
        //abcdef = qbezier2quadratic(control_points);
        coeff = qbezier_t_quadratic(control_points);
    for (j=0; j<n; ++j)
    {
        p = line_qbezier_intersection(polyline_points[j], polyline_points[j+1], coeff, control_points);
        if (p) i.push.apply(i, p);
    }
    return i.length ? i : false;
}
function polyline_cbezier_intersection(polyline_points, control_points)
{
    var i = [], j, k, p, n = polyline_points.length-1,
        coeff = cbezier_t_cubic(control_points);
    for (j=0; j<n; ++j)
    {
        p = line_cbezier_intersection(polyline_points[j], polyline_points[j+1], coeff, control_points);
        if (p) i.push.apply(i, p);
    }
    return i.length ? i : false;
}
function polyline_polyline_intersection(polyline1_points, polyline2_points)
{
    var i = [], j, k, p,
        n1 = polyline1_points.length-1,
        n2 = polyline2_points.length-1;
    for (j=0; j<n1; ++j)
    {
        for (k=0; k<n2; ++k)
        {
            p = line_segments_intersection(
                polyline1_points[j], polyline1_points[j+1],
                polyline2_points[k], polyline2_points[k+1]
            );
            if (p) i.push(p);
        }
    }
    return i.length ? i : false;
}
function polyline_length(polyline_points)
{
    for (var p1,p2,length=0,i=0,n=polyline_points.length-1; i<n; ++i)
    {
        p1 = polyline_points[i];
        p2 = polyline_points[i+1];
        length += hypot(p1.x - p2.x, p1.y - p2.y);
    }
    return length;
}
function polyline_area(polyline_points)
{
    for (var p1,p2,area=0,i=0,n=polyline_points.length-1; i<n; ++i)
    {
        p1 = polyline_points[i];
        p2 = polyline_points[i+1];
        // shoelace formula
        area += crossp(p1.x, p1.y, p2.x, p2.y)/2;
    }
    return area;
}
function convex_hull(points)
{
    var pc = points.length, p0, i0, i, p, ps, convexHull, hullSize;

    // at least 3 points must define a non-trivial convex hull
    if (3 > pc) return points;

    p0 = points[0]; i0 = 0;
    for (i=1; i<pc; ++i)
    {
        p = points[i];
        if ((p.y < p0.y) || (is_almost_equal(p.y, p0.y) && (p.x < p0.x)))
        {
            p0 = p;
            i0 = i;
        }
    }
    points.splice(i0, 1);
    --pc;

    ps = points.map(function(p, i) {
        return [polar_angle(p0.x, p0.y, p.x, p.y), i];
    }).sort(function(a, b) {
        return a[0] - b[0];
    }).map(function(pi) {
        return points[pi[1]];
    });

    // pre-allocate array to avoid slow array size changing ops inside loop
    convexHull = new Array(pc + 1);
    convexHull[0] = p0;
    convexHull[1] = ps[0];
    convexHull[2] = ps[1];
    hullSize = 3;
    for (i=2; i<pc; ++i)
    {
        while ((1 < hullSize) && (0 <= dir(ps[i], convexHull[hullSize-1], convexHull[hullSize-2]))) --hullSize;
        convexHull[hullSize++] = ps[i];
    }
    // truncate to actual size
    convexHull.length = hullSize;
    return convexHull;
}
function in_convex_hull(convexHull, p, strict)
{
    var hl = convexHull.length, i, p0, p1, xp;
    if (!hl || 3 > hl) return false;

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
    if (3 > n) return false;

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
function solve_linear(a, b)
{
    return is_strictly_equal(a, 0) ? false : [-b/a];
}
function solve_quadratic(a, b, c)
{
    if (is_strictly_equal(a, 0)) return solve_linear(b, c);
    var D = b*b - 4*a*c, DS = 0;
    if (is_almost_equal(D, 0)) return [-b/(2*a)];
    if (0 > D) return false;
    DS = sqrt(D);
    return [(-b-DS)/(2*a), (-b+DS)/(2*a)];
}
function solve_cubic(a, b, c, d)
{
    if (is_strictly_equal(a, 0)) return solve_quadratic(b, c, d);
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
        return is_almost_equal(Im, 0) ? [
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
function solve_linear_linear_system(a, b, c, k, l, m)
{
    /*
    https://live.sympy.org/
    ax+by+c=0
    kx+ly+m=0
    x,y={((b*m - c*l)/(a*l - b*k), -(a*m - c*k)/(a*l - b*k))}
    */
    var D = a*l - b*k;
    // zero, infinite or one point
    return is_strictly_equal(D, 0) ? false : {x:(b*m - c*l)/D, y:(c*k - a*m)/D};
}
function solve_linear_quadratic_system(m, n, k, a, b, c, d, e, f)
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
    if (is_strictly_equal(m, 0))
    {
        y = solve_linear(n, k);
        if (!y) return false;
        y1 = y[0];
        x = solve_quadratic(a, c*y1+d, b*y1*y1+e*y1+f);
        if (!x) return false;
        return 2 === x.length ? [{x:x[0],y:y1},{x:x[1],y:y1}] : [{x:x[0],y:y1}];
    }
    else
    {
        R = 2*(a*n*n + b*m*m - c*m*n);
        if (is_strictly_equal(R, 0)) return false;
        D = -4*a*b*k*k + 4*a*e*k*n - 4*a*f*n*n + 4*b*d*k*m - 4*b*f*m*m + c*c*k*k - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d*d*n*n - 2*d*e*m*n + e*e*m*m;
        if (0 > D) return false;
        F = 2*a*k*n - c*k*m - d*m*n + e*m*m;
        if (is_strictly_equal(D, 0)) return [{x:-(k + n*(-F/R))/m, y:-F/R}];
        D = sqrt(D);
        return [{x:-(k + n*((-m*D - F)/R))/m, y:(-m*D - F)/R},{x:-(k + n*((m*D - F)/R))/m, y:(m*D - F)/R}];
    }
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
function qbezier2quadratic(c)
{
    var A = c[0].y*c[0].y - 4*c[0].y*c[1].y + 2*c[0].y*c[2].y + 4*c[1].y*c[1].y - 4*c[1].y*c[2].y + c[2].y*c[2].y,
    B = c[0].x*c[0].x - 4*c[0].x*c[1].x + 2*c[0].x*c[2].x + 4*c[1].x*c[1].x - 4*c[1].x*c[2].x + c[2].x*c[2].x,
    C = -2*c[0].x*c[0].y + 4*c[0].x*c[1].y - 2*c[0].x*c[2].y + 4*c[1].x*c[0].y - 8*c[1].x*c[1].y + 4*c[1].x*c[2].y - 2*c[2].x*c[0].y + 4*c[2].x*c[1].y - 2*c[2].x*c[2].y,
    D = 2*c[0].x*c[0].y*c[2].y - 4*c[0].x*c[1].y*c[1].y + 4*c[0].x*c[1].y*c[2].y - 2*c[0].x*c[2].y*c[2].y + 4*c[1].x*c[0].y*c[1].y - 8*c[1].x*c[0].y*c[2].y + 4*c[1].x*c[1].y*c[2].y - 2*c[2].x*c[0].y*c[0].y + 4*c[2].x*c[0].y*c[1].y + 2*c[2].x*c[0].y*c[2].y - 4*c[2].x*c[1].y*c[1].y,
    E = -2*c[0].x*c[0].x*c[2].y + 4*c[0].x*c[1].x*c[1].y + 4*c[0].x*c[1].x*c[2].y + 2*c[0].x*c[2].x*c[0].y - 8*c[0].x*c[2].x*c[1].y + 2*c[0].x*c[2].x*c[2].y - 4*c[1].x*c[1].x*c[0].y - 4*c[1].x*c[1].x*c[2].y + 4*c[1].x*c[2].x*c[0].y + 4*c[1].x*c[2].x*c[1].y - 2*c[2].x*c[2].x*c[0].y,
    F = c[0].x*c[0].x*c[2].y*c[2].y - 4*c[0].x*c[1].x*c[1].y*c[2].y - 2*c[0].x*c[2].x*c[0].y*c[2].y + 4*c[0].x*c[2].x*c[1].y*c[1].y + 4*c[1].x*c[1].x*c[0].y*c[2].y - 4*c[1].x*c[2].x*c[0].y*c[1].y + c[2].x*c[2].x*c[0].y*c[0].y;
    return [A, B, C, D, E, F];
}
function qbezier_t_quadratic(c)
{
    return [
        {
        x: c[0].x - 2*c[1].x + c[2].x,
        y: c[0].y - 2*c[1].y + c[2].y
        },
        {
        x: 2*c[1].x - 2*c[0].x,
        y: 2*c[1].y - 2*c[0].y
        },
        {
        x: c[0].x,
        y: c[0].y
        }
    ];
}
function cbezier_t_cubic(c)
{
    return [
        {
        x: -c[0].x + 3*c[1].x - 3*c[2].x + c[3].x,
        y: -c[0].y + 3*c[1].y - 3*c[2].y + c[3].y
        },
        {
        x: 3*c[0].x - 6*c[1].x + 3*c[2].x,
        y: 3*c[0].y - 6*c[1].y + 3*c[2].y
        },
        {
        x: -3*c[0].x + 3*c[1].x,
        y: -3*c[0].y + 3*c[1].y
        },
        {
        x: c[0].x,
        y: c[0].y
        }
    ];
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
function interpolate(x0, x1, t)
{
    // 0 <= t <= 1
    return x0 + t*(x1 - x0);
}
function bezier(c)
{
    // 1D bezier interpolation curve
    var order = c.length - 1,
        c0 = c[0] || 0,
        c1 = (0 < order ? c[1] : c0) || 0,
        c2 = (1 < order ? c[2] : c1) || 0,
        c3 = (2 < order ? c[3] : c2) || 0
    ;
    // 0 <= t <= 1
    return (function(c0, c1, c2, c3) {
        return 3 <= order ? function(t) {
            // only up to cubic
           var t0 = t, t1 = 1 - t, t0t0 = t0*t0, t1t1 = t1*t1;
           return t1*t1t1*c0 + 3*t1t1*t0*c1 + 3*t1*t0t0*c2 + t0t0*t0*c3;
        } : (2 === order ? function(t) {
            // quadratic
           var t0 = t, t1 = 1 - t;
           return t1*t1*c0 + 2*t1*t0*c1 + t0*t0*c2;
        } : (1 === order ? function(t) {
            // linear
            return (1 - t)*c0 + t*c1;
        } : function(t) {
            // point
            return c0;
        }));
    })(c0, c1, c2, c3);
}
/*function bezier0(t, p)
{
    // 0 <= t <= 1
    return p[0];
}*/
function bezier1(t, p)
{
    // 0 <= t <= 1
    // t*(x1 - x0) + x0
    var t0 = t, t1 = 1 - t;
    return {
        x: t1*p[0].x + t0*p[1].x,
        y: t1*p[0].y + t0*p[1].y
    };
}
function bezier2(t, p)
{
    // 0 <= t <= 1
    //return bezier1(t, [bezier1(t, [p[0], p[1]]), bezier1(t, [p[1], p[2]])]);
    // t^2*(x0 - 2*x1 + x2) + t*(2*x1 - 2*x0) + x0
   var t0 = t, t1 = 1 - t, t11 = t1*t1, t10 = 2*t1*t0, t00 = t0*t0;
   return {
       x: t11*p[0].x + t10*p[1].x + t00*p[2].x,
       y: t11*p[0].y + t10*p[1].y + t00*p[2].y
   };
}
function bezier3(t, p)
{
    // 0 <= t <= 1
    //return bezier1(t, [bezier2(t, [p[0], p[1], p[2]]), bezier2(t, [p[1], p[2], p[3]])]);
    // t^3*(-x0 + 3*x1 - 3*x2 + x3) + t^2*(3*x0 - 6*x1 + 3*x2) + t*(3*x1 - 3*x0) + x0
    var t0 = t, t1 = 1 - t,
        t0t0 = t0*t0, t1t1 = t1*t1,
        t111 = t1*t1t1, t000 = t0t0*t0,
        t110 = 3*t1t1*t0, t100 = 3*t1*t0t0;
   return {
       x: t111*p[0].x + t110*p[1].x + t100*p[2].x + t000*p[3].x,
       y: t111*p[0].y + t110*p[1].y + t100*p[2].y + t000*p[3].y
   };
}
function arc(t, cx, cy, rx, ry, cos, sin)
{
    // t is angle in radians around arc
    if (null == cos)
    {
        cos = 1;
        sin = 0;
    }
    if (null == ry) ry = rx;
    var x = rx*stdMath.cos(t), y = ry*stdMath.sin(t);
    return {
        x: cx + cos*x - sin*y,
        y: cy + sin*x + cos*y
    };
}
function toarc(x, y, cx, cy, rx, ry, cos, sin)
{
    // x, y is point on unit circle
    if (null == cos)
    {
        cos = 1;
        sin = 0;
    }
    if (null == ry) ry = rx;
    x *= rx;
    y *= ry;
    return {
        x: cx + cos*x - sin*y,
        y: cy + sin*x + cos*y
    };
}
function arc2bezier(theta, dtheta, cx, cy, rx, ry, cos, sin, reverse)
{
    if (null == cos)
    {
        cos = 1;
        sin = 0;
    }
    if (null == ry) ry = rx;
    var f = is_almost_equal(2*abs(dtheta), PI)
        ? sign(dtheta)*/*0.55228*/0.551915024494
        : stdMath.tan(dtheta/4)*4/3,
        x1 = stdMath.cos(theta),
        y1 = stdMath.sin(theta),
        x2 = stdMath.cos(theta + dtheta),
        y2 = stdMath.sin(theta + dtheta)
    ;
    return reverse ? [
    toarc(x2, y2, cx, cy, rx, ry, cos, sin),
    toarc(x2 + y2*f, y2 - x2*f, cx, cy, rx, ry, cos, sin),
    toarc(x1 - y1*f, y1 + x1*f, cx, cy, rx, ry, cos, sin),
    toarc(x1, y1, cx, cy, rx, ry, cos, sin)
    ] : [
    toarc(x1, y1, cx, cy, rx, ry, cos, sin),
    toarc(x1 - y1*f, y1 + x1*f, cx, cy, rx, ry, cos, sin),
    toarc(x2 + y2*f, y2 - x2*f, cx, cy, rx, ry, cos, sin),
    toarc(x2, y2, cx, cy, rx, ry, cos, sin)
    ];
}
function arc2ellipse(x1, y1, x2, y2, fa, fs, rx, ry, cs)
{
    // Step 1: simplify through translation/rotation
    var cos = cs[0], sin = cs[1],
        x =  cos*(x1 - x2)/2 + sin*(y1 - y2)/2,
        y = -sin*(x1 - x2)/2 + cos*(y1 - y2)/2,
        px = x*x, py = y*y, prx = rx*rx, pry = ry*ry,
        L = px/prx + py/pry;

    // correct out-of-range radii
    if (L > 1)
    {
        L = sqrt(L);
        rx *= L;
        ry *= L;
        prx = rx*rx;
        pry = ry*ry;
    }

    // Step 2 + 3: compute center
    var M = sqrt(abs((prx*pry - prx*py - pry*px)/(prx*py + pry*px)))*(fa === fs ? -1 : 1),
        _cx = M*rx*y/ry,
        _cy = -M*ry*x/rx,

        cx = cos*_cx - sin*_cy + (x1 + x2)/2,
        cy = sin*_cx + cos*_cy + (y1 + y2)/2
    ;

    // Step 4: compute θ and dθ
    var theta = vector_angle(1, 0, (x - _cx)/rx, (y - _cy)/ry),
        dtheta = vector_angle((x - _cx)/rx, (y - _cy)/ry, (-x - _cx)/rx, (-y - _cy)/ry);
    dtheta -= stdMath.floor(dtheta/TWO_PI)*TWO_PI; // % 360

    if (!fs && dtheta > 0) dtheta -= TWO_PI;
    if (fs && dtheta < 0) dtheta += TWO_PI;

    return [{x:cx, y:cy}, theta, dtheta, rx, ry];
}
function ellipse2arc(cx, cy, rx, ry, cs, theta, dtheta)
{
    return {
        p0: arc(theta, cx, cy, rx, ry, cs[0], cs[1]),
        p1: arc(theta + dtheta, cx, cy, rx, ry, cs[0], cs[1]),
        fa: abs(dtheta) > PI,
        fs: abs(dtheta) > 0
    };
}
function align_curve(points)
{
    return {Tx:-points[0].x, Ty:-points[0].y, R:-stdMath.atan2(points[points.length-1].y - points[0].y, points[points.length-1].x - points[0].x)};
}
// stdMath.hypot produces wrong results
var hypot = /*stdMath.hypot ? function hypot(dx, dy) {
    return stdMath.hypot(dx, dy);
} :*/ function hypot(dx, dy) {
    dx = abs(dx);
    dy = abs(dy)
    var r = 0;
    if (is_strictly_equal(dx, 0))
    {
        return dy;
    }
    else if (is_strictly_equal(dy, 0))
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
};
function dist(p1, p2)
{
    return hypot(p1.x - p2.x, p1.y - p2.y);
}
function dist2(p1, p2)
{
    var dx = p1.x - p2.x, dy = p1.y - p2.y;
    return dx*dx + dy*dy;
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
    var n1 = hypot(x1, y1), n2 = hypot(x2, y2);
    if (is_strictly_equal(n1, 0) || is_strictly_equal(n2, 0)) return 0;
    return stdMath.acos(clamp(dotp(x1/n1, y1/n1, x2/n2, y2/n2), -1, 1));
}
function vector_angle(ux, uy, vx, vy)
{
    return sign(crossp(ux, uy, vx, vy))*angle(ux, uy, vx, vy);
}
function polar_angle(x1, y1, x2, y2)
{
    var a = stdMath.atan2(y2 - y1, x2 - x1);
    return a < 0 ? a + TWO_PI : a;
}
function dir(p1, p2, p3)
{
    return crossp(p1.x - p3.x, p1.y - p3.y, p2.x - p3.x, p2.y - p3.y);
}
function same_dir(p1, p2, p3, p4)
{
    var a = (p1.y - p2.y)*(p3.x - p4.x),
        b = (p3.y - p4.y)*(p1.x - p2.x);
    return is_almost_equal(a, 0) || is_almost_equal(b, 0) || (sign(a) === sign(b));
}
function clamp(x, xmin, xmax)
{
    return stdMath.min(stdMath.max(x, xmin), xmax);
}
function deg(rad)
{
    return rad * 180 / PI;
}
function rad(deg)
{
    return deg * PI / 180;
}
function sign(x)
{
    return 0 > x ? -1 : 1;
}
function is_strictly_equal(a, b)
{
    return abs(a - b) < Number.EPSILON;
}
function is_almost_equal(a, b, eps)
{
    if (null == eps) eps = EPS;
    return abs(a - b) < eps;
}
function x(p)
{
    return p.x || 0;
}
function y(p)
{
    return p.y || 0;
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
function SVG(tag, atts, svg, childNodes)
{
    var setAnyway = false;
    atts = atts || EMPTY_OBJ;
    if (!isBrowser || false === svg)
    {
        svg = '<'+tag+' '+Object.keys(atts).reduce(function(s, a) {
            return s + a+'="'+Str(atts[a][0])+'" ';
        }, '')+(childNodes ? ('>'+Str(childNodes)+'</'+tag+'>') : '/>');
    }
    else
    {
        if (!svg)
        {
            setAnyway = true;
            svg = document.createElementNS('http://www.w3.org/2000/svg', tag);
            if (childNodes)
            {
                for (var i=0,n=childNodes.length; i<n; ++i)
                {
                    svg.appendChild(childNodes[i]);
                }
            }
        }
        Object.keys(atts).forEach(function(a) {
            if (setAnyway || atts[a][1]) svg.setAttribute(a, atts[a][0]);
        });
    }
    return svg;
}
function shuffle(a)
{
    for (var i=a.length-1,j,aj; i>0; --i)
    {
        j = stdMath.round(stdMath.random()*i);
        aj = a[j];
        a[j] = a[i];
        a[i] = aj;
    }
    return a;
}
/*function debounce(func, wait, immediate)
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
}*/
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
function equal(a, b)
{
    return a === b;
}
var TRIM_RE = /^\s+|\s+$/gm;
var trim = String.prototype.trim ? function trim(s) {
    return s.trim()
} : function trim() {
    return s.replace(TRIM_RE, '');
};
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
function signed(x, add)
{
    return 0 > x ? Str(x) : ((false === add ? '' : '+') + Str(x));
}
var cnt = 0, Str = String;
function uuid(ns)
{
    return Str(ns||'')+'_'+Str(++cnt)+'_'+Str(new Date().getTime())+'_'+Str(stdMath.round(1000*stdMath.random()));
}
function Num(x)
{
    return parseFloat(x) || 0;
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

Geometrize.Math.deg = deg;
Geometrize.Math.rad = rad;
Geometrize.Math.hypot = hypot;
Geometrize.Math.solveLinear = solve_linear;
Geometrize.Math.solveQuadratic = solve_quadratic;
Geometrize.Math.solveCubic = solve_cubic;
Geometrize.Math.solveLinearLinear = solve_linear_linear_system;
Geometrize.Math.solveLinearQuadratic = solve_linear_quadratic_system;
Geometrize.Math.shuffle = shuffle;
Geometrize.Geometry.linearBezierCurve = bezier1;
Geometrize.Geometry.quadraticBezierCurve = bezier2;
Geometrize.Geometry.cubicBezierCurve = bezier3;
Geometrize.Geometry.ellipticArcCurve = arc;
Geometrize.Geometry.computeConvexHull = function(points) {
    return convex_hull(points).map(Point);
};
// export it
return Geometrize;
});
