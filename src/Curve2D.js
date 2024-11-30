/**[DOC_MD]
 * ### Curve2D (subclass of Topos2D)
 *
 * Represents a generic curve in 2D space
 * (not used directly)
 *
[/DOC_MD]**/
var Curve2D = makeClass(Topos2D, {
    constructor: function Curve2D(points, values) {
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
        _matrix = self.hasMatrix() ? Matrix2D.eye() : null;
        _values.matrix = new Value(0);
        _values.matrix.isChanged(self.hasMatrix());

/**[DOC_MD]
 * **Properties:**
 *
[/DOC_MD]**/
        def(self, 'matrix', {
            get: function() {
                return _matrix ? _matrix : Matrix2D.eye();
            },
            set: function(matrix) {
                if (self.hasMatrix())
                {
                    matrix = Matrix2D(matrix);
                    var isChanged = !matrix.eq(_matrix);
                    _matrix = matrix;
                    if (isChanged /*&& !self.isChanged()*/)
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
                    _lines = sample_curve(self.f.bind(self), NUM_POINTS, PIXEL_SIZE, true, true);
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
/**[DOC_MD]
 * * `length: Number` the length of the curve
[/DOC_MD]**/
        def(self, 'length', {
            get: function() {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
/**[DOC_MD]
 * * `area: Number` the area enclosed by the curve
[/DOC_MD]**/
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
                        new Point2D(bb.xmin, bb.ymin),
                        new Point2D(bb.xmax, bb.ymin),
                        new Point2D(bb.xmax, bb.ymax),
                        new Point2D(bb.xmin, bb.ymax)
                    ];
                }
                return _hull;
            },
            enumerable: false,
            configurable: true
        });
    },
    name: 'Curve2D',
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
    hasMatrix: function() {
        return true;
    },
/**[DOC_MD]
 * **Methods:**
 *
[/DOC_MD]**/
/**[DOC_MD]
 * * `isConnected(): Bool` true if curve is a connected curve (eg a line)
[/DOC_MD]**/
    isConnected: function() {
        return true;
    },
/**[DOC_MD]
 * * `isClosed(): Bool` true if curve is a closed curve (eg a circle)
[/DOC_MD]**/
    isClosed: function() {
        return false;
    },
/**[DOC_MD]
 * * `isConvex(): Bool` true if curve is convex (eg a convex polygon)
[/DOC_MD]**/
    isConvex: function() {
        return false;
    },
    f: function(t) {
        // override
        return {x:0, y:0};
    },
    fto: function(t) {
        // override
        return self;
    },
    d: function() {
        // override
        return this.clone();
    },
/**[DOC_MD]
 * * `getPointAt(t: Number): Point2D` get point on curve at position specified by parameter `t (0 <= t <= 1)`
[/DOC_MD]**/
    getPointAt: function(t) {
        // 0 <= t <= 1
        t = Num(t);
        if (0 > t || 1 < t) return null;
        var p = this.f(t);
        return null == p ? null : Point2D(p);
    },
/**[DOC_MD]
 * * `curveUpTo(t: Number): Curve2D` get curve up to point specified by parameter `t (0 <= t <= 1)`
[/DOC_MD]**/
    curveUpTo: function(t) {
        var self = this;
        // 0 <= t <= 1
        t = clamp(Num(t), 0, 1);
        return is_almost_equal(t, 1) ? self : self.fto(t).setMatrix(self.matrix).setStyle(self.style.toObj());
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
/**[DOC_MD]
 * * `derivative(): Curve2D` get derivative of curve as curve
[/DOC_MD]**/
    derivative: function() {
        var self = this, d = self.d();
        if (self.hasMatrix()) d.setMatrix(self.matrix.clone());
        d.setStyle(self.style.toObj());
        return d;
    },
/**[DOC_MD]
 * * `polylinePoints(): Object{x,y}[]` get points of polyline that approximates the curve
[/DOC_MD]**/
    polylinePoints: function() {
        return this._lines.slice();
    },
/**[DOC_MD]
 * * `bezierPoints(t: Number = 1): Object{x,y}[]` get points of cubic bezier curves that approximate the curve (optionally up to point specified by parameter `t`)
[/DOC_MD]**/
    bezierPoints: function(t) {
        return [
        {x:0, y:0},
        {x:0, y:0},
        {x:0, y:0},
        {x:0, y:0}
        ];
    }
});
Geometrize.Curve2D = Curve2D;

/**[DOC_MD]
 * ### Bezier2D (subclass of Curve2D)
 *
 * Represents a generic Bezier curve in 2D space
 * (not used directly)
 *
[/DOC_MD]**/
var Bezier2D = makeClass(Curve2D, {
    constructor: function Bezier2D(points, values) {
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
    name: 'Bezier2D',
    transform: function(matrix, withSelfMatrix) {
        var self = this, bezier = self.constructor,
            points = true === withSelfMatrix ? self._points : self.points;
        return new bezier(points.map(object_transform(matrix)));
    },
    fto: function(t) {
        var self = this;
        return new self.constructor(de_casteljau(t, self.points, true).points);
    },
    d: function() {
        var self = this, p = self.points, n = p.length - 1, d;
        if (Geometrize.Line && (self instanceof Geometrize.Line))
        {
            // point
            d = new Geometrize.Line([{x:n*(p[1].x - p[0].x), y:n*(p[1].y - p[0].y)}, {x:n*(p[1].x - p[0].x), y:n*(p[1].y - p[0].y)}]);
        }
        else if (Geometrize.QBezier && (self instanceof Geometrize.QBezier))
        {
            // line
            d = new Geometrize.Line([{x:n*(p[1].x - p[0].x), y:n*(p[1].y - p[0].y)}, {x:n*(p[2].x - p[1].x), y:n*(p[2].y - p[1].y)}]);
        }
        else if (Geometrize.CBezier && (self instanceof Geometrize.CBezier))
        {
            // quadratic
            d = new Geometrize.QBezier([{x:n*(p[1].x - p[0].x), y:n*(p[1].y - p[0].y)}, {x:n*(p[2].x - p[1].x), y:n*(p[2].y - p[1].y)}, {x:n*(p[3].x - p[2].x), y:n*(p[3].y - p[2].y)}]);
        }
        else
        {
            // zero
            d = new Geometrize.Line([{x:0, y:0}, {x:0, y:0}]);
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
Geometrize.Bezier2D = Bezier2D;

/**[DOC_MD]
 * ### EllipticArc2D (subclass of Curve2D)
 *
 * Represents a part of an arbitrary ellipse in 2D space
 * (not used directly)
 *
[/DOC_MD]**/
var EllipticArc2D = makeClass(Curve2D, {
    constructor: function EllipticArc2D(points, values) {
        var self = this;

        self.$super('constructor', [points, values]);
    },
    name: 'EllipticArc2D',
    hasMatrix: function() {
        return false;
    },
    isClosed: function() {
        return is_almost_equal(stdMath.abs(this.dtheta), TWO_PI);
    },
    isConvex: function() {
        return true;
    },
    f: function(t) {
        var self = this, c = self.center, cs = self.cs;
        return arc(self.theta + t*self.dtheta, c.x, c.y, self.rX, self.rY, cs[0], cs[1]);
    },
    fto: function(t) {
        var self = this, largeArc = 0, sweep = 1;
        if (self instanceof Geometrize.Arc)
        {
            largeArc = self.largeArc;
            sweep = self.sweep;
        }
        else
        {
            largeArc = t*TWO_PI > PI ? 1 : 0;
            sweep = 1;
        }
        return new Geometrize.Arc(self.f(0), self.f(t), self.radiusX, self.radiusY, self.angle, largeArc, sweep);
    },
    d: function() {
        var self = this, p;
        if (self instanceof Geometrize.Arc)
        {
            p = ellipse2arc(self.center.x, self.center.y, self.rY, self.rX, [self.cs[0], -self.cs[1]], -self.theta, -self.dtheta);
            return new Geometrize.Arc(
                p.p0,
                p.p1,
                -self.angle,
                p.fa,
                p.fs
            );
        }
        else if (self instanceof Geometrize.Ellipse)
        {
            return new Geometrize.Ellipse(
                self.center,
                self.radiusY,
                self.radiusX,
                -self.angle
            );
        }
        else //if (self instanceof Geometrize.Circle)
        {
            return self.clone();
        }
    },
    hasPoint: function(point) {
        var self = this, ret = false;
        if (Geometrize.Arc && (self instanceof Geometrize.Arc))
        {
            ret = point_on_arc(point, self.center, self.rX, self.rY, self.cs, self.theta, self.dtheta, self.largeArc, self.sweep);
        }
        else if (Geometrize.Ellipse && (self instanceof Geometrize.Ellipse))
        {
            ret = 2 === point_inside_ellipse(point, self.center, self.rX, self.rY, self.cs);
        }
        else if (Geometrize.Circle && (self instanceof Geometrize.Circle))
        {
            ret = 2 === point_inside_circle(point, self.center, self.rX);
        }
        return ret;
    },
    hasInsidePoint: function(point, strict) {
        var self = this, inside, ret = false;
        if (Geometrize.Arc && (self instanceof Geometrize.Arc))
        {
            return strict ? false : self.hasPoint(point);
        }
        else if (Geometrize.Ellipse && (self instanceof Geometrize.Ellipse))
        {
            inside = point_inside_ellipse(point, self.center, self.rX, self.rY, self.cs);
            ret = strict ? 1 === inside : 0 < inside;
        }
        else if (Geometrize.Circle && (self instanceof Geometrize.Circle))
        {
            inside = point_inside_circle(point, self.center, self.rX);
            ret = strict ? 1 === inside : 0 < inside;
        }
        return ret;
    },
    bezierPoints: function(t) {
        if (arguments.length) t = clamp(t, 0, 1);
        else t = 1;
        if (is_almost_equal(t, 1)) t = 1;
        var self = this, c = self.center, cs = self.cs, sgn = 1;
        if (!(self instanceof Geometrize.Arc)) sgn = -1;
        return cbezier_from_arc(c.x, c.y, self.rX, self.rY, cs[0], cs[1], self.theta, sgn*t*self.dtheta);
    },
});
Geometrize.EllipticArc2D = EllipticArc2D;

/**[DOC_MD]
 * ### ParametricCurve (subclass of Curve2D)
 *
 * Represents a generic parametric curve in 2D space
 * ```javascript
 * // construct a spiral (0 <= t <= 1)
 * const spiral = ParametricCurve((t) => ({x: cx + t*r*Math.cos(t*6*Math.PI), y: cy + t*r*Math.sin(t*6*Math.PI)}));
 * ```
[/DOC_MD]**/
var ParametricCurve = makeClass(Curve2D, {
    constructor: function ParametricCurve(f) {
        var self = this, _length = null, _bbox = null, _hull = null;
        if (f instanceof ParametricCurve) return f;
        if (!(self instanceof ParametricCurve)) return new ParametricCurve(f);
        self.f = is_function(f) ? f : function(t) {return {x:0, y:0};};
        self.$super("constructor", [[]]);
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
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    _bbox = bounding_box_from_points(self._lines);
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
                    _hull = aligned_bounding_box_from_points(self._lines).map(Point2D);
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
    name: 'ParametricCurve',
    clone: function() {
        return new ParametricCurve(this.f);
    },
    transform: function(matrix, withSelfMatrix) {
        var self = this;
        return (new ParametricCurve(self.f)).setMatrix(true === withSelfMatrix ? (self.matrix && matrix ? matrix.mul(self.matrix) : (matrix || self.matrix)) : matrix);
    },
    fto: function(tmax) {
        var f = this.f, pmax = f(tmax);
        return new ParametricCurve(function(t) {return t >= tmax ? {x:pmax.x, y:pmax.y} : f(t*tmax);});
    },
    isClosed: function() {
        var self = this, p = self._lines;
        return 2 < p.length ? p_eq(p[0], p[p.length-1]) : false;
    },
    hasPoint: function(point) {
        return point_on_polyline(point, this._lines);
    },
    hasInsidePoint: function(point, strict) {
        if (!this.isClosed()) return false;
        var inside = point_inside_polyline(point, {x:this._bbox.xmax+10, y:point.y}, this._lines);
        return strict ? 1 === inside : 0 < inside;
    },
    intersects: function(other) {
        var self = this, i;
        if (other instanceof Point2D)
        {
            return self.hasPoint(other) ? [other] : false;
        }
        else if (Geometrize.Line && (other instanceof Geometrize.Line))
        {
            i = polyline_line_intersection(self._lines, other._points[0], other._points[1]);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.Circle && (other instanceof Geometrize.Circle))
        {
            i = polyline_circle_intersection(self._lines, other.center, other.radius);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.Ellipse && (other instanceof Geometrize.Ellipse))
        {
            i = polyline_ellipse_intersection(self._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.Arc && (other instanceof Geometrize.Arc))
        {
            i = polyline_arc_intersection(self._lines, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.QBezier && (other instanceof Geometrize.QBezier))
        {
            i = polyline_qbezier_intersection(self._lines, other._points);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.CBezier && (other instanceof Geometrize.CBezier))
        {
            i = polyline_cbezier_intersection(self._lines, other._points);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.Polyline && (other instanceof Geometrize.Polyline))
        {
            i = polyline_polyline_intersection(self._lines, other._points);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.Polygon && (other instanceof Geometrize.Polygon))
        {
            i = polyline_polyline_intersection(self._lines, other._lines);
            return i ? i.map(Point2D) : false;
        }
        else if (other instanceof ParametricCurve)
        {
            i = polyline_polyline_intersection(self._lines, other._lines);
            return i ? i.map(Point2D) : false;
        }
        else if (other instanceof Object2D)
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
        return i ? i.map(Point2D) : false;
    },
    bezierPoints: function(t) {
        if (arguments.length) t = clamp(t, 0, 1);
        else t = 1;
        if (is_almost_equal(t, 1)) t = 1;
        var p = this._lines, n = p.length - 1, i, b = [];
        for (i=0; i<n; ++i)
        {
            if (p[i+1].t < t)
            {
                b.push(cbezier_from_points([p[i], p[i+1]], 1));
            }
            else
            {
                b.push(cbezier_from_points([p[i], p[i+1]], n*(t - i/n)));
                break;
            }
        }
        return b;
    },
    toSVG: function(svg) {
        return this.toSVGPath(arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this,
            p = self._lines,
            path = 'M ' + p.map(function(p) {
                return Str(p.x)+' '+Str(p.y);
            }).join(' L ');
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
        var self = this, p = self._lines, n = p.length, i;
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        for (i=1; i<n; ++i) ctx.lineTo(p[i].x, p[i].y);
        if (self.isClosed()) ctx.closePath();
    }
});
Geometrize.ParametricCurve = ParametricCurve;

var MZ = /[M]/g,
    XY = /^\s*(-?\s*\d+(?:\.\d+)?)\s+(-?\s*\d+(?:\.\d+)?)/,
    PXY = /(-?\s*\d+(?:\.\d+)?)\s+(-?\s*\d+(?:\.\d+)?)\s*$/
;
/**[DOC_MD]
 * ### CompositeCurve (subclass of Curve2D)
 *
 * Represents a container of multiple, not necessarily joined curves
 * ```javascript
 * // construct a complex curve
 * const curve = CompositeCurve([Line(p1, p2), QBezier([p3, p4, p5]), Line(p6, p7)]);
 * ```
[/DOC_MD]**/
var CompositeCurve = makeClass(Curve2D, {
    constructor: function CompositeCurve(curves) {
        var self = this,
            _curves = null,
            __curves = null,
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
        Object2D.call(self);

        curve_add = function(c) {
            if (c instanceof Curve2D) c.onChange(onCurveChange);
            return c;
        };
        curve_del = function(c) {
            if (c instanceof Curve2D) c.onChange(onCurveChange, false);
            return c;
        };
        onCurveChange = function onCurveChange(curve) {
            if (is_array(_curves) && (-1 !== _curves.indexOf(curve)))
            {
                //if (!self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            }
        };
        onCurveChange.id = self.id;
        onArrayChange = function onArrayChange(changed) {
            //if (!self.isChanged())
            {
                self.isChanged(true);
                self.triggerChange();
            }
        };
        onArrayChange.id = self.id;

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
/**[DOC_MD]
 * **Properties:**
 *
[/DOC_MD]**/
/**[DOC_MD]
 * * `curves: Curve2D[]` array of curves that define this composite curve
[/DOC_MD]**/
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
                        //if (!self.isChanged())
                        {
                            self.isChanged(true);
                            self.triggerChange();
                        }
                    }
                    else if (null == curves)
                    {
                        _curves = null;
                        __curves = null;
                    }
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_curves', {
            get: function() {
                if (null == __curves)
                {
                    var matrix = self.matrix;
                    __curves = self.curves.map(function(curve) {return curve.transform(matrix, true);});
                }
                return __curves;
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    _length = self._curves.reduce(function(l, curve) {
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
                    _bbox = self._curves.reduce(function(_bbox, curve) {
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
                    _hull = convex_hull(self._curves.reduce(function(hulls, curve) {
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
                __curves = null;
                _length = null;
                _bbox = null;
                _hull = null;
            }
            else if (false === isChanged)
            {
                _curves.forEach(function(c) {c.isChanged(false);});
            }
            return Object2D.prototype.isChanged.apply(self, arguments);
        };
        self.curves = curves;
    },
    name: 'CompositeCurve',
    dispose: function() {
        var self = this;
        if (self.curves)
        {
            unobserveArray(self.curves, function(c) {
                if (c instanceof Curve2D) c.onChange(self.id, false);
                return c;
            });
            self.curves = null;
            self.points = null;
        }
        Object2D.prototype.dispose.call(self);
    },
    clone: function() {
        return new CompositeCurve(this.curves.map(function(curve) {return curve.clone();}));
    },
    transform: function(matrix, withSelfMatrix) {
        var curves = true === withSelfMatrix ? this._curves : this.curves;
        return new CompositeCurve(curves.map(object_transform(matrix, withSelfMatrix)));
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
    f: function(t) {
        var c = this._curves, n = c.length - 1, i = stdMath.floor(t*n);
        return 1 === t ? c[n].f(t) : c[i].f(n*(t - i/n));
    },
    fto: function(t) {
        var self = this, c = self._curves, n = c.length - 1, i = stdMath.floor(t*n);
        return new CompositeCurve(c.slice(0, i).concat([c[i].curveUpTo(1 === t ? 1 : (n*(t - i/n)))]));
    },
    derivative: function() {
        return new CompositeCurve(this._curves.map(function(c) {return c.derivative();}));
    },
    hasPoint: function(point) {
        for (var c=this._curves, n=c.length, i=0; i<n; ++i)
        {
            if (c[i].hasPoint(point))
                return true;
        }
        return false;
    },
    intersects: function(other) {
        var self = this;
        if (other instanceof Point2D)
        {
            return self.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Object2D)
        {
            for (var ii,i=[],c=self._curves,n=c.length,j=0; j<n; ++j)
            {
                ii = c[j].intersects(other);
                if (ii) i.push.apply(i, ii);
            }
            return i ? i.map(Point2D) : false;
        }
        return false;
    },
    intersectsSelf: function() {
        var self = this, ii, i = [], c = self._curves, n = c.length,
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
        return i ? i.map(Point2D) : false;
    },
    polylinePoints: function() {
        return this._curves.reduce(function(lines, curve) {
            lines.push.apply(lines, curve.polylinePoints());
            return lines;
        }, []);
    },
    bezierPoints: function(t) {
        if (arguments.length) t = clamp(t, 0, 1);
        else t = 1;
        if (is_almost_equal(t, 1)) t = 1;
        var c = this._curves, n = c.length - 1, i = stdMath.floor(t*n), j, b = [];
        for (j=0; j<i; ++j) b.push.apply(b, c[j].bezierPoints(1));
        b.push.apply(b, c[i].bezierPoints(1 === t ? 1 : (n*(t - i/n))));
        return b;
    },
    toSVG: function(svg) {
        return this.toSVGPath(arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this,
            curves = self._curves,
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
            curves = self._curves,
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
