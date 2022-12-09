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
                    var o1 = self.start, o2 = self.end,
                        c = self.center,
                        rx = self.rX, ry = self.rY,
                        theta = self.theta,
                        dtheta = self.dtheta,
                        theta2 = theta + dtheta,
                        otherArc = false,
                        tan = stdMath.tan(rad(self.angle)),
                        p1, p2, p3, p4, t,
                        xmin, xmax, ymin, ymax,
                        txmin, txmax, tymin, tymax
                    ;
                    if (!self.sweep)
                    {
                        t = theta;
                        theta = theta2;
                        theta2 = t;
                    }
                    if (theta > theta2)
                    {
                        t = theta;
                        theta = theta2;
                        theta2 = t;
                        otherArc = true;
                    }
                    // find min/max from zeroes of directional derivative along x and y
                    // first get of whole ellipse
                    // along x axis
                    t = stdMath.atan2(-ry*tan, rx);
                    if (t < 0) t += TWO_PI;
                    p1 = arc(t, c.x, c.y, rx, ry, _cos, _sin);
                    t += PI;
                    p2 = arc(t, c.x, c.y, rx, ry, _cos, _sin);
                    // along y axis
                    t = stdMath.atan2(ry, rx*tan);
                    if (t < 0) t += TWO_PI;
                    p3 = arc(t, c.x, c.y, rx, ry, _cos, _sin);
                    t += PI;
                    p4 = arc(t, c.x, c.y, rx, ry, _cos, _sin);
                    if (p2.x < p1.x)
                    {
                        xmin = p2;
                        xmax = p1;
                    }
                    else
                    {
                        xmin = p1;
                        xmax = p2;
                    }
                    if (p3.y < p4.y)
                    {
                        ymin = p3;
                        ymax = p4;
                    }
                    else
                    {
                        ymin = p4;
                        ymax = p3;
                    }
                    // refine bounding box by elliminating points not on the arc
                    txmin = vector_angle(1, 0, xmin.x - c.x, xmin.y - c.y);
                    txmax = vector_angle(1, 0, xmax.x - c.x, xmax.y - c.y);
                    tymin = vector_angle(1, 0, ymin.x - c.x, ymin.y - c.y);
                    tymax = vector_angle(1, 0, ymax.x - c.x, ymax.y - c.y);
                    if (txmin < 0) txmin += TWO_PI;
                    if (txmin > TWO_PI) txmin -= TWO_PI;
                    if (txmax < 0) txmax += TWO_PI;
                    if (txmax > TWO_PI) txmax -= TWO_PI;
                    if (tymin < 0) tymin += TWO_PI;
                    if (tymin > TWO_PI) tymin -= TWO_PI;
                    if (tymax < 0) tymax += TWO_PI;
                    if (tymax > TWO_PI) tymax -= TWO_PI;
                    if ((!otherArc && (theta > txmin || theta2 < txmin)) || (otherArc && !(theta > txmin || theta2 < txmin)))
                    {
                        xmin = o1.x < o2.x ? o1 : o2;
                    }
                    if ((!otherArc && (theta > txmax || theta2 < txmax)) || (otherArc && !(theta > txmax || theta2 < txmax)))
                    {
                        xmax = o1.x > o2.x ? o1 : o2;
                    }
                    if ((!otherArc && (theta > tymin || theta2 < tymin)) || (otherArc && !(theta > tymin || theta2 < tymin)))
                    {
                        ymin = o1.y < o2.y ? o1 : o2;
                    }
                    if ((!otherArc && (theta > tymax || theta2 < tymax)) || (otherArc && !(theta > tymax || theta2 < tymax)))
                    {
                        ymax = o1.y > o2.y ? o1 : o2;
                    }
                    _bbox = {
                        ymin: ymin.y,
                        xmin: xmin.x,
                        ymax: ymax.y,
                        xmax: xmax.x
                    };
                }
                return _bbox;
            },
            enumerable: false,
            configurable: false
        });
        /*def(self, '_hull', {
            get: function() {
                if (null == _hull)
                {
                    var c = self.center, rx = self.rX, ry = self.rY,
                        theta = self.theta, theta2 = theta + self.dtheta,
                        o1 = self.start, o2 = self.end,
                        xmin = toarc(-1, 0, c.x, c.y, rx, ry, _cos, _sin),
                        xmax = toarc(1, 0, c.x, c.y, rx, ry, _cos, _sin),
                        ymin = toarc(0, -1, c.x, c.y, rx, ry, _cos, _sin),
                        ymax = toarc(0, 1, c.x, c.y, rx, ry, _cos, _sin),
                        txmin, txmax, tymin, tymax, t, otherArc = false;
                    if (!self.sweep)
                    {
                        t = theta;
                        theta = theta2;
                        theta2 = t;
                        t = o1;
                        o1 = o2;
                        o2 = t;
                    }
                    if (theta > theta2)
                    {
                        t = theta;
                        theta = theta2;
                        theta2 = t;
                        t = o1;
                        o1 = o2;
                        o2 = t;
                        otherArc = true;
                    }
                    txmin = vector_angle(1, 0, xmin.x - c.x, xmin.y - c.y);
                    txmax = vector_angle(1, 0, xmax.x - c.x, xmax.y - c.y);
                    tymin = vector_angle(1, 0, ymin.x - c.x, ymin.y - c.y);
                    tymax = vector_angle(1, 0, ymax.x - c.x, ymax.y - c.y);
                    if (txmin < 0) txmin += TWO_PI;
                    if (txmin > TWO_PI) txmin -= TWO_PI;
                    if (txmax < 0) txmax += TWO_PI;
                    if (txmax > TWO_PI) txmax -= TWO_PI;
                    if (tymin < 0) tymin += TWO_PI;
                    if (tymin > TWO_PI) tymin -= TWO_PI;
                    if (tymax < 0) tymax += TWO_PI;
                    if (tymax > TWO_PI) tymax -= TWO_PI;
                    if ((!otherArc && (theta > txmin || theta2 < txmin)) || (otherArc && !(theta > txmin || theta2 < txmin)))
                    {
                        xmin.x = o1.x < o2.x ? o1.x : o2.x;
                    }
                    if ((!otherArc && (theta > txmax || theta2 < txmax)) || (otherArc && !(theta > txmax || theta2 < txmax)))
                    {
                        xmax.x = o1.x > o2.x ? o1.x : o2.x;
                    }
                    if ((!otherArc && (theta > tymin || theta2 < tymin)) || (otherArc && !(theta > tymin || theta2 < tymin)))
                    {
                        ymin.y = o1.y < o2.y ? o1.y : o2.y;
                    }
                    if ((!otherArc && (theta > tymax || theta2 < tymax)) || (otherArc && !(theta > tymax || theta2 < tymax)))
                    {
                        ymax.y = o1.y > o2.y ? o1.y : o2.y;
                    }
                    _hull = [
                        new Point(xmin.x, ymin.y),
                        new Point(xmax.x, ymin.y),
                        new Point(xmax.x, ymax.y),
                        new Point(xmin.x, ymax.y)
                    ];
                }
                return _hull;
            },
            enumerable: false,
            configurable: false
        });*/
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
    f: function(t) {
        var c = this.center, cs = this.cs;
        return arc(this.theta + t*this.dtheta, c.x, c.y, this.rX, this.rY, cs[0], cs[1]);
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
            r = 2*abs(dtheta)/PI,
            i, j, n, beziers
        ;
        if (is_almost_equal(r, 1)) r = 1;
        n = stdMath.max(1, stdMath.ceil(r));
        dtheta /= n;
        beziers = new Array(n);
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
        this.style.toCanvas(ctx);
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
