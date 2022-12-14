// 2D Ellipse class
var Ellipse = makeClass(Curve, {
    constructor: function Ellipse(center, radiusX, radiusY, angle) {
        var self = this,
            _radiusX = null,
            _radiusY = null,
            _angle = null,
            _cos = 0,
            _sin = 0,
            _length = null,
            _area = null,
            _bbox = null,
            _hull = null
        ;

        if (center instanceof Ellipse) return center;
        if (!(self instanceof Ellipse)) return new Ellipse(center, radiusX, radiusY, angle);
        _radiusX = new Value(stdMath.abs(Num(radiusX)));
        _radiusY = new Value(stdMath.abs(Num(radiusY)));
        _angle = new Value(angle);
        _cos = stdMath.cos(rad(_angle.val()));
        _sin = stdMath.sin(rad(_angle.val()));

        self.$super('constructor', [[center], {radiusX:_radiusX, radiusY:_radiusY, angle:_angle}]);

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
        def(self, 'radiusX', {
            get: function() {
                return _radiusX.val();
            },
            set: function(radiusX) {
                _radiusX.val(stdMath.abs(Num(radiusX)));
                if (_radiusX.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'radiusY', {
            get: function() {
                return _radiusY.val();
            },
            set: function(radiusY) {
                _radiusY.val(stdMath.abs(Num(radiusY)));
                if (_radiusY.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'angle', {
            get: function() {
                return _angle.val();
            },
            set: function(angle) {
                _angle.val(angle);
                _cos = stdMath.cos(rad(_angle.val()));
                _sin = stdMath.sin(rad(_angle.val()));
                if (_angle.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'cs', {
            get: function() {
                return [_cos, _sin];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    // approximate
                    _length = PI * (3*(_radiusX.val()+_radiusY.val())-sqrt((3*_radiusX.val()+_radiusY.val())*(_radiusX.val()+3*_radiusY.val())));
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
                    _area = PI * _radiusX.val() * _radiusY.val();
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
                    var c = self.center,
                        rx = _radiusX.val(), ry = _radiusY.val(),
                        tan = stdMath.tan(rad(self.angle)),
                        p1, p2, p3, p4, t
                    ;
                    // find min/max from zeroes of directional derivative along x and y
                    // along x axis
                    t = stdMath.atan2(-ry*tan, rx);
                    p1 = arc(t, c.x, c.y, rx, ry, _cos, _sin);
                    p2 = arc(t + PI, c.x, c.y, rx, ry, _cos, _sin);
                    // along y axis
                    t = stdMath.atan2(ry, rx*tan);
                    p3 = arc(t, c.x, c.y, rx, ry, _cos, _sin);
                    p4 = arc(t + PI, c.x, c.y, rx, ry, _cos, _sin);
                    _bbox = {
                        ymin: stdMath.min(p3.y, p4.y),
                        xmin: stdMath.min(p1.x, p2.x),
                        ymax: stdMath.max(p3.y, p4.y),
                        xmax: stdMath.max(p1.x, p2.x)
                    };
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
                    var c = self.center, rx = _radiusX.val(), ry = _radiusY.val();
                    _hull = [
                        new Point(toarc(-1, -1, c.x, c.y, rx, ry, _cos, _sin)),
                        new Point(toarc(1, -1, c.x, c.y, rx, ry, _cos, _sin)),
                        new Point(toarc(1, 1, c.x, c.y, rx, ry, _cos, _sin)),
                        new Point(toarc(-1, 1, c.x, c.y, rx, ry, _cos, _sin))
                    ];
                }
                return _hull;
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
    name: 'Ellipse',
    clone: function() {
        var self = this;
        return new Ellipse(self.center.clone(), self.radiusX, self.radiusY, self.angle);
    },
    transform: function(matrix) {
        var self = this,
            c = self.center,
            rX = self.radiusX,
            rY = self.radiusY,
            a = self.angle,
            t = matrix.getTranslation(),
            r = deg(matrix.getRotationAngle()),
            s = matrix.getScale()
        ;
        return new Ellipse(
            new Point(c.x + t.x, c.y + t.y),
            rX * s.x,
            rY * s.y,
            a + r
        );
    },
    isClosed: function() {
        return true;
    },
    isConvex: function() {
        return true;
    },
    hasMatrix: function() {
        return false;
    },
    f: function(t) {
        var self = this, c = self.center, cs = self.cs;
        return arc(t*TWO_PI, c.x, c.y, self.radiusX, self.radiusY, cs[0], cs[1]);
    },
    d: function() {
        var self = this;
        return new Ellipse(
            self.center,
            self.radiusY,
            self.radiusX,
            -self.angle
        );
    },
    hasPoint: function(point) {
        var self = this;
        return 2 === point_inside_ellipse(point, self.center, self.radiusX, self.radiusY, self.cs);
    },
    hasInsidePoint: function(point, strict) {
        var self = this, inside = point_inside_ellipse(point, self.center, self.radiusX, self.radiusY, self.cs);
        return strict ? 1 === inside : 0 < inside;
    },
    intersects: function(other) {
        var self = this, i;
        if (other instanceof Point)
        {
            return self.hasPoint(other) ? [other] : false;
        }
        else if (Geometrize.Circle && (other instanceof Geometrize.Circle))
        {
            i = polyline_circle_intersection(self._lines, other.center, other.radius);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Ellipse)
        {
            i = polyline_ellipse_intersection(self._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(self);
        }
        return false;
    },
    bezierPoints: function() {
        var self = this, c = self.center, cs = self.cs,
            cos = cs[0], sin = cs[1],
            rx = self.radiusX, ry = self.radiusY;
        return [
        arc2bezier(0, -HALF_PI, c.x, c.y, rx, ry, cos, sin/*, 0*/),
        arc2bezier(-HALF_PI, -HALF_PI, c.x, c.y, rx, ry, cos, sin/*, 1*/),
        arc2bezier(-PI, -HALF_PI, c.x, c.y, rx, ry, cos, sin/*, 0*/),
        arc2bezier(-PI3_2, -HALF_PI, c.x, c.y, rx, ry, cos, sin/*, 1*/)
        ];
    },
    toSVG: function(svg) {
        var self = this,
            c = self.center,
            rX = self.radiusX,
            rY = self.radiusY,
            a = self.angle;
        return SVG('ellipse', {
            'id': [self.id, false],
            'cx': [c.x, self.center.isChanged()],
            'cy': [c.y, self.center.isChanged()],
            'rx': [rX, self.values.radiusX.isChanged()],
            'ry': [rY, self.values.radiusY.isChanged()],
            'transform': ['rotate('+Str(a)+' '+Str(c.x)+' '+Str(c.y)+')', self.center.isChanged() || self.values.angle.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, rx = self.radiusX, ry = self.radiusY, a = self.angle,
            p1 = self.f(0), p2 = self.f(0.5),
            path = ['M',p1.x,p1.y,'A',rx,ry,a,0,1,p2.x,p2.y,'A',rx,ry,a,0,1,p1.x,p1.y,'Z'].join(' ');
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
        var self = this, c = self.center, rx = self.radiusX, ry = self.radiusY, a = rad(self.angle);
        ctx.beginPath();
        ctx.ellipse(c.x, c.x, rx, ry, a, 0, TWO_PI);
        ctx.closePath();
    },
    toTex: function() {
        var self = this, a = Str(self.angle)+'\\text{°}',
            c = self.center, rX = Str(self.radiusX), rY = Str(self.radiusY);
        return '\\text{Ellipse: }\\left|\\begin{pmatrix}\\cos('+a+')&-\\sin('+a+')\\\\sin('+a+')&\\cos('+a+')\\end{pmatrix}\\begin{pmatrix}\\frac{x'+signed(-c.x)+'}{'+rX+'}\\\\\\frac{y'+signed(-c.y)+'}{'+rY+'}\\end{pmatrix}\\right|^2 = 1';
    },
    toString: function() {
        var self = this;
        return 'Ellipse('+[Str(self.center), Str(self.radiusX), Str(self.radiusY), Str(self.angle)+'°'].join(',')+')';
    }
});
Geometrize.Ellipse = Ellipse;
