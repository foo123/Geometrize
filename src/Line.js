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

        Bezier.call(self, [start, end]);

        Object.defineProperty(self, 'start', {
            get() {
                return self.points[0];
            },
            set(start) {
                self.points[0] = start;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'end', {
            get() {
                return self.points[1];
            },
            set(end) {
                self.points[1] = end;
            },
            enumerable: true
        });
        Object.defineProperty(self, '_lines', {
            get() {
                return self._points;
            },
            set(lines) {
            },
            enumerable: false
        });
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    var p = self._points;
                    _length = dist(p[0], p[1]);
                }
                return _length;
            },
            enumerable: true
        });
        Object.defineProperty(self, '_bbox', {
            get() {
                if (null == _bbox)
                {
                    var p = self._points,
                        p1 = p[0], p2 = p[1],
                        x1 = stdMath.min(p1.x, p2.x),
                        x2 = stdMath.max(p1.x, p2.x),
                        y1 = stdMath.min(p1.y, p2.y),
                        y2 = stdMath.max(p1.y, p2.y)
                    ;
                    _bbox = {
                        top: y1,
                        left: x1,
                        bottom: y2,
                        right: x2
                    };
                }
                return _bbox;
            },
            enumerable: false
        });
        Object.defineProperty(self, '_hull', {
            get() {
                if (null == _hull)
                {
                    var p = self._points,
                        p1 = p[0], p2 = p[1],
                        x1 = stdMath.min(p1.x, p2.x),
                        x2 = stdMath.max(p1.x, p2.x),
                        y1 = stdMath.min(p1.y, p2.y),
                        y2 = stdMath.max(p1.y, p2.y)
                    ;
                    _hull = [
                        new Point(x1, y1),
                        new Point(x2, y1),
                        new Point(x2, y2),
                        new Point(x1, y2)
                    ];
                }
                return _hull;
            },
            enumerable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _length = null;
                _bbox = null;
                _hull = null;
            }
            return self.$super.isChanged.apply(self, arguments);
        };
    },
    clone: function() {
        return new Line(this.start.clone(), this.end.clone());
    },
    transform: function(matrix) {
        return new Line(this.start.transform(matrix), this.end.transform(matrix));
    },
    getBoundingBox: function() {
        return this._bbox;
    },
    getConvexHull: function() {
        return this._hull;
    },
    hasPoint: function(point) {
        var p = this._points;
        return !!point_between(point, p[0], p[1]);
    },
    intersects: function(other) {
        var i, p;
        if (other instanceof Point)
        {
            p = this._points;
            i = point_between(other, p[0], p[1]);
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
            i = line_ellipse_intersection(p[0], p[1], other.center, other.radiusX, other.radiusY, other.angle, other.sincos);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Arc)
        {
            return false;
        }
        else if (other instanceof Bezier2)
        {
            return false;
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
        return bezier1(t, this.points);
    },
    getPointAt: function(t) {
        t = Num(t);
        return 0 > t || 1 < t ? null : Point(this.f(t));
    },
    distanceToPoint: function(point) {
        return point_line_segment_distance(point, this._points[0], this._points[1]);
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
    toSVGPath: function() {
        var p = this._points;
        return 'M '+Str(p[0].x)+' '+Str(p[0].y)+' L '+Str(p[1].x)+' '+Str(p[1].y);
    },
    toTex: function() {
        return '\\text{Line: }\\begin{pmatrix}x\\\\y\\end{pmatrix} = '+Tex(this.start) + ' \\cdot (1-t) + ' + Tex(this.end) + ' \\cdot t\\text{, }0 \\le t \\le 1';
    },
    toString: function() {
        return 'Line('+[Str(this.start), Str(this.end)].join(',')+')';
    }
});
var Line = Bezier1;
