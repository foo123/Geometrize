// 2D Circle class
var Circle = makeClass(Curve, {
    constructor: function Circle(center, radius) {
        var self = this,
            _radius = null,
            _length = null,
            _area = null,
            _bbox = null,
            _hull = null
        ;

        if (center instanceof Circle) return center;
        if (!(self instanceof Circle)) return new Circle(center, radius);
        _radius = stdMath.abs(Num(radius));
        Curve.call(self, [center]);

        Object.defineProperty(self, 'center', {
            get() {
                return self.points[0];
            },
            set(center) {
                self.points[0] = center;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'radius', {
            get() {
                return _radius;
            },
            set(radius) {
                radius = stdMath.abs(Num(radius));
                if (_radius !== radius)
                {
                    var isDirty = false;
                    if (!is_almost_equal(_radius, radius))
                    {
                        isDirty = true;
                    }
                    _radius = radius;
                    if (isDirty)
                    {
                        if (!self.isDirty())
                        {
                            self.isDirty(true);
                            self.triggerChange();
                        }
                    }
                }
            },
            enumerable: true
        });
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    _length = 2 * stdMath.PI * _radius;
                }
                return _length;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'area', {
            get() {
                if (null == _area)
                {
                    _area = stdMath.PI * _radius * _radius;
                }
                return _area;
            },
            enumerable: true
        });
        Object.defineProperty(self, '_bbox', {
            get() {
                if (null == _bbox)
                {
                    var c = self.center, r = _radius;
                    _bbox = {
                        top: c.y - r,
                        left: c.x - r,
                        bottom: c.y + r,
                        right: c.x + r
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
                    var c = self.center, r = _radius;
                    _hull = [
                        new Point(c.x-r, c.y-r),
                        new Point(c.x+r, c.y-r),
                        new Point(c.x+r, c.y+r),
                        new Point(c.x-r, c.y+r)
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
                _area = null;
                _bbox = null;
                _hull = null;
            }
            return self.$super.isDirty.apply(self, arguments);
        };
    },
    clone: function() {
        return new Circle(this.center.clone(), this.radius);
    },
    transform: function(matrix) {
        var c = this.center,
            r = this.radius,
            ct = c.transform(matrix),
            p = new Point(c.x+r, c.y).transform(matrix)
        ;
        return new Circle(ct, dist(ct, pt));
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
    getPoint: function(t) {
        t = Num(t);
        if (0 > t || 1 < t) return null;
        var c = this.center, r = this.radius;
        return new Point(
            c.x + r*stdMath.cos(t*2*stdMath.PI),
            c.y + r*stdMath.sin(t*2*stdMath.PI)
        );
    },
    hasPoint: function(point, notInside) {
        var center = this.center,
            radius2 = this.radius*this.radius,
            dx = point.x - center.x,
            dy = point.y - center.y,
            d = dx*dx + dy*dy
        ;
        return notInside ? is_almost_equal(d, radius2) : d <= radius2;
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? other : false;
        }
        else if (other instanceof Line)
        {
            return line_circle_intersection(other.start, other.end, this.center, this.radius);
        }
        else if (other instanceof Polyline)
        {
        }
        else if (other instanceof Circle)
        {
            return circle_circle_intersection(other.center, other.radius, this.center, this.radius);
        }
        else if ((other instanceof Primitive) && is_function(other.intersects))
        {
            return other.intersects(this);
        }
        return false;
    },
    toTex: function() {
        return '\\text{Circle:}'+'(x - '+Str(this.center.x)+')^2 + (y - '+Str(this.center.y)+')^2 = '+Str(this.radius)+'^2';
    },
    toString: function() {
        return 'Circle('+[Str(this.center), Str(this.radius)].join(',')+')';
    }
});
