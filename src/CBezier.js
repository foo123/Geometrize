/**[DOC_MD]
 * ### CBezier (subclass of Bezier2D)
 *
 * Represents a cubic Bezier curve defined by its control points
 * ```javascript
 * const cbezier = CBezier([p1, p2, p3, p4]);
 * cbezier.points[0].x += 10; // change it
 * cbezier.points[2].x = 20; // change it
 * ```
[/DOC_MD]**/
var CBezier = makeClass(Bezier2D, {
    constructor: function CBezier(points) {
        var self = this,
            _length = null,
            _bbox = null,
            _hull = null,
            BB = null
        ;

        if (points instanceof CBezier) return points;
        if (!(self instanceof CBezier)) return new CBezier(points);

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
                    _hull = aligned_bounding_box_from_points(self._points, BB).map(Point2D);
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
        return new CBezier(this.points.map(function(p) {return p.clone();}));
    },
    f: function(t) {
        return bezier3(t, this._points);
    },
    hasPoint: function(point) {
        return point_on_cbezier(point, this._points)
    },
    intersects: function(other) {
        var self = this, i;
        if (other instanceof Point2D)
        {
            return self.hasPoint(other) ? [other] : false;
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
        else if (other instanceof CBezier)
        {
            i = polyline_cbezier_intersection(self._lines, other._points);
            return i ? i.map(Point2D) : false;
        }
        else if (other instanceof Object2D)
        {
            return other.intersects(self);
        }
        return false;
    },
    intersectsSelf: function() {
        var p = this._points,
            x0 = p[0].x, y0 = p[0].y,
            x1 = p[1].x, y1 = p[1].y,
            x2 = p[2].x, y2 = p[2].y,
            x3 = p[3].x, y3 = p[3].y,
            x, y, s, t, rs, rp;

        s = solve_linear_linear_system(x2 - x1, x1 - x0, -(x3 - x0), y2 - y1, y1 - y0, -(y3 - y0));
        if (!s) return false;
        x = s[0].x;
        y = s[0].y;
        if (
        (x > 1) ||
        (4 * y > (x + 1) * (3 - x)) ||
        (x > 0 && 2 * y + x < sqrt(3 * x * (4 - x))) ||
        (3 * y < x * (3 - x))
        )
        {
            return false;
        }
        rs = (x - 3) / (x + y - 3);
        rp = rs * rs + 3 / (x + y - 3);
        t = (rs - sqrt(rs * rs - 4 * rp)) / 2;
        // parameters (t, s) = (t, rp/t)
        if (0.0 <= t && t <= 1.0) return [Point2D(this.f(t))];
        return false;
    },
    bezierPoints: function(t) {
        if (arguments.length) t = clamp(t, 0, 1);
        else t = 1;
        if (is_almost_equal(t, 1)) t = 1;
        return [cbezier_from_points(this._points, t)];
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
Geometrize.CBezier = CBezier;
