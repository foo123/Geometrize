// 2D Polygon class
// defined by vertices as a closed polyline
var Polygon = makeClass(Curve, {
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
                    _bbox = {
                        ymin: Infinity,
                        xmin: Infinity,
                        ymax: -Infinity,
                        xmax: -Infinity
                    };
                    for (var i=0,p=self._points,n=p.length; i<n; ++i)
                    {
                        _bbox.ymin = stdMath.min(_bbox.ymin, p[i].y);
                        _bbox.ymax = stdMath.max(_bbox.ymax, p[i].y);
                        _bbox.xmin = stdMath.min(_bbox.xmin, p[i].x);
                        _bbox.xmax = stdMath.max(_bbox.xmax, p[i].x);
                    }
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
                    _hull = convex_hull(self._points).map(Point);
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
    hasPoint: function(point) {
        return 2 === point_inside_polyline(point, {x:this._bbox.xmax+10, y:point.y}, this._lines);
    },
    hasInsidePoint: function(point, strict) {
        var inside = point_inside_polyline(point, {x:this._bbox.xmax+10, y:point.y}, this._lines);
        return strict ? 1 === inside : 0 < inside;
    },
    f: function(t) {
        var p = this._lines, n = p.length - 1, i = stdMath.floor(t*n);
        return 1 === t ? {x:p[n].x, y:p[n].y} : bezier1(n*(t - i/n), [p[i], p[i+1]]);
    },
    intersects: function(other) {
        var i;
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Line)
        {
            i = polyline_line_intersection(this._lines, other._points[0], other._points[1]);
            return i ? i.map(Point) : false;
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
        else if (other instanceof Bezier3)
        {
            i = polyline_cbezier_intersection(this._lines, other._points);
            return i ? i.map(Point) : false;
        }
        else if ((other instanceof Polyline) || (other instanceof Polygon))
        {
            i = polyline_polyline_intersection(this._lines, other._lines);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(this);
        }
        return false;
    },
    bezierPoints: function() {
        var p = this._lines, n = p.length;
        return p.reduce(function(b, _, i) {
            if (i+1 < n)
            {
                var pp = [p[i], p[i+1]];
                b.push([bezier1(0, pp), bezier1(0.5, pp), bezier1(0.5, pp), bezier1(1, pp)]);
            }
            return b;
        }, []);
    },
    toSVG: function(svg) {
        return SVG('polygon', {
            'id': [this.id, false],
            'points': [this._points.map(function(p) {return Str(p.x)+' '+Str(p.y);}).join(' '), this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var path = 'M '+(this._lines.map(function(p) {
            return Str(p.x)+' '+Str(p.y);
        }).join(' L '))+' Z';
        return arguments.length ? SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        this.style.toCanvas(ctx);
        ctx.beginPath();
        this.toCanvasPath(ctx);
        ctx.closePath();
        if ('none' !== this.style['fill']) ctx.fill();
        ctx.stroke();
    },
    toCanvasPath: function(ctx) {
        var p = this._lines, n = p.length;
        ctx.moveTo(p[0].x, p[0].y);
        for (var i=1; i<n; ++i) ctx.lineTo(p[i].x, p[i].y);
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
