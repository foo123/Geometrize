// 2D Line segment class (equivalent to Linear Bezier curve)
var Line = makeClass(Curve, {
    constructor: function Line(start, end) {
        var self = this,
            _length = null,
            _bbox = null,
            _hull = null
        ;

        if (start instanceof Line) return start;
        if (!(self instanceof Line)) return new Line(start, end);

        Curve.call(self, [start, end]);

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
        return point_line_distance(point, this.start, this.end);
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
    getPoint: function(t) {
        t = Num(t);
        if (0 > t || 1 < t) return null;
        var p0 = this.start, p1 = this.end;
        return new Point(
            p0.x*(1-t) + p1.x*t,
            p0.y*(1-t) + p1.y*t
        );
    },
    hasPoint: function(point) {
        return !!points_colinear(point, this.start, this.end);
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return points_colinear(other, this.start, this.end);
        }
        else if (other instanceof Line)
        {
            return line_line_intersection(this.start, this.end, other.start, other.end);
        }
        else if ((other instanceof Primitive) && is_function(other.intersects))
        {
            return other.intersects(this);
        }
        return false;
    },
    toBezier: function() {
        return new Polybezier3([this.start, this.getPoint(1/3), this.getPoint(2/3), this.end]);
    },
    toTex: function() {
        return '\\text{Line:}'+Tex(this.start) + ' \\cdot (1-t) + ' + Tex(this.end) + ' \\cdot t';
    },
    toString: function() {
        return 'Line('+[Str(this.start), Str(this.end)].join(',')+')';
    }
});
var Bezier1 = Line;
