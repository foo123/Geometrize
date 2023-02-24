/**[DOC_MD]
 * ### Line (equivalent to Linear Bezier, subclass of Bezier2D)
 *
 * Represents a line segment between 2 points
 * ```javascript
 * const line = Line(start, end);
 * line.start.x += 10; // change it
 * line.end.y = 20; // change it
 * ```
[/DOC_MD]**/
var Line = makeClass(Bezier2D, {
    constructor: function Line(start, end) {
        var self = this,
            _length = null,
            _bbox = null,
            _hull = null
        ;

        if (start instanceof Line) return start;
        if (!(self instanceof Line)) return new Line(start, end);

        if (is_array(start) && (null == end))
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
                    _bbox = bounding_box_from_points(self._points);
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
/**[DOC_MD]
 * **Methods:**
 *
[/DOC_MD]**/
    name: 'Line',
    clone: function() {
        var self = this;
        return new Line(self.start.clone(), self.end.clone());
    },
    transform: function(matrix) {
        var self = this;
        return new Line(self.start.transform(matrix), self.end.transform(matrix));
    },
    f: function(t) {
        return bezier1(t, this._points);
    },
    hasPoint: function(point) {
        var p = this._points;
        return !!point_on_line_segment(point, p[0], p[1]);
    },
    intersects: function(other) {
        var self = this, i, p;
        if (other instanceof Point2D)
        {
            p = self._points;
            i = point_on_line_segment(other, p[0], p[1]);
            return i ? [other] : false;
        }
        else if (other instanceof Line)
        {
            p = self._points;
            i = line_segments_intersection(p[0], p[1], other._points[0], other._points[1]);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.Circle && (other instanceof Geometrize.Circle))
        {
            p = self._points;
            i = line_circle_intersection(p[0], p[1], other.center, other.radius);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.Ellipse && (other instanceof Geometrize.Ellipse))
        {
            p = self._points;
            i = line_ellipse_intersection(p[0], p[1], other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.Arc && (other instanceof Geometrize.Arc))
        {
            p = self._points;
            i = line_arc_intersection(p[0], p[1], null, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta, other.largeArc, other.sweep);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.QBezier && (other instanceof Geometrize.QBezier))
        {
            p = self._points;
            i = line_qbezier_intersection(p[0], p[1], null, other._points);
            return i ? i.map(Point2D) : false;
        }
        else if (Geometrize.CBezier && (other instanceof Geometrize.CBezier))
        {
            p = self._points;
            i = line_cbezier_intersection(p[0], p[1], null, other._points);
            return i ? i.map(Point2D) : false;
        }
        else if (other instanceof Object2D)
        {
            return other.intersects(this);
        }
        return false;
    },
/**[DOC_MD]
 * * `distanceToPoint(p: Point2D): Number` distance of point to this line segment
[/DOC_MD]**/
    distanceToPoint: function(p) {
        return point_line_segment_distance(p, this._points[0], this._points[1]);
    },
/**[DOC_MD]
 * * `isParallelTo(l: Line): Bool` determine if line is parallel to line l
 * * `isParallelTo(p: Point2D, q: Point2D): Bool` determine if line is parallel to line defined by points p,q
[/DOC_MD]**/
    isParallelTo: function(p, q) {
        var _p = this._points;
        return p instanceof Line ? lines_parallel(_p[0], _p[1], p._points[0], p._points[1]) : lines_parallel(_p[0], _p[1], p, q);
    },
/**[DOC_MD]
 * * `isPerpendicularTo(l: Line): Bool` determine if line is perpendicular to line l
 * * `isPerpendicularTo(p: Point2D, q: Point2D): Bool` determine if line is perpendicular to line defined by points p,q
[/DOC_MD]**/
    isPerpendicularTo: function(p, q) {
        var _p = this._points;
        return p instanceof Line ? lines_perpendicular(_p[0], _p[1], p._points[0], p._points[1]) : lines_perpendicular(_p[0], _p[1], p, q);
    },
    bezierPoints: function(t) {
        if (arguments.length) t = clamp(t, 0, 1);
        else t = 1;
        if (is_almost_equal(t, 1)) t = 1;
        return [cbezier_from_points(this._points, t)];
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
Geometrize.Line = Line;

