// 2D Elliptic Arc class
var Arc = makeClass(Curve, {
    constructor: function Arc(start, end, radiusX, radiusY, angle, largeArc, sweep) {
        var self = this,
            _radiusX = null,
            _radiusY = null,
            _angle = null,
            _largeArc = null,
            _sweep = null,
            _cos = 0,
            _sin = 0,
            _params = null,
            _length = null,
            _bbox = null,
            _hull = null
        ;

        if (start instanceof Arc) return start;
        if (!(self instanceof Arc)) return new Arc(start, end, radiusX, radiusY, angle, largeArc, sweep);
        _radiusX = new Value(stdMath.abs(Num(radiusX)));
        _radiusY = new Value(stdMath.abs(Num(radiusY)));
        _angle = new Value(angle);
        _cos = stdMath.cos(rad(_angle.val()));
        _sin = stdMath.sin(rad(_angle.val()));
        _largeArc = new Value(!!largeArc);
        _sweep = new Value(!!sweep);

        self.$super('constructor', [[start, end], {radiusX:_radiusX, radiusY:_radiusY, angle:_angle, largeArc:_largeArc, sweep:_sweep}]);

        def(self, 'start', {
            get: function() {
                return self.points[0];
            },
            set: function(start) {
                self.points[0] = start;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'end', {
            get: function() {
                return self.points[1];
            },
            set: function(end) {
                self.points[1] = end;
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
        def(self, 'largeArc', {
            get: function() {
                return _largeArc.val();
            },
            set: function(largeArc) {
                _largeArc.val(!!largeArc);
                if (_largeArc.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'sweep', {
            get: function() {
                return _sweep.val();
            },
            set: function(sweep) {
                _sweep.val(!!sweep);
                if (_sweep.isChanged() && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'center', {
            get: function() {
                return self._params[0];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'theta', {
            get: function() {
                return self._params[1];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'dtheta', {
            get: function() {
                return self._params[2];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'rX', {
            get: function() {
                return self._params[3];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'rY', {
            get: function() {
                return self._params[4];
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'cs', {
            get: function() {
                return [_cos, _sin];
            },
            enumerable: false,
            configurable: false
        });
        def(self, '_params', {
            get: function() {
                if (null == _params)
                {
                    _params = arc2ellipse(self.start.x, self.start.y, self.end.x, self.end.y, self.largeArc, self.sweep, self.radiusX, self.radiusY, self.cs);
                }
                return _params;
            },
            enumerable: false,
            configurable: false
        });
        def(self, 'length', {
            get: function() {
                if (null == _length)
                {
                    // approximate
                    _length = polyline_length(self._lines);
                }
                return _length;
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    var dtheta = self.dtheta,
                        p0, p1, p2, p3, p4;
                    // yminmax = [-90, 90], xminmax = [0, 180];
                    p0 = self.f(0);
                    p1 = self.f(0.25);
                    p2 = self.f(0.5);
                    p3 = self.f(0.75);
                    p4 = self.f(1);
                    _bbox = {
                        ymin: stdMath.min(p0.y, p1.y, p2.y, p3.y, p4.y),
                        xmin: stdMath.min(p0.x, p1.x, p2.x, p3.x, p4.x),
                        ymax: stdMath.max(p0.y, p1.y, p2.y, p3.y, p4.y),
                        xmax: stdMath.max(p0.x, p1.x, p2.x, p3.x, p4.x)
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
                    _hull = convex_hull(self._lines);
                }
                return _hull;
            },
            enumerable: false,
            configurable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _params = null;
                _length = null;
                _bbox = null;
                _hull = null;
            }
            return self.$super('isChanged', arguments);
        };
    },
    name: 'Arc',
    clone: function() {
        return new Arc(this.start.clone(), this.end.clone(), this.radiusX, this.radiusY, this.angle, this.largeArc, this.sweep);
    },
    transform: function(matrix) {
        var rX = this.radiusX,
            rY = this.radiusY,
            a = this.angle,
            r = deg(matrix.getRotationAngle()),
            s = matrix.getScale()
        ;
        return new Arc(
            this.start.transform(matrix),
            this.end.transform(matrix),
            rX * s.x,
            rY * s.y,
            a + r,
            this.largeArc,
            this.sweep
        );
    },
    isClosed: function() {
        return false;
    },
    isConvex: function() {
        return false;
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
            rx = this.rX, ry = this.rX,
            theta = this.theta, dtheta = this.dtheta;
        return arc(theta + t*dtheta, c.x, c.y, rx, ry, cs[0], cs[1]);
    },
    getPointAt: function(t) {
        t = Num(t);
        return 0 > t || 1 < t ? null : Point(this.f(t));
    },
    hasPoint: function(point) {
        return point_on_arc(point, this.center, this.rX, this.rY, this.cs, this.theta, this.dtheta);
    },
    hasInsidePoint: function(point, strict) {
        return strict ? false : this.hasPoint(point);
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
        else if (other instanceof Arc)
        {
            i = polyline_arc_intersection(this._lines, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(this);
        }
        return false;
    },
    bezierPoints: function() {
        var c = this.center,
            rx = this.rX,
            ry = this.rY,
            cs = this.cs,
            cos = cs[0],
            sin = cs[1],
            theta = this.theta,
            dtheta = this.dtheta,
            r = abs(dtheta)/(PI/2),
            i, j, n, beziers
        ;
        if (is_almost_equal(r, 1)) r = 1;
        n = stdMath.max(stdMath.ceil(r), 1);
        dtheta /= n;
        beziers = new Array(n)
        for (j=0,i=0; i<n; ++i,j=1-j,theta+=dtheta)
        {
            beziers[i] = arc2bezier(theta, dtheta, c.x, c.y, rx, ry, cos, sin/*, j*/);
        }
        return beziers;
    },
    toSVG: function(svg) {
        var path = this.toSVGPath();
        return SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var p1 = this.start, p2 = this.end,
            rX = Str(this.radiusX), rY = Str(this.radiusY),
            a = Str(this.angle),
            l = Str(this.largeArc ? 1 : 0),
            s = Str(this.sweep ? 1 : 0),
            path = 'M '+Str(p1.x)+' '+Str(p1.y)+' A '+rX+' '+rY+' '+a+' '+l+' '+s+' '+Str(p2.x)+' '+Str(p2.y);
        return arguments.length ? SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': [this.style.toSVG(), this.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var c = this.center, rx = this.rX, ry = this.rY, fs = !this.sweep,
            a = rad(this.angle), t1 = this.theta, t2 = t1 + this.dtheta;
        ctx.beginPath();
        ctx.lineWidth = this.style['stroke-width'];
        ctx.strokeStyle = this.style['stroke'];
        ctx.ellipse(c.x, c.y, rx, ry, a, t1, t2, fs);
        ctx.stroke();
        //ctx.closePath();
    },
    toTex: function() {
        return '\\text{Arc: }\\left('+[Tex(this.start), Tex(this.end), Str(this.radiusX), Str(this.radiusY), Str(this.angle)+'\\text{°}', Str(this.largeArc ? 1 : 0), Str(this.sweep ? 1 : 0)].join(',')+'\\right)';
    },
    toString: function() {
        return 'Arc('+[Str(this.start), Str(this.end), Str(this.radiusX), Str(this.radiusY), Str(this.angle)+'°', Str(this.largeArc), Str(this.sweep)].join(',')+')';
    }
});
Geometrize.Arc = Arc;
