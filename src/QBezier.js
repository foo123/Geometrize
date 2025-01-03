/**[DOC_MD]
 * ### QBezier (subclass of Bezier2D)
 *
 * Represents a quadratic Bezier curve defined by its control points
 * ```javascript
 * const qbezier = QBezier([p1, p2, p3]);
 * qbezier.points[0].x += 10; // change it
 * qbezier.points[1].x = 20; // change it
 * ```
[/DOC_MD]**/
var QBezier = makeClass(Bezier2D, {
    constructor: function QBezier(points) {
        var self = this,
            _length = null,
            _bbox = null,
            _hull = null,
            BB = null
        ;

        if (points instanceof QBezier) return points;
        if (!(self instanceof QBezier)) return new QBezier(points);

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
    name: 'QBezier',
    clone: function() {
        return new QBezier(this.points.map(function(p) {return p.clone();}));
    },
    f: function(t) {
        return bezier2(t, this._points);
    },
    hasPoint: function(point) {
        return point_on_qbezier(point, this._points)
    },
    intersects: function(other) {
        var self = this, i;
        if (other instanceof Point2D)
        {
            return self.hasPoint(other) ? [other] : false;
        }
        else if (Geometrize.Circle && (other instanceof Geometrize.Circle))
        {
            //i = polyline_circle_intersection(self._lines, other.center, other.radius);
            i = qbezier_arc_intersection(self._points, other.center, other.radius, other.radius, [1, 0], null);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.Ellipse && (other instanceof Geometrize.Ellipse))
        {
            //i = polyline_ellipse_intersection(self._lines, other.center, other.radiusX, other.radiusY, other.cs);
            i = qbezier_arc_intersection(self._points, other.center, other.radiusX, other.radiusY, other.cs, null);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.Arc && (other instanceof Geometrize.Arc))
        {
            //i = polyline_arc_intersection(self._lines, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            i = qbezier_arc_intersection(self._points, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta, other.largeArc, other.sweep);
            return i ? i.map(Point2D) : false;
        }
        else if (other instanceof QBezier)
        {
            //i = polyline_qbezier_intersection(self._lines, other._points);
            i = qbezier_qbezier_intersection(self._points, other._points);
            return i ? i.map(Point2D) : false;
        }
        else if (other instanceof Object2D)
        {
            return other.intersects(self);
        }
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
Geometrize.QBezier = QBezier;
