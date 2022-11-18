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
    stdMath = Math,
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

// Event Emitter interface
var EventEmitter = makeClass(null, {
    $dirty: false,
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
    $cb: null,
    $pb: null,
    dispose: function() {
        this.$cb = null;
        this.$pb = null;
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
                    self.$pb = function() {
                        self.$cb.forEach(function(cb) {cb(self);});
                    };

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

// 2D Primitive Style class
// eg stroke, fill, width, ..
var Style = makeClass(EventEmitter, {
    constructor: function Style(style) {
        var self = this, _props = null, _style = null;
        if (style instanceof Style) return style;
        if (!(self instanceof Style)) return new Style(style);
        _props = ['stroke', 'fill', 'width'];
        // defaults
        _style = {
            stroke: '#000000',
            fill: 'transparent',
            width: 1
        };
        if (is_object(style))
        {
            _style = merge(_props, _style, style);
        }
        _props.forEach(function(p) {
            Object.defineProperty(self, p, {
                get() {
                    return _style[p];
                },
                set(val) {
                    if (_style[p] !== val)
                    {
                        _style[p] = val;
                        if (!self.isDirty())
                        {
                            self.isDirty(true);
                            self.triggerChange();
                        }
                    }
                }
            });
        });
        self.isDirty(true);
    },
    dispose: function() {
        this.$super.dispose.call(this);
    },
    clone: function() {
        return new Style({
            stroke: this.stroke,
            fill: this.fill,
            width: this.width,
        });
    }
});

// 2D Transformation Matrix class
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
            self.$00 = Num(m00);
            self.$01 = Num(m01);
            self.$02 = Num(m02);
            self.$10 = Num(m10);
            self.$11 = Num(m11);
            self.$12 = Num(m12);
            self.$20 = 0;
            self.$21 = 0;
            self.$22 = 1;
        }
    },
    $00: 1
    $01: 0,
    $02: 0,
    $10: 0,
    $11: 1,
    $12: 0,
    $20: 0,
    $21: 0,
    $22: 1,
    clone: function() {
        return new Matrix(
        this.$00, this.$01, this.$02,
        this.$10, this.$11, this.$12,
        this.$20, this.$21, this.$22
        );
    },
    add: function (other) {
        var self = this;
        other = other instanceof Matrix ? other : Num(other);
        return other instanceof Matrix ? new Matrix(
            self.$00 + other.$00,
            self.$01 + other.$01,
            self.$02 + other.$02,
            self.$10 + other.$10,
            self.$11 + other.$11,
            self.$12 + other.$12,
            0,
            0,
            1
        ) : new Matrix(
            self.$00 + other,
            self.$01 + other,
            self.$02 + other,
            self.$10 + other,
            self.$11 + other,
            self.$12 + other,
            0,
            0,
            1
        );
    },
    mul: function (other) {
        var self = this;
        other = other instanceof Matrix ? other : Num(other);
        return other instanceof Matrix ? new Matrix(
            self.$00*other.$00 + self.$01*other.$10 + self.$02*other.$20,
            self.$00*other.$01 + self.$01*other.$11 + self.$02*other.$21,
            self.$00*other.$02 + self.$01*other.$12 + self.$02*other.$22,
            self.$10*other.$00 + self.$11*other.$10 + self.$12*other.$20,
            self.$10*other.$01 + self.$11*other.$11 + self.$12*other.$21,
            self.$10*other.$02 + self.$11*other.$12 + self.$12*other.$22,
            0,
            0,
            1
        ) : new Matrix(
            self.$00*other,
            self.$01*other,
            self.$02*other,
            self.$10*other,
            self.$11*other,
            self.$12*other,
            0,
            0,
            1
        );
    },
    transform: function(point) {
        var x = point.x, y = point.y;
        return new Point(
            this.$00*x + this.$01*y + this.$02,
            this.$10*x + this.$11*y + this.$12
        );
    },
    toArray: function() {
        return [
        this.$00, this.$01, this.$02,
        this.$10, this.$11, this.$12,
        this.$20, this.$21, this.$22
        ];
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
        return new Matrix(
        stdMath.cos(theta),-stdMath.sin(theta),0,
        stdMath.sin(theta),stdMath.cos(theta),0,
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
    }
    pointTex: function(point) {
        return '\\begin{pmatrix}'+Str(point.x)+'\\\\'+Str(point.y)+'\\\\1\\end{pmatrix}';
    },
    pointString: function(point) {
        var maxlen = [point.x, point.y].reduce(function(maxlen, s) {
            return stdMath.max(maxlen, Str(s).length);
        }, 0);
        return '['+pad(point.x, maxlen)+"]\n["+pad(point.y, maxlen)+"]\n["+pad(1, maxlen)+']';
    }
});

