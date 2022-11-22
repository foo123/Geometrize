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
        _radius = new Value(stdMath.abs(Num(radius)));
        Curve.call(self, [center], {radius:_radius});

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
                return _radius.val();
            },
            set(radius) {
                _radius.val(stdMath.abs(Num(radius)));
                if (_radius.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true
        });
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    _length = 2 * stdMath.PI * _radius.val();
                }
                return _length;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'area', {
            get() {
                if (null == _area)
                {
                    _area = stdMath.PI * _radius.val() * _radius.val();
                }
                return _area;
            },
            enumerable: true
        });
        Object.defineProperty(self, '_bbox', {
            get() {
                if (null == _bbox)
                {
                    var c = self.center, r = _radius.val();
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
                    var c = self.center, r = _radius.val();
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
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _length = null;
                _area = null;
                _bbox = null;
                _hull = null;
            }
            return self.$super.isChanged.apply(self, arguments);
        };
    },
    clone: function() {
        return new Circle(this.center.clone(), this.radius);
    },
    transform: function(matrix) {
        var c = this.center,
            r = this.radius,
            ct = c.transform(matrix),
            pt = new Point(c.x+r, c.y).transform(matrix)
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
    getPointAt: function(t) {
        t = Num(t);
        if (0 > t || 1 < t) return null;
        var c = this.center, r = this.radius;
        t = t*2*stdMath.PI;
        return new Point(
            c.x + r*stdMath.cos(t),
            c.y + r*stdMath.sin(t)
        );
    },
    getAtOfPoint: function(p) {
        var theta = stdMath.atan2(p.y - this.center.y, p.x - this.center.x);
        if (0 > theta) theta += 2*stdMath.PI;
        return theta / (2*stdMath.PI);
    },
    hasPoint: function(point) {
        return 2 === point_inside_circle(point, this.center, this.radius);
    },
    hasInsidePoint: function(point, strict) {
        var inside = point_inside_circle(point, this.center, this.radius);
        return strict ? 1 === inside : 0 < inside;
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Circle)
        {
            return quadratic_quadratic_intersection(this, other);
        }
        else if ((other instanceof Primitive) && is_function(other.intersects))
        {
            return other.intersects(this);
        }
        return false;
    },
    toSVG: function(svg) {
        return SVG('circle', {
            'id': this.id,
            'cx': this.center.x,
            'cy': this.center.y,
            'r': this.radius,
            'transform': this.matrix.toSVG(),
            'style': this.style.toSVG()
        }, arguments.length ? svg : false, {
            'id': false,
            'cx': this.center.isChanged(),
            'cy': this.center.isChanged(),
            'r': this.values.radius.isChanged(),
            'transform': this.isChanged(),
            'style': this.style.isChanged()
        });
    },
    toTex: function() {
        return '\\text{Circle:}'+'\\frac{(x - '+Str(this.center.x)+')^2 + (y - '+Str(this.center.y)+')^2}{'+Str(this.radius)+'^2} = 1';
    },
    toString: function() {
        return 'Circle('+[Str(this.center), Str(this.radius)].join(',')+')';
    }
});
