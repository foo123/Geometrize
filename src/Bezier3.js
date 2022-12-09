// 2D Cubic Bezier class
var Bezier3 = makeClass(Bezier, {
    constructor: function Bezier3(points) {
        var self = this,
            _length = null,
            _bbox = null,
            _hull = null
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
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    // find min/max from zeroes of directional derivative along x and y
                    var c = self._points,
                        tx = solve_quadratic(3*(-c[0].x + 3*c[1].x - 3*c[2].x + c[3].x), 2*(3*c[0].x - 6*c[1].x + 3*c[2].x), -3*c[0].x + 3*c[1].x),
                        px = false === tx ? [c[1], c[2]] : tx.map(function(t) {return self.f(t);}),
                        ty = solve_quadratic(3*(-c[0].y + 3*c[1].y - 3*c[2].y + c[3].y), 2*(3*c[0].y - 6*c[1].y + 3*c[2].y), -3*c[0].y + 3*c[1].y),
                        py = false === ty ? [c[1], c[2]] : ty.map(function(t) {return self.f(t);}),
                        xmin = stdMath.min.apply(stdMath, px.concat([c[0], c[3]]).map(x)),
                        xmax = stdMath.max.apply(stdMath, px.concat([c[0], c[3]]).map(x)),
                        ymin = stdMath.min.apply(stdMath, py.concat([c[0], c[3]]).map(y)),
                        ymax = stdMath.max.apply(stdMath, py.concat([c[0], c[3]]).map(y))
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
        var i;
        if (other instanceof Point)
        {
            i = point_on_cbezier(other, this._points)
            return i ? [other] : false;
        }
        else if (other instanceof Circle)
        {
            i = polyline_circle_intersection(this._lines, other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Ellipse)
        {
            i = polyline_ellipse_intersection(this._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Arc)
        {
            i = polyline_arc_intersection(this._lines, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier2)
        {
            i = polyline_qbezier_intersection(this._lines, other._points);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier3)
        {
            i = polyline_cbezier_intersection(this._lines, other._points);
            return i ? i.map(Point) : false;
        }
        else if ((other instanceof Primitive))
        {
            return other.intersects(this);
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
        var p = this._points,
            path = 'M '+Str(p[0].x)+' '+Str(p[0].y)+' C '+Str(p[1].x)+' '+Str(p[1].y)+','+Str(p[2].x)+' '+Str(p[2].y)+','+Str(p[3].x)+' '+Str(p[3].y);
        return arguments.length ? SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var p = this._points;
        ctx.beginPath();
        this.style.toCanvas(ctx);
        ctx.moveTo(p[0].x, p[0].y);
        ctx.bezierCurveTo(p[1].x, p[1].y, p[2].x, p[2].y, p[3].x, p[3].y);
        ctx.stroke();
    }
});
Geometrize.CBezier = Geometrize.Bezier3 = Bezier3;