// 2D Geometric Primitive base class
var Primitive = makeClass(EventEmitter, {
    constructor: function() {
        var _matrix = null,
            _style = null,
            _dom = null,
            onStyleChange
        ;

        _matrix = Matrix.eye();
        Object.defineProperty(this, 'matrix', {
            get() {
                return _matrix;
            },
            set(matrix) {
                matrix = Matrix(matrix);
                if (_matrix !== matrix)
                {
                    _matrix = matrix;
                    if (!self.isDirty())
                    {
                        self.isDirty(true);
                        self.triggerChange();
                    }
                }
            }
        });

        onStyleChange = function onStyleChange(style) {
            if (_style === style)
            {
                self.isDirty(true);
                self.triggerChange();
            }
        };
        _style = new Style();
        _style.onChange(onStyleChange);
        Object.defineProperty(this, 'style', {
            get() {
                return _style;
            },
            set(style) {
                style = Style(style);
                if (_style !== style)
                {
                    if (_style) _style.onChange(onStyleChange, false);
                    _style = style;
                    if (_style) _style.onChange(onStyleChange);
                    if (!self.isDirty())
                    {
                        self.isDirty(true);
                        self.triggerChange();
                    }
                }
            }
        });

        /*Object.defineProperty(this, 'dom', {
            get() {
                return _dom;
            },
            set(dom) {
                _dom = dom;
            }
        });*/
    },
    dispose: function() {
        this.$super.dispose.call(this);
    },
    clone: function() {}
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
        Primitive.call(self);
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
        Object.defineProperty(self, 'x', {
            get() {
                return _x;
            },
            set(x) {
                x = Num(x);
                if (_x !== x)
                {
                    _x = x;
                    if (!self.isDirty())
                    {
                        self.isDirty(true);
                        self.triggerChange();
                    }
                }
            }
        });
        Object.defineProperty(self, 'y', {
            get() {
                return _y;
            },
            set(y) {
                y = Num(y);
                if (_y !== y)
                {
                    _y = y;
                    if (!self.isDirty())
                    {
                        self.isDirty(true);
                        self.triggerChange();
                    }
                }
            }
        });
        self.dispose = function() {
            _x = null;
            _y = null;
            self.$super.dispose.call(self);
        };
        self.isDirty(true);
    },
    clone: function() {
        return new Point(this.x, this.y);
    },
    transform: function(matrix) {
        return matrix.transform(this);
    },
    isEqual: function(other) {
        if (other instanceof Point)
        {
            return is_almost_equal(this.x, other.x) && is_almost_equal(this.y, other.y);
        }
        return false;
    },
    add: function(other) {
        return other instanceof Point ? new Point(this.x+other.x, this.y+other.y) : new Point(this.x+other,this.y+other);
    },
    mul: function(other) {
        return new Point(this.x*other,this.y*other);
    },
    dot: function(other) {
        return dotp(this.x, this.y, other.x, other.y);
    },
    cross: function(other) {
        return crossp(this.x, this.y, other.x, other.y);
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
    },
    toTex: function() {
        return '\begin{pmatrix}'+Str(this.x)+'\\\\'+Str(this.y)+'\end{pmatrix}';
    },
    toString: function() {
        return 'Point('+Str(this.x)+','+Str(this.y)+')';
    }
});

