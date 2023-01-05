/**[DOC_MD]
 * ### Polygon 2D Polygon (subclass of Curve2D)
 *
 * Represents a polygon (a closed polyline) defined by its vertices
 * ```javascript
 * const polygon = Polygon([p1, p2, .., pn]);
 * ```
[/DOC_MD]**/
var Polygon = makeClass(Curve2D, {
    constructor: function Polygon(vertices) {
        var self = this,
            _length = null,
            _area = null,
            _bbox = null,
            _hull = null,
            _is_convex = null
        ;

        if (vertices instanceof Polygon) return vertices;
        if (!(self instanceof Polygon)) return new Polygon(vertices);
        self.$super('constructor', [vertices]);

        def(self, 'vertices', {
            get: function() {
                return self.points;
            },
            set: function(vertices) {
                self.points = vertices;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'edges', {
            get: function() {
                var v = self.points;
                return 1 < v.length ? v.map(function(vertex, i) {
                    return new Line(vertex, v[(i+1) % v.length]);
                }) : [];
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_lines', {
            get: function() {
                return self._points.concat([self._points[0]]);
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    _length = polyline_length(self._lines);
                }
                return _length;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'area', {
            get: function() {
                if (null == _area)
                {
                    _area = polyline_area(self._lines);
                }
                return _area;
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
        def(self, '_hull', {
            get: function() {
                if (null == _hull)
                {
                    _hull = aligned_bounding_box_from_points(self._points).map(Point);
                }
                return _hull;
            },
            enumerable: false,
            configurable: false
        });
        def(self, '_is_convex', {
            get: function() {
                if (null == _is_convex)
                {
                    _is_convex = is_convex(self._points);
                }
                return _is_convex;
            },
            enumerable: false,
            configurable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _length = null;
                _area = null;
                _bbox = null;
                _hull = null;
                _is_convex = null;
            }
            return self.$super('isChanged', arguments);
        };
    },
    name: 'Polygon',
    clone: function() {
        return new Polygon(this.vertices.map(function(vertex) {return vertex.clone();}));
    },
    transform: function(matrix) {
        return new Polygon(this.vertices.map(function(vertex) {return vertex.transform(matrix);}));
    },
    isClosed: function() {
        return true;
    },
    isConvex: function() {
        return this._is_convex;
    },
    f: function(t) {
        var p = this._lines, n = p.length - 1, i = stdMath.floor(t*n);
        return 1 === t ? {x:p[n].x, y:p[n].y} : bezier1(n*(t - i/n), [p[i], p[i+1]]);
    },
    fto: function(t) {
        var self = this, p = self.points, n = p.length, i = stdMath.floor(t*n);
        return new Polyline(p.slice(0, i+1).concat([bezier1(n*(t - i/n), [p[i], p[(i+1) % n]])]));
    },
    hasPoint: function(point) {
        return 2 === point_inside_polyline(point, {x:this._bbox.xmax+10, y:point.y}, this._lines);
    },
    hasInsidePoint: function(point, strict) {
        var inside = point_inside_polyline(point, {x:this._bbox.xmax+10, y:point.y}, this._lines);
        return strict ? 1 === inside : 0 < inside;
    },
    intersects: function(other) {
        var self = this, i;
        if (other instanceof Point)
        {
            return self.hasPoint(other) ? [other] : false;
        }
        else if (Geometrize.Line && (other instanceof Geometrize.Line))
        {
            i = polyline_line_intersection(self._lines, other._points[0], other._points[1]);
            return i ? i.map(Point) : false;
        }
        else if (Geometrize.Circle && (other instanceof Geometrize.Circle))
        {
            i = polyline_circle_intersection(self._lines, other.center, other.radius);
            return i ? i.map(Point) : false;
        }
        else if (Geometrize.Ellipse && (other instanceof Geometrize.Ellipse))
        {
            i = polyline_ellipse_intersection(self._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false;
        }
        else if (Geometrize.Arc && (other instanceof Geometrize.Arc))
        {
            i = polyline_arc_intersection(self._lines, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            return i ? i.map(Point) : false;
        }
        else if (Geometrize.QBezier && (other instanceof Geometrize.QBezier))
        {
            i = polyline_qbezier_intersection(self._lines, other._points);
            return i ? i.map(Point) : false;
        }
        else if (Geometrize.CBezier && (other instanceof Geometrize.CBezier))
        {
            i = polyline_cbezier_intersection(self._lines, other._points);
            return i ? i.map(Point) : false;
        }
        else if ((Geometrize.Polyline && (other instanceof Geometrize.Polyline)) || (other instanceof Polygon))
        {
            i = polyline_polyline_intersection(self._lines, other._lines);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Object2D)
        {
            return other.intersects(self);
        }
        return false;
    },
    intersectsSelf: function() {
        var self = this, ii, i = [], p = self._lines, n = p.length,
            j, k, p1, p2, p3, p4;
        for (j=0; j<n; ++j)
        {
            if (j+1 >= n) break;
            for (k=j+2; k<n; ++k)
            {
                if (k+1 >= n) break;
                p1 = p[j]; p2 = p[j+1];
                p3 = p[k]; p4 = p[k+1];
                ii = line_segments_intersection(p1, p2, p3, p4);
                if (ii)
                {
                    if ((j === 0) && (k === n-2) && p_eq(p1, p4)) ii = ii.filter(function(p) {return !p_eq(p, p1);});
                    else if ((k === j+2) && p_eq(p2, p3)) ii = ii.filter(function(p) {return !p_eq(p, p2);});
                    i.push.apply(i, ii);
                }
            }
        }
        return i ? i.map(Point) : false;
    },
    bezierPoints: function(t) {
        if (arguments.length) t = clamp(t, 0, 1);
        else t = 1;
        if (is_almost_equal(t, 1)) t = 1;
        var p = this._lines, n = p.length - 1, i = stdMath.floor(t*n), j, b = new Array(1 === t ? i : (i+1));
        for (j=0; j<i; ++j) b[j] = cbezier_from_points([p[j], p[j+1]], 1);
        if (1 > t) b[i] = cbezier_from_points([p[i], p[i+1]], n*(t - i/n));
        return b;
    },
    toSVG: function(svg) {
        var self = this;
        return SVG('polygon', {
            'id': [self.id, false],
            'points': [self._points.map(function(p) {return Str(p.x)+' '+Str(p.y);}).join(' '), self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, path = 'M '+(self._lines.map(function(p) {
            return Str(p.x)+' '+Str(p.y);
        }).join(' L '))+' Z';
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
        if ('none' !== self.style['fill']) ctx.fill();
        ctx.stroke();
    },
    toCanvasPath: function(ctx) {
        var p = this._lines, n = p.length, i;
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        for (i=1; i<n; ++i) ctx.lineTo(p[i].x, p[i].y);
        ctx.closePath();
    },
    toTex: function() {
        return '\\text{Polygon: }'+'\\left(' + this.vertices.map(Tex).join(',') + '\\right)';
    },
    toString: function() {
        return 'Polygon('+this.vertices.map(Str).join(',')+')';
    }
});
Geometrize.Polygon = Polygon;

// 2D Rect class
var Rect = makeClass(Polygon, {
    constructor: function Rect(top, width, height) {
        var self = this, topLeft, bottomRight;
        if (top instanceof Rect) return top;
        if (!(self instanceof Rect)) return new Rect(top, width, height);
        topLeft = Point(top);
        if (is_numeric(width) && is_numeric(height))
        {
            bottomRight = new Point(topLeft.x + Num(width), topLeft.y + Num(height));
        }
        else
        {
            bottomRight = Point(width);
        }
        self.$super('constructor', [[topLeft, new Point(bottomRight.x, topLeft.y), bottomRight, new Point(topLeft.x, bottomRight.y)]]);

        def(self, 'topLeft', {
            get: function() {
                return self.points[0];
            },
            set: function(topLeft) {
                self.points[0] = topLeft;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'bottomRight', {
            get: function() {
                return self.points[2];
            },
            set: function(bottomRight) {
                self.points[2] = bottomRight;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'width', {
            get: function() {
                return abs(self.bottomRight.x - self.topLeft.x);
            },
            set: function(width) {
                self.bottomRight.x = self.topLeft.x + Num(width);
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'height', {
            get: function() {
                return abs(self.bottomRight.y - self.topLeft.y);
            },
            set: function(height) {
                self.bottomRight.y = self.topLeft.y + Num(height);
            },
            enumerable: true,
            configurable: false
        });
    }
});
Geometrize.Rect = Rect;
