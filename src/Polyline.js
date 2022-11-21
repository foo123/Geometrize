// 2D Polyline class
// assembly of consecutive line segments between given points
var Polyline = makeClass(Curve, {
    constructor: function Polyline(points) {
        var self = this,
            _length = null,
            _bbox = null,
            _hull = null
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
                    _length = 0;
                    for (var i=0,p=self.points,n=p.length; i+1<n; ++i)
                    {
                        _length += dist(p[i], p[i+1]);
                    }
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
                    for (var i=0,p=self.points,n=p.length; i+1<n; ++i)
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
        self.isDirty = function(isDirty) {
            if (true === isDirty)
            {
                _length = null;
                _bbox = null;
                _hull = null;
            }
            return self.$super.isDirty.apply(self, arguments);
        };
    },
    distanceToPoint: function(point) {
        return 1 < this.points.length ? this.points.reduce(function(dist, _, i) {
            if (i+1 < this.points.length)
            {
                dist = stdMath.min(dist, point_line_distance(point, this.points[i], this.points[i+1]));
            }
            return dist;
        }, Infinity) : -1;
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
    getBoundingBox: function() {
        return this._bbox;
    },
    getConvexHull: function() {
        return this._hull;
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Line)
        {
            var i = this.lines.reduce(function(i, line) {
                var p;
                if (p=line.intersects(other))
                    i.push.apply(i, p);
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
                        i.push.apply(i, p);
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
    getPointAt: function(t) {
        var lines = this.lines, n = lines.length, i;
        t = Num(t);
        if (0 > t || 1 < t || 0 >= n) return null;
        // 0-1/n, 1/n-2/n,..,(n-1)/n,n/n
        i = stdMath.floor(n * t);
        return lines[i].getPoint(n*(t-i/n));
    },
    hasPoint: function(point) {
        return 1 < _points.length ? _points.reduce(function(res, _, i) {
            if (!res && (i+1 < _points.length))
            {
                res = !!point_between(point, _points[i], _points[i+1]);
            }
            return res;
        }, false) : false;
    },
    toSVG: function(svg) {
        return SVG('polyline', {
            'id': this.id,
            'points': this.points.map(function(p) {return Str(p.x)+','+Str(p.y);}).join(' '),
            'transform': this.matrix.toSVG(),
            'style': this.style.toSVG()
        }, arguments.length ? svg : false, {
            'id': false,
            'points': this.isDirty(),
            'transform': this.isDirty(),
            'style': this.style.isDirty()
        });
    },
    toTex: function() {
        var lines = this.lines, n = lines.length;
        return '\\text{Polyline:}'+'\\left\\{'+lines.map(function(line, i) {return line.toTex((0 === i ? '0' : '\\frac{'+Str(i)+'}{'+Str(n)+'}')+' \\le t \\le '+('\\frac{'+Str(i+1)+'}{'+Str(n)+'}'));}.join('\\\\')+'\\right\\\\';
    },
    toString: function() {
        return 'Polyline('+this.points.map(Str).join(',')+')';
    }
});