// 2D Line segment class
var Line = makeClass(Primitive, {
    constructor: function Line(start, end) {
        var self = this, _start = null, _end = null,
            _length = null, onPointChange;
        if (start instanceof Line) return start;
        if (!(self instanceof Line)) return new Line(start, end);
        Primitive.call(self);
        onPointChange = function onPointChange(point) {
            if (_start === point || _end === point)
            {
                if (!self.isDirty())
                {
                    self.isDirty(true);
                    self.triggerChange();
                }
            }
        };
        _start = Point(start);
        _end = Point(end);
        _start.onChange(onPointChange);
        _end.onChange(onPointChange);
        Object.defineProperty(self, 'start', {
            get() {
                return _start;
            },
            set(start) {
                start = Point(start);
                if (_start !== start)
                {
                    var isDirty = false;
                    _start.onChange(onPointChange, false);
                    start.onChange(onPointChange);
                    if (!_start.isEqual(start))
                    {
                        isDirty = true;
                    }
                    _start = start;
                    if (isDirty)
                    {
                        if (!self.isDirty())
                        {
                            self.isDirty(true);
                            self.triggerChange();
                        }
                    }
                }
            },
            enumerable: true
        });
        Object.defineProperty(self, 'end', {
            get() {
                return _end;
            },
            set(end) {
                end = Point(end);
                if (_end !== end)
                {
                    var isDirty = false;
                    _end.onChange(onPointChange, false);
                    end.onChange(onPointChange);
                    if (!_end.isEqual(end))
                    {
                        isDirty = true;
                    }
                    _end = end;
                    if (isDirty)
                    {
                        if (!self.isDirty())
                        {
                            self.isDirty(true);
                            self.triggerChange();
                        }
                    }
                }
            },
            enumerable: true
        });
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    _length = dist(_start, _end);
                }
                return _length;
            },
            enumerable: true
        });
        self.isDirty = function(isDirty) {
            if (false === isDirty)
            {
                _start.isDirty(false);
                _end.isDirty(false);
            }
            else if (true === isDirty)
            {
                _length = null;
            }
            return self.$super.isDirty.apply(self, arguments);
        };
        self.dispose = function() {
            if (_start)
            {
                _start.onChange(onPointChange, false);
                _start = null;
            }
            if (_end)
            {
                _end.onChange(onPointChange, false);
                _end = null;
            }
            self.$super.dispose.call(self);
        };
        self.isDirty(true);
    },
    clone: function() {
        return new Line(this.start.clone(), this.end.clone());
    },
    transform: function(matrix) {
        return new Line(this.start.transform(matrix), this.end.transform(matrix));
    },
    getPoint: function(t) {
        t = Num(t);
        if (0 > t || 1 < t) return null;
        var p0 = this.start, p1 = this.end;
        return new Point(
            p0.x*(1-t) + p1.x*t,
            p0.y*(1-t) + p1.y*t
        );
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
        else if ((other instanceof Primitive) && is_function(other.intersects))
        {
            return other.intersects(this);
        }
        return false;
    },
    toTex: function() {
        return Tex(this.start) + ' \\cdot (1-t) + ' + Tex(this.end) + ' \\cdot t';
    },
    toString: function() {
        return 'Line('+[Str(this.start), Str(this.end)].join(',')+')';
    }
});

