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
        var i;
        if (other instanceof Point)
        {
            i = point_on_qbezier(other, this._points)
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
        else if ((other instanceof Primitive))
        {
            return other.intersects(this);
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
        var p = this._points,
            path = 'M '+Str(p[0].x)+' '+Str(p[0].y)+' Q '+Str(p[1].x)+' '+Str(p[1].y)+','+Str(p[2].x)+' '+Str(p[2].y);
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
        ctx.quadraticCurveTo(p[1].x, p[1].y, p[2].x, p[2].y);
        ctx.stroke();
    }
});
Geometrize.QBezier = Geometrize.Bezier2 = Bezier2;
