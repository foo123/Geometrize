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
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    _length = dist(self.start, self.end);
                }
                return _length;
            },
            enumerable: true
        });
        Object.defineProperty(self, '_bbox', {
            get() {
                if (null == _bbox)
                {
                    var p1 = this.start, p2 = this.end,
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
                    var p1 = this.start, p2 = this.end,
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
        return !!point_between(point, this.start, this.end);
    },
    intersects: function(other) {
        var p;
        if (other instanceof Point)
        {
            p = point_between(other, this.start, this.end);
            return p ? [p] : false;
        }
        else if (other instanceof Line)
        {
            p = line_segments_intersection(this.start, this.end, other.start, other.end);
            return p ? [Point(p)] : false;
        }
        else if (other instanceof Circle)
        {
            p = line_circle_intersection(this.start, this.end, other.center, other.radius);
            return p ? p.map(Point) : false;
        }
        else if (other instanceof Ellipse)
        {
            p = line_ellipse_intersection(this.start, this.end, other.center, other.radiusX, other.radiusY, other.angle, other.sincos);
            return p ? p.map(Point) : false;
        }
        else if (other instanceof Bezier2)
        {
            p = line_bezier2_intersection(this.start, this.end, other.points);
            return p ? p.map(Point) : false;
        }
        else if (other instanceof Bezier3)
        {
            return line_bezier3_intersection(this, other);
        }
        else if ((other instanceof Primitive))
        {
            return other.intersects(this);
        }
        return false;
    },
    getPointAt: function(t) {
        t = Num(t);
        if (0 > t || 1 < t) return null;
        var p0 = this.start, p1 = this.end;
        return new Point(
            p0.x*(1-t) + p1.x*t,
            p0.y*(1-t) + p1.y*t
        );
    },
    distanceToPoint: function(point) {
        return point_line_segment_distance(point, this.start, this.end);
    },
    toSVG: function(svg) {
        return SVG('line', {
            'id': [this.id, false],
            'x1': [this.start.x, this.start.isChanged()],
            'y1': [this.start.y, this.start.isChanged()],
            'x2': [this.end.x, this.end.isChanged()],
            'y2': [this.end.y, this.end.isChanged()],
            'transform': [this.matrix.toSVG(), this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function() {
        return 'M '+Str(this.start.x)+' '+Str(this.start.y)+' L '+Str(this.end.x)+' '+Str(this.end.y);
    },
    toTex: function(interval) {
        return '\\text{Line: }\\begin{pmatrix}x\\\\y\\end{pmatrix} = '+Tex(this.start) + ' \\cdot (1-t) + ' + Tex(this.end) + ' \\cdot t\\text{, }'+(interval||'0 \\le t \\le 1');
    },
    toString: function() {
        return 'Line('+[Str(this.start), Str(this.end)].join(',')+')';
    }
});
var Line = Bezier1;