// 2D Polyline class
// assembly of consecutive line segments between given points
var Polyline = makeClass(Primitive, {
    constructor: function Polyline(points) {
        var self = this, _points = null, _length = null,
            onPointChange, onArrayChange;
        if (points instanceof Polyline) return points;
        if (!(self instanceof Polyline)) return new Polyline(points);
        Primitive.call(self);
        if (!is_array(points)) points = [points];
        onPointChange = function onPointChange(point) {
            if (_points && (-1 !== _points.indexOf(point)))
            {
                if (!self.isDirty())
                {
                    self.isDirty(true);
                    self.triggerChange();
                }
            }
        };
        onArrayChange = function onArrayChange(changed) {
            if (!self.isDirty())
            {
                self.isDirty(true);
                self.triggerChange();
            }
        };
        _points = observeArray(points.map(Point), Point, function(a, b) {return a.isEqual(b);});
        _points.forEach(function(point) {point.onChange(onPointChange);});
        _points.onChange(onArrayChange);
        Object.defineProperty(self, 'points', {
            get() {
                return _points;
            },
            set(points) {
                if (!is_array(points)) points = [points];
                if (_points !== points)
                {
                    _points.$unobserve();
                    _points.forEach(function(point) {point.onChange(onPointChange, false);});
                    _points = observeArray(points.map(Point), Point, function(a, b) {return a.isEqual(b);});
                    _points.forEach(function(point) {point.onChange(onPointChange);});
                    _points.onChange(onArrayChange);
                    if (!self.isDirty())
                    {
                        self.isDirty(true);
                        self.triggerChange();
                    }
                }
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
            },
            enumerable: true
        });
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    _length = 0;
                    for (var i=0,n=_points.length; i+1<n; ++i)
                    {
                        _length += dist(_points[i], _points[i+1]);
                    }
                }
                return _length;
            },
            enumerable: true
        });
        self.isDirty = function(isDirty) {
            if (false === isDirty)
            {
                _points.forEach(function(point) {point.isDirty(false);});
            }
            else if (true === isDirty)
            {
                _length = null;
            }
            return self.$super.isDirty.apply(self, arguments);
        };
        self.dispose = function() {
            if (_points)
            {
                _points.$unobserve();
                _points.forEach(function(point) {point.onChange(onPointChange, false);});
                _points = null;
            }
            self.$super.dispose.call(self);
        };
        self.isDirty(true);
    },
    clone: function() {
        return new Polyline(this.points.map(function(point) {return point.clone();}));
    },
    transform: function(matrix) {
        return new Polyline(this.points.map(function(point) {return point.transform(matrix);}));
    },
    getPoint: function(t) {
        var lines = this.lines, n = lines.length, i;
        t = Num(t);
        if (0 > t || 1 < t || 0 >= n) return null;
        // 0-1/n, 1/n-2/n,..,(n-1)/n,n/n
        i = stdMath.floor(n * t);
        return lines[i].getPoint(n*(t-i/n));
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
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? other : false;
        }
        else if (other instanceof Line)
        {
            var i = this.lines.reduce(function(i, line) {
                var p;
                if (p=line.intersects(other))
                    i.push(p);
                return i;
            }, []);
            return i.length ? i : false;
        }
        else if (other instanceof Polyline)
        {
            var i = [], n, m, p,
                l1 = this.lines, l2 = other.lines;
            for (n=0; n<l1.length; ++n)
            {
                for (m=0; m<l2.length; ++m)
                {
                    if (p = l1[n].intersects(l2[m]))
                        i.push(p);
                }
            }
            return i.length ? i : false;
        }
        else if ((other instanceof Primitive) && is_function(other.intersects))
        {
            return other.intersects(this);
        }
        return false;
    },
    toTex: function() {
        return '\\left\\{'+this.lines.map(Tex).join('\\\\')+'\\right\\\\';
    },
    toString: function() {
        return 'Polyline('+this.points.map(Str).join(',')+')';
    }
});

