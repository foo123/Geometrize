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
var MZ = /[MZ]/g,
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
        var self = this;
        if (!self.isConnected()) return false;
        var c = self.curves;
        return c[0].points[0].eq(c[c.length-1].points[c[c.length-1].points.length-1]);
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
        var self = this, path = self.curves.map(function(c) {return c.toSVGPath();}).join(' ');/*,
            x0 = 0, y0 = 0, mz = path.match(MZ), p = path.split(MZ);
        path = mz.reduce(function(path, command, i) {
            var pp, m1, m2, x, y, px, py;
            switch (command)
            {
                case 'M':
                pp = p[i+1] || '';
                m1 = pp.match(XY);
                x = parseFloat(m1[1]) || 0;
                y = parseFloat(m1[2]) || 0;
                x0 = x;
                y0 = y;
                m2 = (p[i] || '').match(PXY);
                if (m2)
                {
                    px = parseFloat(m2[1]) || 0;
                    py = parseFloat(m2[2]) || 0;
                    if (is_strictly_equal(x, px) && is_strictly_equal(y, py))
                    {
                        pp = pp.slice(m1[0].length);
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
                case 'Z':
                break;
                default:
                break;
            }
            return path;
        }, p[0] || '');*/
        if (self.isClosed()) path += ' Z';
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
        this.curves.forEach(function(c) {
            c.toCanvasPath(ctx);
        });
    },
    toTex: function() {
        return '\\text{CompositeCurve: }\\begin{cases}&'+this.curves.map(Tex).join('\\\\&')+'\\end{cases}';
    },
    toString: function() {
        return 'CompositeCurve('+"\n"+this.curves.map(Str).join("\n")+"\n"+')';
    }
});
Geometrize.CompositeCurve = CompositeCurve;
