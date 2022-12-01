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
        superCall(Curve, self)(points);

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
                        top: Infinity,
                        left: Infinity,
                        bottom: -Infinity,
                        right: -Infinity
                    };
                    for (var i=0,p=self._points,n=p.length; i<n; ++i)
                    {
                        _bbox.top = stdMath.min(_bbox.top, p[i].y);
                        _bbox.bottom = stdMath.max(_bbox.bottom, p[i].y);
                        _bbox.left = stdMath.min(_bbox.left, p[i].x);
                        _bbox.right = stdMath.max(_bbox.right, p[i].x);
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
            return Curve.prototype.isChanged.apply(self, arguments);
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
        var inside = point_inside_curve(point, {x:this._bbox.right+1, y:point.y}, this._points);
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
        var i, p, abcdef;
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if ((other instanceof Line) || (other instanceof Polyline))
        {
            i = curve_lines_intersection(this._points, other._points);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Circle)
        {
            p = this._points;
            abcdef = circle2quadratic(other.center, other.radius);
            i = p.reduce(function(i, _, j) {
                if (j+1 < p.length)
                {
                    var ii = line_circle_intersection(p[j], p[j+1], abcdef);
                    if (ii) i.push.apply(i, ii);
                }
                return i;
            }, []);
            return i.length ? i.map(Point) : false;
        }
        else if (other instanceof Ellipse)
        {
            p = this._points;
            abcdef = ellipse2quadratic(other.center, other.radiusX, other.radiusY, other.angle, other.sincos);
            i = p.reduce(function(i, _, j) {
                if (j+1 < p.length)
                {
                    var ii = line_ellipse_intersection(p[j], p[j+1], abcdef);
                    if (ii) i.push.apply(i, ii);
                }
                return i;
            }, []);
            return i.length ? i.map(Point) : false;
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
    toSVGPath: function() {
        return 'M '+(this._points.map(function(p) {
            return Str(p.x)+' '+Str(p.y);
        }).join(' L '))+(this.isClosed() ? ' z' : '');
    },
    toTex: function() {
        var lines = this.lines, n = lines.length;
        return '\\text{Polyline: }\\begin{cases}&'+lines.map(Tex).join('\\\\&')+'\\end{cases}';
    },
    toString: function() {
        return 'Polyline('+this.points.map(Str).join(',')+')';
    }
});
