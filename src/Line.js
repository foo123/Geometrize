// 2D Line segment class (equivalent to Linear Bezier curve)
var Bezier1 = makeClass(Bezier, {
    constructor: function Bezier1(start, end) {
        var self = this,
            _length = null,
            _bbox = null,
            _hull = null
        ;

        if (start instanceof Bezier1) return start;
        if (!(self instanceof Bezier1)) return new Bezier1(start, end);

        if (is_array(start) && null == end)
        {
            end = start[1];
            start = start[0];
        }
        self.$super('constructor', [[start, end]]);

        def(self, 'start', {
            get: function() {
                return self.points[0];
            },
            set: function(start) {
                self.points[0] = start;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'end', {
            get: function() {
                return self.points[1];
            },
            set: function(end) {
                self.points[1] = end;
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_lines', {
            get: function() {
                return self._points;
            },
            set: function(lines) {
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    var p = self._points;
                    _length = dist(p[0], p[1]);
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
                        p1 = p[0], p2 = p[1],
                        xmin = stdMath.min(p1.x, p2.x),
                        xmax = stdMath.max(p1.x, p2.x),
                        ymin = stdMath.min(p1.y, p2.y),
                        ymax = stdMath.max(p1.y, p2.y)
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
                    var p = self._points,
                        p1 = p[0], p2 = p[1],
                        xmin = stdMath.min(p1.x, p2.x),
                        xmax = stdMath.max(p1.x, p2.x),
                        ymin = stdMath.min(p1.y, p2.y),
                        ymax = stdMath.max(p1.y, p2.y)
                    ;
                    _hull = [
                        new Point(xmin, ymin),
                        new Point(xmax, ymin),
                        new Point(xmax, ymax),
                        new Point(xmin, ymax)
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
    name: 'Line',
    clone: function() {
        return new Line(this.start.clone(), this.end.clone());
    },
    transform: function(matrix) {
        return new Line(this.start.transform(matrix), this.end.transform(matrix));
    },
    hasPoint: function(point) {
        var p = this._points;
        return !!point_on_line_segment(point, p[0], p[1]);
    },
    intersects: function(other) {
        var i, p;
        if (other instanceof Point)
        {
            p = this._points;
            i = point_on_line_segment(other, p[0], p[1]);
            return i ? [other] : false;
        }
        else if (other instanceof Line)
        {
            p = this._points;
            i = line_segments_intersection(p[0], p[1], other._points[0], other._points[1]);
            return i ? [Point(i)] : false;
        }
        else if (other instanceof Circle)
        {
            p = this._points;
            i = line_circle_intersection(p[0], p[1], other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Ellipse)
        {
            p = this._points;
            i = line_ellipse_intersection(p[0], p[1], other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Arc)
        {
            p = this._points;
            i = line_arc_intersection(p[0], p[1], null, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier2)
        {
            p = this._points;
            i = line_qbezier_intersection(p[0], p[1], null, other._points);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier3)
        {
            return false;
        }
        else if ((other instanceof Primitive))
        {
            return other.intersects(this);
        }
        return false;
    },
    f: function(t) {
        return bezier1(t, this._points);
    },
    getPointAt: function(t) {
        t = Num(t);
        return 0 > t || 1 < t ? null : Point(this.f(t));
    },
    distanceToPoint: function(point) {
        return point_line_segment_distance(point, this._points[0], this._points[1]);
    },
    bezierPoints: function() {
        var p = this._points;
        return [
        [bezier1(0, p), bezier1(0.5, p), bezier1(0.5, p), bezier1(1, p)]
        ];
    },
    toSVG: function(svg) {
        var p = this._points;
        return SVG('line', {
            'id': [this.id, false],
            'x1': [p[0].x, this.start.isChanged() || this.values.matrix.isChanged()],
            'y1': [p[0].y, this.start.isChanged() || this.values.matrix.isChanged()],
            'x2': [p[1].x, this.end.isChanged() || this.values.matrix.isChanged()],
            'y2': [p[1].y, this.end.isChanged() || this.values.matrix.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var p = this._points,
            path = 'M '+Str(p[0].x)+' '+Str(p[0].y)+' L '+Str(p[1].x)+' '+Str(p[1].y);
        return arguments.length ? SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var p1 = this._points[0], p2 = this._points[1];
        ctx.beginPath();
        ctx.lineWidth = this.style['stroke-width'];
        ctx.strokeStyle = this.style['stroke'];
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    },
    toTex: function() {
        var p1 = this.start, p2 = this.end;
        return '\\text{Line: }'+signed(p2.y - p1.y, false)+' \\cdot x '+signed(p1.x - p2.x)+' \\cdot y '+signed(p2.x*p1.y - p1.x*p2.y)+' = 0\\text{, }'+Str(stdMath.min(p1.x, p2.x))+' \\le x \\le '+Str(stdMath.max(p1.x, p2.x))+'\\text{, }'+Str(stdMath.min(p1.y, p2.y))+' \\le y \\le '+Str(stdMath.max(p1.y, p2.y));
    },
    toString: function() {
        return 'Line('+[Str(this.start), Str(this.end)].join(',')+')';
    }
});
var Line = Bezier1;
Geometrize.Bezier1 = Bezier1;
Geometrize.Line = Line;