// 2D Polygon class
// defined by vertices as a closed polyline
var Polygon = makeClass(Primitive, {
    constructor: function Polygon(vertices) {
        var self = this, _vertices = null,
            _length = null, _area = null,
            onPointChange, onArrayChange;
        if (vertices instanceof Polygon) return vertices;
        if (!(self instanceof Polygon)) return new Polygon(vertices);
        Primitive.call(self);
        if (!is_array(vertices)) vertices = [vertices];
        onPointChange = function onPointChange(point) {
            if (_vertices && (-1 !== _vertices.indexOf(point)))
            {
                if (!self.isDirty())
                {
                    self.isDirty(true);
                    self.triggerChange();
                }
            }
        };
        onArrayChange = function onArrayChange(changed) {
            if (!self.isDirty())
            {
                self.isDirty(true);
                self.triggerChange();
            }
        };
        _vertices = observeArray(vertices.map(Point), Point, function(a, b) {return a.isEqual(b);});
        _vertices.forEach(function(point) {point.onChange(onPointChange);});
        _vertices.onChange(onArrayChange);
        Object.defineProperty(self, 'vertices', {
            get() {
                return _vertices;
            },
            set(vertices) {
                if (!is_array(vertices)) vertices = [vertices];
                if (_vertices !== vertices)
                {
                    _vertices.$unobserve();
                    _vertices.forEach(function(point) {point.onChange(onPointChange, false);});
                    _vertices = observeArray(vertices.map(Point), Point, function(a, b) {return a.isEqual(b);});
                    _vertices.forEach(function(point) {point.onChange(onPointChange);});
                    _vertices.onChange(onArrayChange);
                    if (!self.isDirty())
                    {
                        self.isDirty(true);
                        self.triggerChange();
                    }
                }
            }
        });
        Object.defineProperty(self, 'edges', {
            get() {
                return 1 < _vertices.length ? _vertices.map(function(vertex, i) {
                    return new Line(vertex, _vertices[(i+1) % _vertices.length]);
                }) : [];
            },
            enumerable: true
        });
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    _length = 0;
                    for (var i=0,n=_vertices.length; i<n; ++i)
                    {
                        _length += dist(_vertices[i], _vertices[(i+1) % n]);
                    }
                }
                return _length;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'area', {
            get() {
                if (null == _area)
                {
                    _area = 0;
                    for (var i=0,n=_vertices.length; i<n; ++i)
                    {
                        // shoelace formula
                        _area += _vertices[i].cross(_vertices[(i+1) % n]) / 2;
                    }
                }
                return _area;
            },
            enumerable: true
        });
        self.isDirty = function(isDirty) {
            if (false === isDirty)
            {
                _vertices.forEach(function(vertex) {vertex.isDirty(false);});
            }
            else if (true === isDirty)
            {
                _length = null;
                _area = null;
            }
            return self.$super.isDirty.apply(self, arguments);
        };
        self.dispose = function() {
            if (_vertices)
            {
                _vertices.$unobserve();
                _vertices.forEach(function(vertex) {vertex.onChange(onPointChange, false);});
                _vertices = null;
            }
            self.$super.dispose.call(self);
        };
        self.isDirty(true);
    },
    clone: function() {
        return new Polygon(this.vertices.map(function(vertex) {return vertex.clone();}));
    },
    transform: function(matrix) {
        return new Polygon(this.vertices.map(function(vertex) {return vertex.transform(matrix);}));
    },
    toTex: function() {
        return '\left( ' + this.vertices.map(Tex).join(',') + ' \right)';
    },
    toString: function() {
        return 'Polygon('+this.vertices.map(Str).join(',')+')';
    }
});
// 2D Circle class
var Circle = makeClass(Primitive, {
    constructor: function Circle(center, radius) {
        var self = this,
            _center = null,
            _radius = null,
            _length = null,
            _area = null,
            onPointChange;
        if (center instanceof Circle) return center;
        if (!(self instanceof Circle)) return new Circle(center, radius);
        Primitive.call(self);
        onPointChange = function onPointChange(point) {
            if (_center === point)
            {
                if (!self.isDirty())
                {
                    self.isDirty(true);
                    self.triggerChange();
                }
            }
        };
        _center = Point(center);
        _radius = stdMath.abs(Num(radius));
        _center.onChange(onPointChange);
        Object.defineProperty(self, 'center', {
            get() {
                return _center;
            },
            set(center) {
                center = Point(center);
                if (_center !== center)
                {
                    var isDirty = false;
                    _center.onChange(onPointChange, false);
                    center.onChange(onPointChange);
                    if (!_center.isEqual(center))
                    {
                        isDirty = true;
                    }
                    _center = center;
                    if (isDirty)
                    {
                        if (!self.isDirty())
                        {
                            self.isDirty(true);
                            self.triggerChange();
                        }
                    }
                }
            },
            enumerable: true
        });
        Object.defineProperty(self, 'radius', {
            get() {
                return _radius;
            },
            set(radius) {
                radius = stdMath.abs(Num(radius));
                if (_radius !== radius)
                {
                    var isDirty = false;
                    if (!is_almost_equal(_radius, radius))
                    {
                        isDirty = true;
                    }
                    _radius = radius;
                    if (isDirty)
                    {
                        if (!self.isDirty())
                        {
                            self.isDirty(true);
                            self.triggerChange();
                        }
                    }
                }
            },
            enumerable: true
        });
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    _length = 2 * stdMath.PI * _radius;
                }
                return _length;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'area', {
            get() {
                if (null == _area)
                {
                    _area = stdMath.PI * _radius * _radius;
                }
                return _area;
            },
            enumerable: true
        });
        self.isDirty = function(isDirty) {
            if (false === isDirty)
            {
                _center.isDirty(false);
            }
            else if (true === isDirty)
            {
                _length = null;
                _area = null;
            }
            return self.$super.isDirty.apply(self, arguments);
        };
        self.dispose = function() {
            if (_center)
            {
                _center.onChange(onPointChange, false);
                _center = null;
                _radius = null;
            }
            self.$super.dispose.call(self);
        };
        self.isDirty(true);
    },
    clone: function() {
        return new Circle(this.center.clone(), this.radius);
    },
    transform: function(matrix) {
        var c = this.center,
            r = this.radius,
            p = new Point(c.x+r, c.y),
            ct = c.transform(matrix),
            pt = p.transform(matrix)
        ;
        return new Circle(ct, dist(ct, pt));
    },
    getPoint: function(t) {
        t = Num(t);
        if (0 > t || 1 < t) return null;
        var c = this.center, r = this.radius;
        return new Point(
            c.x + r*stdMath.cos(t*2*stdMath.PI),
            c.y + r*stdMath.sin(t*2*stdMath.PI)
        );
    },
    hasPoint: function(point) {
        var center = this.center, radius = this.radius,
            dx = point.x - center.x, dy = point.y - center.y;
        return is_almost_equal(dx*dx + dy*dy, r*r);
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? other : false;
        }
        else if (other instanceof Line)
        {
            return line_circle_intersection(other.start, other.end, this.center, this.radius);
        }
        else if (other instanceof Polyline)
        {
        }
        else if (other instanceof Circle)
        {
            return circle_circle_intersection(other.center, other.radius, this.center, this.radius);
        }
        else if ((other instanceof Primitive) && is_function(other.intersects))
        {
            return other.intersects(this);
        }
        return false;
    },
    toTex: function() {
        return '(x - '+Str(this.center.x)+')^2 + (y - '+Str(this.center.y)+')^2 = '+Str(this.radius)+'^2';
    },
    toString: function() {
        return 'Circle('+[Str(this.center), Str(this.radius)].join(',')+')';
    }
});

