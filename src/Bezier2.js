// 2D Quadratic Bezier class
var Bezier2 = makeClass(Bezier, {
    constructor: function Bezier2(points) {
        var self = this,
            _length = null,
            _bbox = null,
            _hull = null
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
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    var p = self._points,
                        p1 = p[0], p2 = p[1], p3 = p[2],
                        xmin = stdMath.min(p1.x, p2.x, p3.x),
                        xmax = stdMath.max(p1.x, p2.x, p3.x),
                        ymin = stdMath.min(p1.y, p2.y, p3.y),
                        ymax = stdMath.max(p1.y, p2.y, p3.y)
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
        def(self, '_hull', {
            get: function() {
                if (null == _hull)
                {
                    var bb = self._bbox;
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
    getPointAt: function(t) {
        t = Num(t);
        return 0 > t || 1 < t ? null : Point(this.f(t));
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
        ctx.lineWidth = this.style['stroke-width'];
        ctx.strokeStyle = this.style['stroke'];
        ctx.moveTo(p[0].x, p[0].y);
        ctx.quadraticCurveTo(p[1].x, p[1].y, p[2].x, p[2].y);
        ctx.stroke();
    },
    toTex: function() {
        return '\\text{QBezier: }\\left('+this.points.map(Tex).join(',')+'\\right)';
    },
    toString: function() {
        return 'QBezier('+this.points.map(Str).join(',')+')';
    }
});
Geometrize.QBezier = Geometrize.Bezier2 = Bezier2;
