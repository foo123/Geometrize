/**[DOC_MD]
 * ### 2D Circle (subclass of EllipticArc2D)
 *
 * Represents a circle of given center (point) and radius
 * ```javascript
 * const circle = Circle(center, radius);
 * circle.center.x += 10; // change it
 * circle.radius = 12; // change it
 * ```
[/DOC_MD]**/
var Circle = makeClass(EllipticArc2D, {
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
        self.$super('constructor', [[center], {radius:_radius}]);

        def(self, 'center', {
            get: function() {
                return self.points[0];
            },
            set: function(center) {
                self.points[0] = center;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'radius', {
            get: function() {
                return _radius.val();
            },
            set: function(radius) {
                _radius.val(stdMath.abs(Num(radius)));
                if (_radius.isChanged() /*&& !self.isChanged()*/)
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'radiusX', {
            get: function() {
                return self.radius;
            },
            set: function(r) {
                self.radius = r;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'radiusY', {
            get: function() {
                return self.radius;
            },
            set: function(r) {
                self.radius = r;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'rX', {
            get: function() {
                return self.radius;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'rY', {
            get: function() {
                return self.radius;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'angle', {
            get: function() {
                return 0;
            },
            set: function(angle) {
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'theta', {
            get: function() {
                return 0;
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'dtheta', {
            get: function() {
                return TWO_PI;
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'cs', {
            get: function() {
                return [1, 0];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    _length = TWO_PI * _radius.val();
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
                    _area = PI * _radius.val() * _radius.val();
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
                    var c = self.center, r = _radius.val();
                    _bbox = {
                        ymin: c.y - r,
                        xmin: c.x - r,
                        ymax: c.y + r,
                        xmax: c.x + r
                    };
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
                _area = null;
                _bbox = null;
                _hull = null;
            }
            return self.$super('isChanged', arguments);
        };
    },
    name: 'Circle',
    clone: function() {
        var self = this;
        return new Circle(self.center.clone(), self.radius);
    },
    transform: function(matrix) {
        var self = this,
            c = self.center,
            r = self.radius,
            ct = c.transform(matrix),
            pt = new Point2D(c.x+r, c.y+r).transform(matrix)
        ;
        return new Circle(ct, dist(ct, pt));
    },
    isClosed: function() {
        return true;
    },
    intersects: function(other) {
        var self = this;
        if (other instanceof Point2D)
        {
            return self.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Circle)
        {
            var i = circle_circle_intersection(self.center, self.radius, other.center, other.radius);
            return i ? i.map(Point2D) : false;
        }
        else if (other instanceof Object2D)
        {
            return other.intersects(self);
        }
        return false;
    },
    toSVG: function(svg) {
        var self = this, c = self.center, r = self.radius;
        return SVG('circle', {
            'id': [self.id, false],
            'cx': [c.x, self.center.isChanged()],
            'cy': [c.y, self.center.isChanged()],
            'r': [r, self.values.radius.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, c = self.center, r = self.radius,
            path = ['M',c.x - r,c.y,'A',r,r,0,0,0,c.x + r,c.y,'A',r,r,0,0,0,c.x - r,c.y,'Z'].join(' ');
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
        var self = this, c = self.center, r = self.radius;
        ctx.beginPath();
        ctx.arc(c.x, c.x, r, 0, TWO_PI);
        ctx.closePath();
    },
    toTex: function() {
        var self = this, c = self.center, r = Str(self.radius);
        return '\\text{Circle: }\\left|\\begin{pmatrix}\\frac{x'+signed(-c.x)+'}{'+r+'}\\\\\\frac{y'+signed(-c.y)+'}{'+r+'}\\end{pmatrix}\\right|^2 = 1';
    },
    toString: function() {
        var self = this;
        return 'Circle('+[Str(self.center), Str(self.radius)].join(',')+')';
    }
});
Geometrize.Circle = Circle;