// ---- utilities -----
function Num(x)
{
    return (+x) || 0;
}
function Tex(o)
{
    return is_function(o.toTex) ? o.toTex() : o.toString();
}
function Str(o)
{
    return String(o);
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
function sort_asc(a, b)
{
    return a - b;
}
function sort_asc0(a, b)
{
    return a[0] - b[0];
}
function is_almost_zero(x)
{
    return stdMath.abs(x) < Number.EPSILON;
}
function is_almost_equal(a, b)
{
    return is_almost_zero(a-b);
}
function dotp(x1, y1, x2, y2)
{
    return x1*x2 + y1*y2;
}
function crossp(x1, y1, x2, y2)
{
    return x1*y2 - y1*x2;
}
function dist(p1, p2)
{
    var dx = p1.x - p2.x, dy = p1.y - p2.y;
    return stdMath.sqrt(dx*dx + dy*dy);
}
function polar_angle(p1, p2)
{
    var a = stdMath.atan2(p2.y - p1.y, p2.x - p1.x);
    return a < 0 ? a + 2*stdMath.PI : a;
}
function dir(p1, p2, p3)
{
    var dx1 = p1.x-p3.x, dx2 = p2.x-p3.x,
        dy1 = p1.y-p3.y, dy2 = p2.y-p3.y;
    return dx1*dy2 - dy1*dx2;
}
function point_line_distance(p0, p1, p2)
{
    // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    var dx = p2.x - p1.x, dy = p2.y - p1.y;
    return stdMath.abs(dx*(p1.y-p0.y) - dy*(p1.x-p0.x)) / stdMath.sqrt(dx*dx + dy*dy);
}
function points_colinear(p0, p1, p2)
{
    if (is_almost_equal(p2.x, p1.x))
    {
        // vertical
        return is_almost_equal(p0.x, p1.x) && (p0.y >= stdMath.min(p1.y, p2.y)) && (p0.y <= stdMath.max(p1.y, p2.y)) ? p0 : false;
    }
    else if (is_almost_equal(p0.x, p1.x))
    {
        return is_almost_equal(p0.y, p1.y) ? p0 : false;
    }
    else
    {
        return is_almost_zero((p2.y - p1.y) / (p2.x-p1.x) - (p0.y - p1.y) / (p0.x - p1.x)) ? p0 : false;
    }
}
function line_line_intersection(p1, p2, p3, p4)
{
    // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
    var den = (p1.x-p2.x)*(p3.y-p4.y) - (p1.y-p2.y)*(p3.x-p4.x), pi;
    if (is_almost_zero(den)) return false;
    pi = new Point(
        ((p1.x*p2.y-p1.y*p2.x)*(p3.x-p4.x) - (p1.x-p2.x)*(p3.x*p4.y-p3.y*p4.x)) / den,
        ((p1.x*p2.y-p1.y*p2.x)*(p3.y-p4.y) - (p1.y-p2.y)*(p3.x*p4.y-p3.y*p4.x)) / den
    );
    return pi.isOnline(p1, p2) && pi.isOnLine(p3, p4) ? pi : false;
}
function quadratic_roots(a, b, c)
{
    var d = b*b - 4*a*c;
    if (is_almost_zero(d))
    {
         return [(-b)/(2*a)];
    }
    else if (0 < d)
    {
        d = stdMath.sqrt(d);
        return [(-b+d)/(2*a), (-b-d)/(2*a)];
    }
    return [];
}
function line_circle_intersection(p1, p2, c, r)
{
    // y-y1/x-x1 = y2-y1/x2-x1 => y = dy/dx(x-x1)+y1=x*dy/dx+y1-x1dy/dx
    // ==> y = mx + b
    // (x-x0)^2+(y-y0)^2=r^2, y=mx+b
    // (x-x0)^2+(mx+b-y0)^2=r^2
    // x2+x02-2xx0+m2x2+b2+y02+2mxb-2mxy0-2by0=r2
    // (1+m2)x2+(-2x0+2mb-2my0)x+r2+x02+b2+y02-2by0
    var sol = quadratic_roots();
}
function circle_circle_intersection(c1, r2, c2, r2)
{
}
function convex_hull(points)
{
    // https://en.wikipedia.org/wiki/Convex_hull
    // https://en.wikipedia.org/wiki/Convex_hull_algorithms
    // https://en.wikipedia.org/wiki/Graham_scan
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
function observeArray(array, typecaster, equals)
{
    if (is_function(array.$unobserve)) return array;

    var notify = function(changed) {
        array.$cb.forEach(function(cb) {cb(changed);});
    };

    var doNotifyItems = true;

    equals = equals || function(a, b) {return a === b;};

    var methodInterceptor = function() {
        var interceptor = function(method) {
            return function() {
                var args = arguments, result = null,
                    index = 0,
                    initialLength = array.length,
                    finalLength = 0;

                if (typecaster)
                {
                    if ('push' === method || 'unshift' === method)
                    {
                        args = Array.prototype.map.apply(args, typecaster);
                    }
                    if ('splice' === method && 2 < args.length)
                    {
                        args = Array.prototype.slice.call(args, 0, 2).concat(Array.prototype.slice.call(args, 2).map(typecaster));
                    }
                }

                if ('unshift' === method || 'splice' === method)
                {
                    // avoid superfluous notifications
                    doNotifyItems = false;
                }
                result = Array.prototype[method].apply(array, args);
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
                    notify({target:array, method:method, from:initialLength, to:finalLength});
                }
                else if ('unshift' === method)
                {
                    notify({target:array, method:method, from:0, to:finalLength-initialLength-1});
                }
                else if ('splice' === method && 2 < args.length)
                {
                    notify({target:array, method:method, from:args[0], to:args[0]+args.length-3});
                }
                else
                {
                    notify({target:array, method:method});
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
            var key = String(index), val = array[index];
            Object.defineProperty(array, key, {
                get() {
                    return val;
                },
                set(value) {
                    if (typecaster) value = typecaster(value);
                    var doNotify = !equals(val, value);
                    val = value;
                    if (doNotify && doNotifyItems)
                    {
                        notify({target:array, method:'set', from:index, to:index});
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

    methodInterceptor();

    itemInterceptor(0, array.length);

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

    array.$unobserve = function() {
        delete array.$unobserve;

        delete array.$cb;
        delete array.onChange;

        ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(function(method) {
            array[method] = Array.prototype[method];
        });

        var values = array.slice();
        array.length = 0;
        array.push.apply(array, values);
    };

    return array;
}


// export it
return {
    VERSION: "0.1.0",
    Style: Style,
    Matrix: Matrix,
    Primitive: Primitive,
    Point: Point,
    Line: Line,
    Polyline: Polyline,
    Polygon: Polygon,
    Circle: Circle,
    Bezier1: Line,
    Bezier2: Bezier2,
    Bezier3: Bezier3
};
});
