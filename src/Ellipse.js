// 2D Ellipse class
var Ellipse = makeClass(Curve, {
    constructor: function Ellipse(center, radiusX, radiusY, theta) {
        var self = this,
            _radiusX = null,
            _radiusY = null,
            _theta = null,
            _length = null,
            _area = null,
            _bbox = null,
            _hull = null
        ;

        if (center instanceof Ellipse) return center;
        if (!(self instanceof Ellipse)) return new Ellipse(center, radiusX, radiusY, theta);
        _radiusX = stdMath.abs(Num(radiusX));
        _radiusY = stdMath.abs(Num(radiusY));
        _theta = Num(theta);
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
        Object.defineProperty(self, 'radiusX', {
            get() {
                return _radiusX;
            },
            set(radiusX) {
                radiusX = stdMath.abs(Num(radiusX));
                if (_radiusX !== radiusX)
                {
                    var isDirty = !is_almost_equal(_radiusX, radiusX);
                    _radiusX = radiusX;
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
        Object.defineProperty(self, 'radiusY', {
            get() {
                return _radiusY;
            },
            set(radiusY) {
                radiusY = stdMath.abs(Num(radiusY));
                if (_radiusY !== radiusY)
                {
                    var isDirty = !is_almost_equal(_radiusY, radiusY);
                    _radiusY = radiusY;
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
        Object.defineProperty(self, 'theta', {
            get() {
                return _theta;
            },
            set(theta) {
                theta = Num(theta);
                if (_theta !== theta)
                {
                    var isDirty = !is_almost_equal(_theta, theta);
                    _theta = theta;
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
                    // approximate
                    _length = stdMath.PI * (3*(_radiusX+_radiusY)-stdMath.sqrt((3*_radiusX+_radiusY)*(_radiusX+3*_radiusY)));
                }
                return _length;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'area', {
            get() {
                if (null == _area)
                {
                    _area = stdMath.PI * _radiusX * _radiusY;
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
                    var c = self.center, rX = _radiusX, rX = _radiusY,
                        m = Matrix.rotate(_theta);
                    _hull = [
                        new Point(c.x-rX, c.y-rY).transform(m),
                        new Point(c.x+rX, c.y-rY).transform(m),
                        new Point(c.x+rX, c.y+rY).transform(m),
                        new Point(c.x-rX, c.y+rY).transform(m)
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
        return new Ellipse(this.center.clone(), this.radiusX, this.radiusY, this.theta);
    },
    transform: function(matrix) {
        var c = this.center,
            rX = this.radiusX,
            rY = this.radiusY,
            th = this.theta,
            ct = c.transform(matrix),
            pX = new Point(c.x+rX, c.y).transform(matrix),
            pY = new Point(c.x, c.y+rY).transform(matrix),
        ;
        return new Ellipse(ct, dist(ct, pX), dist(ct, pY), th);
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
        var ce = this.center,
            rX = this.radiusX,
            rY = this.radiusY,
            theta = this.theta,
            c = stdMath.cos(theta),
            s = stdMath.sin(theta),
            ct = stdMath.cos(t*2*stdMath.PI),
            st = stdMath.sin(t*2*stdMath.PI)
        ;
        return new Point(
            ce.x + rX*c*ct - rY*s*st,
            ce.y + rY*c*st + rX*s*ct
        );
    },
    hasPoint: function(point, notInside) {
        var center = this.center,
            rX2 = this.radiusX*this.radiusX,
            rY2 = this.radiusY*this.radiusY,
            c = stdMath.cos(-this.theta),
            s = stdMath.sin(-this.theta),
            x = point.x - center.x,
            y = point.y - center.y,
            dx = c*x - s*y,
            dy = c*y + s*x,
            d = dx*dx/rX2 + dy*dy/rY2
        ;
        return notInside ? is_almost_equal(d, 1) : d <= 1;
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Circle || other instanceof Ellipse)
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
        return SVG('ellipse', {
            'cx': this.center.x,
            'cy': this.center.y,
            'rx': this.radiusX,
            'ry': this.radiusY,
            'transform': 'rotate('+Str(this.theta)+' '+Str(this.center.x)+' '+Str(this.center.y)+')',
            'style': this.style.toSVG()
        }, arguments.length ? svg : false, true, {
            'id': this.id,
            'transform': this.matrix.toSVG()
        });
    },
    toTex: function() {
        return '\\text{Ellipse('+Str(this.theta)+'):}'+'\\frac{(x - '+Str(this.center.x)+')^2}{'+Str(this.radiusX)+'^2} + \\frac{(y - '+Str(this.center.y)+')^2}{'+Str(this.radiusY)+'^2} = 1';
    },
    toString: function() {
        return 'Ellipse('+[Str(this.center), Str(this.radiusX), Str(this.radiusY), Str(this.theta)].join(',')+')';
    }
});
