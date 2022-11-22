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
        if (other instanceof Point)
        {
            var p = point_between(other, this.start, this.end);
            return p ? [p] : false;
        }
        else if (other instanceof Line)
        {
            var p = line_segments_intersection(this.start, this.end, other.start, other.end);
            return p ? [Point(p)] : false;
        }
        else if (other instanceof Circle || other instanceof Ellipse || other instanceof Arc || other instanceof Bezier2)
        {
            return line_quadratic_intersection(this, other);
        }
        else if (other instanceof Bezier3)
        {
            return line_cubic_intersection(this, other);
        }
        else if ((other instanceof Primitive) && is_function(other.intersects))
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
    getAtOfPoint: function(p) {
        var dxp = p.x - this.start.x,
            dx = this.end.x - this.start.x,
            dyp = p.y - this.start.y,
            dy = this.end.y - this.start.y
        ;
        return is_almost_zero(dx) ? dyp/dy : dxp/dx;
    },
    distanceToPoint: function(point) {
        return point_line_segment_distance(point, this.start, this.end);
    },
    toSVG: function(svg) {
        return SVG('line', {
            'id': this.id,
            'x1': this.start.x,
            'y1': this.start.y,
            'x2': this.end.x,
            'y2': this.end.y,
            'transform': this.matrix.toSVG(),
            'style': this.style.toSVG()
        }, arguments.length ? svg : false, {
            'id': false,
            'x1': this.start.isChanged(),
            'y1': this.start.isChanged(),
            'x2': this.end.isChanged(),
            'y2': this.end.isChanged(),
            'transform': this.isChanged(),
            'style': this.style.isChanged()
        });
    },
    toTex: function(interval) {
        return '\\text{Line:}'+Tex(this.start) + ' \\cdot (1-t) + ' + Tex(this.end) + ' \\cdot t\\text{, }'+(interval||'0 \\le t \\le 1');
    },
    toString: function() {
        return 'Line('+[Str(this.start), Str(this.end)].join(',')+')';
    }
});
var Line = Bezier1;
