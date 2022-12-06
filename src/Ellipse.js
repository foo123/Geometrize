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
                    var ch = self._hull;
                    _bbox = {
                        ymin: stdMath.min(ch[0].y,ch[1].y,ch[2].y,ch[3].y),
                        xmin: stdMath.min(ch[0].x,ch[1].x,ch[2].x,ch[3].x),
                        ymax: stdMath.max(ch[0].y,ch[1].y,ch[2].y,ch[3].y),
                        xmax: stdMath.max(ch[0].x,ch[1].x,ch[2].x,ch[3].x)
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
        return new Ellipse(this.center.clone(), this.radiusX, this.radiusY, this.angle);
    },
    transform: function(matrix) {
        var c = this.center,
            rX = this.radiusX,
            rY = this.radiusY,
            a = this.angle,
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
    getBoundingBox: function() {
        return this._bbox;
    },
    getConvexHull: function() {
        return this._hull;
    },
    f: function(t) {
        var c = this.center, cs = this.cs,
            rx = this.radiusX, ry = this.radiusY;
        return arc(t*TWO_PI, c.x, c.y, rx, ry, cs[0], cs[1]);
    },
    getPointAt: function(t) {
        t = Num(t);
        return 0 > t || 1 < t ? null : Point(this.f(t));
    },
    hasPoint: function(point) {
        return 2 === point_inside_ellipse(point, this.center, this.radiusX, this.radiusY, this.cs);
    },
    hasInsidePoint: function(point, strict) {
        var inside = point_inside_ellipse(point, this.center, this.radiusX, this.radiusY, this.cs);
        return strict ? 1 === inside : 0 < inside;
    },
    intersects: function(other) {
        var i;
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Circle)
        {
            i = polyline_circle_intersection(this._lines, other.center, other.radius);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Ellipse)
        {
            i = polyline_ellipse_intersection(this._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(this);
        }
        return false;
    },
    bezierPoints: function() {
        var c = this.center, cs = this.cs,
            cos = cs[0], sin = cs[1],
            rx = this.radiusX, ry = this.radiusY;
        return [
        arc2bezier(0, -PI/2, c.x, c.y, rx, ry, cos, sin, 0),
        arc2bezier(-PI/2, -PI/2, c.x, c.y, rx, ry, cos, sin, /*1*/0),
        arc2bezier(-PI, -PI/2, c.x, c.y, rx, ry, cos, sin, 0),
        arc2bezier(-3*PI/2, -PI/2, c.x, c.y, rx, ry, cos, sin, /*1*/0)
        ];
    },
    toSVG: function(svg) {
        var c = this.center,
            rX = this.radiusX,
            rY = this.radiusY,
            a = this.angle;
        return SVG('ellipse', {
            'id': [this.id, false],
            'cx': [c.x, this.center.isChanged()],
            'cy': [c.y, this.center.isChanged()],
            'rx': [rX, this.values.radiusX.isChanged()],
            'ry': [rY, this.values.radiusY.isChanged()],
            'transform': ['rotate('+Str(a)+' '+Str(c.x)+' '+Str(c.y)+')', this.center.isChanged() || this.values.angle.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var c = this.center, rX = this.radiusX, rY = this.radiusY, a = this.angle,
            p1 = this.f(0), p2 = this.f(0.5),
            path = 'M '+Str(p1.x)+' '+Str(p1.y)+' A '+Str(rX)+' '+Str(rY)+' '+Str(a)+' 0 1 '+Str(p2.x)+' '+Str(p2.y)+' A '+Str(rX)+' '+Str(rY)+' '+Str(a)+' 0 1 '+Str(p1.x)+' '+Str(p1.y)+' z';
        return arguments.length ? SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var c = this.center, rx = this.radiusX, ry = this.radiusY, a = rad(this.angle);
        ctx.beginPath();
        ctx.lineWidth = this.style['stroke-width'];
        ctx.fillStyle = this.style['fill'];
        ctx.strokeStyle = this.style['stroke'];
        ctx.ellipse(c.x, c.x, rx, ry, a, 0, TWO_PI);
        if ('none' !== this.style['fill']) ctx.fill();
        ctx.stroke();
        //ctx.closePath();
    },
    toTex: function() {
        var a = Str(this.angle)+'\\text{°}',
            c = this.center, rX = Str(this.radiusX), rY = Str(this.radiusY);
        return '\\text{Ellipse: }\\left|\\begin{pmatrix}\\cos('+a+')&-\\sin('+a+')\\\\sin('+a+')&\\cos('+a+')\\end{pmatrix}\\begin{pmatrix}\\frac{x'+signed(-c.x)+'}{'+rX+'}\\\\\\frac{y'+signed(-c.y)+'}{'+rY+'}\\end{pmatrix}\\right|^2 = 1';
    },
    toString: function() {
        return 'Ellipse('+[Str(this.center), Str(this.radiusX), Str(this.radiusY), Str(this.angle)+'°'].join(',')+')';
    }
});
Geometrize.Ellipse = Ellipse;
