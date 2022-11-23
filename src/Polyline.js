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
        Curve.call(self, points);

        Object.defineProperty(self, 'lines', {
            get() {
                var p = self.points;
                return 1 < p.length ? p.reduce(function(lines, point, i) {
                    if (i+1 < p.length)
                    {
                        lines[i] = new Line(point, p[i+1]);
                    }
                    return lines;
                }, new Array(p.length-1)) : [];
            },
            enumerable: true
        });
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    _length = curve_length(self.points);
                }
                return _length;
            },
            enumerable: true
        });
        Object.defineProperty(self, '_bbox', {
            get() {
                if (null == _bbox)
                {
                    _bbox = {
                        top: Infinity,
                        left: Infinity,
                        bottom: -Infinity,
                        right: -Infinity
                    };
                    for (var i=0,p=self.points,n=p.length; i<n; ++i)
                    {
                        _bbox.top = stdMath.min(_bbox.top, p[i].y);
                        _bbox.bottom = stdMath.max(_bbox.bottom, p[i].y);
                        _bbox.left = stdMath.min(_bbox.left, p[i].x);
                        _bbox.right = stdMath.max(_bbox.right, p[i].x);
                    }
                }
                return _bbox;
            },
            enumerable: false
        });
        Object.defineProperty(self, '_hull', {
            get() {
                if (null == _hull)
                {
                    _hull = convex_hull(self.points);
                }
                return _hull;
            },
            enumerable: false
        });
        Object.defineProperty(self, '_is_convex', {
            get() {
                if (!self.isClosed()) return false;
                if (null == _is_convex)
                {
                    _is_convex = is_convex(self.points);
                }
                return _is_convex;
            },
            enumerable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _length = null;
                _bbox = null;
                _hull = null;
                _is_convex = null;
            }
            return self.$super.isChanged.apply(self, arguments);
        };
    },
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
        return point_on_curve(point, this.points);
    },
    hasInsidePoint: function(point, strict) {
        if (!this.isClosed()) return false;
        var inside = point_inside_curve(point, {x:this._bbox.right+1, y:point.y}, this.points);
        return strict ? 1 === inside : 0 < inside;
    },
    getPointAt: function(t) {
        var lines = this.lines, n = lines.length, i;
        t = Num(t);
        if (0 > t || 1 < t || 0 >= n) return null;
        // 0-1/n, 1/n-2/n,..,(n-1)/n,n/n
        i = stdMath.floor(n * t);
        return lines[i].getPoint(n*(t-i/n));
    },
    intersects: function(other) {
        var p;
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Line)
        {
            p = curve_lines_intersection(this.points, [other.start, other.end]);
            return p ? p.map(Point) : false;
        }
        else if (other instanceof Polyline)
        {
            p = curve_lines_intersection(this.points, other.points);
            return p ? p.map(Point) : false;
        }
        else if ((other instanceof Primitive) && is_function(other.intersects))
        {
            return other.intersects(this);
        }
        return false;
    },
    distanceToPoint: function(point) {
        var points = this.points;
        return !points.length ? NaN : (1 === points.length ? hypot(point.x, point.y, points[0].x, points[0].y) : points.reduce(function(dist, _, i) {
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
            'points': [this.points.map(function(p) {return Str(p.x)+','+Str(p.y);}).join(' '), this.isChanged()],
            'transform': [this.matrix.toSVG(), this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function() {
        return 'M '+(this.points.map(function(p) {
            return Str(p.x)+' '+Str(p.y);
        }).join(' L '))+(this.isClosed() ? ' z' : '');
    },
    toTex: function() {
        var lines = this.lines, n = lines.length;
        return '\\text{Polyline:}'+'\\left\\{'+lines.map(function(line, i) {return line.toTex((0 === i ? '0' : '\\frac{'+Str(i)+'}{'+Str(n)+'}')+' \\le t \\le '+('\\frac{'+Str(i+1)+'}{'+Str(n)+'}'));}.join('\\\\')+'\\right\\\\';
    },
    toString: function() {
        return 'Polyline('+this.points.map(Str).join(',')+')';
    }
});
