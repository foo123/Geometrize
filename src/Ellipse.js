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
        _cos = stdMath.cos(_angle.val());
        _sin = stdMath.sin(_angle.val());

        superCall(Curve, self)([center], {radiusX:_radiusX, radiusY:_radiusY, angle:_angle});

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
                _cos = stdMath.cos(_angle.val());
                _sin = stdMath.sin(_angle.val());
                if (_angle.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'sincos', {
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
                    _length = PI * (3*(_radiusX.val()+_radiusY.val())-stdMath.sqrt((3*_radiusX.val()+_radiusY.val())*(_radiusX.val()+3*_radiusY.val())));
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
                        top: stdMath.min(ch[0].y,ch[1].y,ch[2].y,ch[3].y),
                        left: stdMath.min(ch[0].x,ch[1].x,ch[2].x,ch[3].x),
                        bottom: stdMath.max(ch[0].y,ch[1].y,ch[2].y,ch[3].y),
                        right: stdMath.max(ch[0].x,ch[1].x,ch[2].x,ch[3].x)
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
                    var c = self.center, rX = _radiusX.val(), rX = _radiusY.val(),
                        m = new Matrix(
                            _cos, -_sin, c.x,
                            _sin, _cos, c.y,
                            0, 0, 1
                        );
                    _hull = [
                        new Point(-rX, -rY).transform(m),
                        new Point(rX, -rY).transform(m),
                        new Point(rX, rY).transform(m),
                        new Point(-rX, rY).transform(m)
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
            return Curve.prototype.isChanged.apply(self, arguments);
        };
    },
    clone: function() {
        return new Ellipse(this.center.clone(), this.radiusX, this.radiusY, this.angle);
    },
    transform: function(matrix) {
        var c = this.center,
            rX = this.radiusX,
            rY = this.radiusY,
            a = this.angle,
            t = matrix.getTranslation(),
            r = matrix.getRotationAngle(),
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
        var c = this.center,
            rX = this.radiusX,
            rY = this.radiusY,
            cs = this.sincos,
            ct = stdMath.cos(t*TWO_PI),
            st = stdMath.sin(t*TWO_PI)
        ;
        return {
            x: c.x + rX*cs[0]*ct - rY*cs[1]*st,
            y: c.y + rY*cs[0]*st + rX*cs[1]*ct
        };
    },
    getPointAt: function(t) {
        t = Num(t);
        return 0 > t || 1 < t ? null : Point(this.f(t));
    },
    hasPoint: function(point) {
        return 2 === point_inside_ellipse(point, this.center, this.radiusX, this.radiusY, this.sincos);
    },
    hasInsidePoint: function(point, strict) {
        var inside = point_inside_ellipse(point, this.center, this.radiusX, this.radiusY, this.sincos);
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
            i = curve_circle_intersection(this._lines, other.center, other.radius);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Ellipse)
        {
            i = curve_ellipse_intersection(this._lines, other.center, other.radiusX, other.radiusY, other.angle, other.sincos);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(this);
        }
        return false;
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
            'transform': ['rotate('+Str(deg(a))+' '+Str(c.x)+' '+Str(c.y)+')', this.center.isChanged() || this.values.angle.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function() {
        var c = this.center, rX = this.radiusX, rY = this.radiusY, a = this.angle;
        return 'M '+Str(c.x - rX)+' '+Str(c.y)+' a '+Str(rX)+' '+Str(rY)+' '+Str(/*a*/0)+' 0 0 '+Str(rX + rX)+' 0 a '+Str(rX)+' '+Str(rY)+' '+Str(/*a*/0)+' 0 0 '+Str(-rX - rX)+' 0 z';
    },
    toTex: function() {
        var a = Str(deg(this.angle))+'\\text{°}',
            c = this.center,
            cX = (0 <= c.x ? '-' : '+')+Str(stdMath.abs(c.x)),
            cY = (0 <= c.y ? '-' : '+')+Str(stdMath.abs(c.y)),
            rX = Str(this.radiusX), rY = Str(this.radiusY);
        return '\\text{Ellipse: }\\left|\\begin{pmatrix}\\cos('+a+')&-\\sin('+a+')\\\\sin('+a+')&\\cos('+a+')\\end{pmatrix}\\begin{pmatrix}\\frac{x'+cX+'}{'+rX+'}\\\\\\frac{y'+cY+'}{'+rY+'}\\end{pmatrix}\\right|^2 = 1';
    },
    toString: function() {
        return 'Ellipse('+[Str(this.center), Str(this.radiusX), Str(this.radiusY), Str(deg(this.angle))+'°'].join(',')+')';
    }
});
