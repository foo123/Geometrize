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

        Curve.call(self, [center], {radiusX:_radiusX, radiusY:_radiusY, angle:_angle});

        Object.defineProperty(self, 'center', {
            get() {
                return self.points[0];
            },
            set(center) {
                self.points[0] = center;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'radiusX', {
            get() {
                return _radiusX.val();
            },
            set(radiusX) {
                _radiusX.val(stdMath.abs(Num(radiusX)));
                if (_radiusX.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true
        });
        Object.defineProperty(self, 'radiusY', {
            get() {
                return _radiusY.val();
            },
            set(radiusY) {
                _radiusY.val(stdMath.abs(Num(radiusY)));
                if (_radiusY.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true
        });
        Object.defineProperty(self, 'angle', {
            get() {
                return _angle.val();
            },
            set(angle) {
                _angle.val(angle);
                _cos = stdMath.cos(_angle.val());
                _sin = stdMath.sin(_angle.val());
                if (_angle.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true
        });
        Object.defineProperty(self, 'sincos', {
            get() {
                return [_cos, _sin];
            },
            enumerable: false
        });
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    // approximate
                    _length = PI * (3*(_radiusX.val()+_radiusY.val())-stdMath.sqrt((3*_radiusX.val()+_radiusY.val())*(_radiusX.val()+3*_radiusY.val())));
                }
                return _length;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'area', {
            get() {
                if (null == _area)
                {
                    _area = PI * _radiusX.val() * _radiusY.val();
                }
                return _area;
            },
            enumerable: true
        });
        Object.defineProperty(self, '_bbox', {
            get() {
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
            enumerable: false
        });
        Object.defineProperty(self, '_hull', {
            get() {
                if (null == _hull)
                {
                    var c = self.center, rX = _radiusX.val(), rX = _radiusY.val(),
                        m = Matrix.translate(c.x, c.y).mul(new Matrix(
                            _cos, -_sin, 0,
                            _sin, _cos, 0,
                            0, 0, 1
                        ));
                    _hull = [
                        new Point(-rX, -rY).transform(m),
                        new Point(rX, -rY).transform(m),
                        new Point(rX, rY).transform(m),
                        new Point(-rX, rY).transform(m)
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
        return new Ellipse(this.center.clone(), this.radiusX, this.radiusY, this.angle);
    },
    transform: function(matrix) {
        var c = this.center,
            rX = this.radiusX,
            rY = this.radiusY,
            a = this.angle,
            ct = c.transform(matrix),
            pX = new Point(rX, 0).transform(matrix),
            pY = new Point(0, rY).transform(matrix),
        ;
        return new Ellipse(ct, hypot(pX.x, pX.y), hypot(pY.x, pY.y), a);
    },
    isClosed: function() {
        return true;
    },
    isConvex: function() {
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
        var c = this.center,
            rX = this.radiusX,
            rY = this.radiusY,
            cs = this.sincos,
            ct = stdMath.cos(t*TWO_PI),
            st = stdMath.sin(t*TWO_PI)
        ;
        return new Point(
            c.x + rX*cs[0]*ct - rY*cs[1]*st,
            c.y + rY*cs[0]*st + rX*cs[1]*ct
        );
    },
    hasPoint: function(point) {
        return 2 === point_inside_ellipse(point, this.center, this.radiusX, this.radiusY, this.sincos);
    },
    hasInsidePoint: function(point, strict) {
        var inside = point_inside_ellipse(point, this.center, this.radiusX, this.radiusY, this.sincos);
        return strict ? 1 === inside : 0 < inside;
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Circle || other instanceof Ellipse)
        {
            return ellipse_ellipse_intersection(this, other);
        }
        else if ((other instanceof Primitive) && is_function(other.intersects))
        {
            return other.intersects(this);
        }
        return false;
    },
    toSVG: function(svg) {
        return SVG('ellipse', {
            'cx': [this.center.x, this.center.isChanged()],
            'cy': [this.center.y, this.center.isChanged()],
            'rx': [this.radiusX, this.values.radiusX.isChanged()],
            'ry': [this.radiusY, this.values.radiusY.isChanged()],
            'transform': ['rotate('+Str(this.angle)+' '+Str(this.center.x)+' '+Str(this.center.y)+')', this.center.isChanged() || this.values.angle.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false,  true, {
            'id': [this.id, false],
            'transform': [this.matrix.toSVG(), this.isChanged()]
        });
    },
    toSVGPath: function() {
        var c = this.center, rX = this.radiusX, rY = this.radiusY, a = this.angle;
        return 'M '+Str(c.x - rX)+' '+Str(c.y)+' a '+Str(rX)+' '+Str(rY)+' '+Str(/*a*/0)+' 0 0 '+Str(rX + rX)+' 0 a '+Str(rX)+' '+Str(rY)+' '+Str(/*a*/0)+' 0 0 '+Str(-rX - rX)+' 0 z';
    },
    toTex: function() {
        return '\\text{Ellipse('+Str(deg(this.angle))+'°):}'+'\\frac{(x - '+Str(this.center.x)+')^2}{'+Str(this.radiusX)+'^2} + \\frac{(y - '+Str(this.center.y)+')^2}{'+Str(this.radiusY)+'^2} = 1';
    },
    toString: function() {
        return 'Ellipse('+[Str(this.center), Str(this.radiusX), Str(this.radiusY), Str(deg(this.angle))+'°'].join(',')+')';
    }
});
