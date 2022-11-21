// 2D Polygon class
// defined by vertices as a closed polyline
var Polygon = makeClass(Curve, {
    constructor: function Polygon(vertices) {
        var self = this,
            _length = null,
            _area = null,
            _bbox = null,
            _hull = null
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
                    _length = 0;
                    for (var i=0,v=self.points,n=v.length; i<n; ++i)
                    {
                        _length += dist(v[i], v[(i+1) % n]);
                    }
                }
                return _length;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'area', {
            get() {
                if (null == _area)
                {
                    _area = 0;
                    for (var i=0,v=self.points,n=v.length; i<n; ++i)
                    {
                        // shoelace formula
                        _area += v[i].cross(v[(i+1) % n]) / 2;
                    }
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
                    for (var i=0,p=self.points,n=p.length; i+1<n; ++i)
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
        self.isDirty = function(isDirty) {
            if (true === isDirty)
            {
                _length = null;
                _area = null;
                _bbox = null;
                _hull = null;
            }
            return self.$super.isDirty.apply(self, arguments);
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
    getBoundingBox: function() {
        return this._bbox;
    },
    getConvexHull: function() {
        return this._hull;
    },
    toSVG: function(svg) {
        return SVG('polygon', {
            'id': this.id,
            'points': this.points.map(function(p) {return Str(p.x)+','+Str(p.y);}).join(' '),
            'transform': this.matrix.toSVG(),
            'style': this.style.toSVG()
        }, arguments.length ? svg : false, {
            'id': false,
            'points': this.isDirty(),
            'transform': this.isDirty(),
            'style': this.style.isDirty()
        });
    },
    toTex: function() {
        return '\\text{Polygon:}'+'\left( ' + this.vertices.map(Tex).join(',') + ' \right)';
    },
    toString: function() {
        return 'Polygon('+this.vertices.map(Str).join(',')+')';
    }
});
