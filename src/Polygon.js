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
        Curve.call(self, vertices);

        Object.defineProperty(self, 'vertices', {
            get() {
                return self.points;
            },
            set(vertices) {
                self.points = vertices;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'edges', {
            get() {
                var v = self.points;
                return 1 < v.length ? v.map(function(vertex, i) {
                    return new Line(vertex, v[(i+1) % v.length]);
                }) : [];
            },
            enumerable: true
        });
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    _length = curve_length(self.points.concat([self.points[0]]));
                }
                return _length;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'area', {
            get() {
                if (null == _area)
                {
                    _area = curve_area(self.points.concat([self.points[0]]));
                }
                return _area;
            },
            enumerable: true
        });
        Object.defineProperty(self, '_bbox', {
            get() {
                if (null == _bbox)
                {
                    _bbox = {
                        top: Infinity,
                        left: Infinity,
                        bottom: -Infinity,
                        right: -Infinity
                    };
                    for (var i=0,p=self.points,n=p.length; i<n; ++i)
                    {
                        _bbox.top = stdMath.min(_bbox.top, p[i].y);
                        _bbox.bottom = stdMath.max(_bbox.bottom, p[i].y);
                        _bbox.left = stdMath.min(_bbox.left, p[i].x);
                        _bbox.right = stdMath.max(_bbox.right, p[i].x);
                    }
                }
                return _bbox;
            },
            enumerable: false
        });
        Object.defineProperty(self, '_hull', {
            get() {
                if (null == _hull)
                {
                    _hull = convex_hull(self.points);
                }
                return _hull;
            },
            enumerable: false
        });
        Object.defineProperty(self, '_is_convex', {
            get() {
                if (null == _is_convex)
                {
                    _is_convex = is_convex(self.points);
                }
                return _is_convex;
            },
            enumerable: false
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
            return self.$super.isChanged.apply(self, arguments);
        };
    },
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
    getBoundingBox: function() {
        return this._bbox;
    },
    getConvexHull: function() {
        return this._hull;
    },
    hasPoint: function(point) {
        return 2 === point_inside_curve(point, {x:this._bbox.right+1, y:point.y}, this.points.concat([this.points[0]]));
    },
    hasInsidePoint: function(point, strict) {
        var inside = point_inside_curve(point, {x:this._bbox.right+1, y:point.y}, this.points.concat([this.points[0]]));
        return strict ? 1 === inside : 0 < inside;
    },
    intersects: function(other) {
        var p;
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Line)
        {
            p = curve_lines_intersection(this.points.concat([this.points[0]]), [other.start, other.end]);
            return p ? p.map(Point) : false;
        }
        else if (other instanceof Polyline)
        {
            p = curve_lines_intersection(this.points.concat([this.points[0]]), other.points);
            return p ? p.map(Point) : false;
        }
        else if (other instanceof Polygon)
        {
            p = curve_lines_intersection(this.points.concat([this.points[0]]), other.points.concat([other.points[0]]));
            return p ? p.map(Point) : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(this);
        }
        return false;
    },
    toSVG: function(svg) {
        return SVG('polygon', {
            'id': [this.id, false],
            'points': [this.points.map(function(p) {return Str(p.x)+','+Str(p.y);}).join(' '), this.isChanged()],
            'transform': [this.matrix.toSVG(), this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function() {
        return 'M '+(this.points.concat([this.points[0]]).map(function(p) {
            return Str(p.x)+' '+Str(p.y);
        }).join(' L '))+' z';
    },
    toTex: function() {
        return '\\text{Polygon: }'+'\\left(' + this.vertices.map(Tex).join(',') + '\\right)';
    },
    toString: function() {
        return 'Polygon('+this.vertices.map(Str).join(',')+')';
    }
});
