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
        var self = this;
        return new Line(self.start.clone(), self.end.clone());
    },
    transform: function(matrix) {
        var self = this;
        return new Line(self.start.transform(matrix), self.end.transform(matrix));
    },
    hasPoint: function(point) {
        var p = this._points;
        return !!point_on_line_segment(point, p[0], p[1]);
    },
    intersects: function(other) {
        var self = this, i, p;
        if (other instanceof Point)
        {
            p = self._points;
            i = point_on_line_segment(other, p[0], p[1]);
            return i ? [other] : false;
        }
        else if (other instanceof Line)
        {
            p = self._points;
            i = line_segments_intersection(p[0], p[1], other._points[0], other._points[1]);
            return i ? [Point(i)] : false;
        }
        else if (other instanceof Circle)
        {
            p = self._points;
            i = line_circle_intersection(p[0], p[1], other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Ellipse)
        {
            p = self._points;
            i = line_ellipse_intersection(p[0], p[1], other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Arc)
        {
            p = self._points;
            i = line_arc_intersection(p[0], p[1], null, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier2)
        {
            p = self._points;
            i = line_qbezier_intersection(p[0], p[1], null, other._points);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Bezier3)
        {
            p = self._points;
            i = line_cbezier_intersection(p[0], p[1], null, other._points);
            return i ? i.map(Point) : false;
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
    distanceToPoint: function(point) {
        return point_line_segment_distance(point, this._points[0], this._points[1]);
    },
    bezierPoints: function() {
        var p = this._points;
        return [
        [
        bezier1(0, p),
        bezier1(0.5, p),
        bezier1(0.5, p),
        bezier1(1, p)
        ]
        ];
    },
    toSVG: function(svg) {
        var self = this, p = self._points;
        return SVG('line', {
            'id': [self.id, false],
            'x1': [p[0].x, self.start.isChanged() || self.values.matrix.isChanged()],
            'y1': [p[0].y, self.start.isChanged() || self.values.matrix.isChanged()],
            'x2': [p[1].x, self.end.isChanged() || self.values.matrix.isChanged()],
            'y2': [p[1].y, self.end.isChanged() || self.values.matrix.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, p = self._points,
            path = ['M',p[0].x,p[0].y,'L',p[1].x,p[1].y].join(' ');
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
        var self = this, p1 = self._points[0], p2 = self._points[1];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
    },
    toTex: function() {
        var self = this, p1 = self.start, p2 = self.end;
        return '\\text{Line: }'+signed(p2.y - p1.y, false)+' \\cdot x '+signed(p1.x - p2.x)+' \\cdot y '+signed(p2.x*p1.y - p1.x*p2.y)+' = 0\\text{, }'+Str(stdMath.min(p1.x, p2.x))+' \\le x \\le '+Str(stdMath.max(p1.x, p2.x))+'\\text{, }'+Str(stdMath.min(p1.y, p2.y))+' \\le y \\le '+Str(stdMath.max(p1.y, p2.y));
    },
    toString: function() {
        var self = this;
        return 'Line('+[Str(self.start), Str(self.end)].join(',')+')';
    }
});
var Line = Bezier1;
Geometrize.Bezier1 = Bezier1;
Geometrize.Line = Line;

