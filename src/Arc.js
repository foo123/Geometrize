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
            _hull = null,
            BB = null
        ;

        if (start instanceof Arc) return start;
        if (!(self instanceof Arc)) return new Arc(start, end, radiusX, radiusY, angle, largeArc, sweep);
        _radiusX = new Value(stdMath.abs(Num(radiusX)));
        _radiusY = new Value(stdMath.abs(Num(radiusY)));
        _angle = new Value(angle);
        _cos = stdMath.cos(rad(_angle.val()));
        _sin = stdMath.sin(rad(_angle.val()));
        _largeArc = new Value(!!largeArc ? 1 : 0);
        _sweep = new Value(!!sweep ? 1 : 0);

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
                _largeArc.val(!!largeArc ? 1 : 0);
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
                _sweep.val(!!sweep ? 1 : 0);
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
        BB = function BB(o1, o2, cx, cy, rx, ry, theta, dtheta, angle, sweep) {
            var theta2 = theta + dtheta,
                otherArc = false,
                tan = stdMath.tan(rad(angle)),
                p1, p2, p3, p4, t,
                xmin, xmax, ymin, ymax,
                txmin, txmax, tymin, tymax
            ;
            if (!sweep)
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
            p1 = arc(t, cx, cy, rx, ry, _cos, _sin);
            t += PI;
            p2 = arc(t, cx, cy, rx, ry, _cos, _sin);
            // along y axis
            t = stdMath.atan2(ry, rx*tan);
            if (t < 0) t += TWO_PI;
            p3 = arc(t, cx, cy, rx, ry, _cos, _sin);
            t += PI;
            p4 = arc(t, cx, cy, rx, ry, _cos, _sin);
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
            txmin = vector_angle(1, 0, xmin.x - cx, xmin.y - cy);
            txmax = vector_angle(1, 0, xmax.x - cx, xmax.y - cy);
            tymin = vector_angle(1, 0, ymin.x - cx, ymin.y - cy);
            tymax = vector_angle(1, 0, ymax.x - cx, ymax.y - cy);
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
            return {
                ymin: ymin.y,
                xmin: xmin.x,
                ymax: ymax.y,
                xmax: xmax.x
            };
        };
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    _bbox = BB(self.start, self.end, self.center.x, self.center.y, self.rX, self.rY, self.theta, self.dtheta, self.angle, self.sweep);
                }
                return _bbox;
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
        var self = this;
        return new Arc(self.start.clone(), self.end.clone(), self.radiusX, self.radiusY, self.angle, self.largeArc, self.sweep);
    },
    transform: function(matrix) {
        var self = this,
            rX = self.radiusX,
            rY = self.radiusY,
            a = self.angle,
            r = deg(matrix.getRotationAngle()),
            s = matrix.getScale()
        ;
        return new Arc(
            self.start.transform(matrix),
            self.end.transform(matrix),
            rX * s.x,
            rY * s.y,
            a + r,
            self.largeArc,
            self.sweep
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
        var self = this, c = self.center, cs = self.cs;
        return arc(self.theta + t*self.dtheta, c.x, c.y, self.rX, self.rY, cs[0], cs[1]);
    },
    d: function() {
        var self = this,
            p = ellipse2arc(self.center.x, self.center.y, self.rY, self.rX, [self.cs[0], -self.cs[1]], -self.theta, -self.dtheta);
        return new Arc(
            p.p0,
            p.p1,
            -self.angle,
            p.fa,
            p.fs
        );
    },
    hasPoint: function(point) {
        var self = this;
        return point_on_arc(point, self.center, self.rX, self.rY, self.cs, self.theta, self.dtheta);
    },
    hasInsidePoint: function(point, strict) {
        return strict ? false : this.hasPoint(point);
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
        else if (Geometrize.Ellipse && (other instanceof Geometrize.Ellipse))
        {
            i = polyline_ellipse_intersection(self._lines, other.center, other.radiusX, other.radiusY, other.cs);
            return i ? i.map(Point) : false
        }
        else if (other instanceof Arc)
        {
            i = polyline_arc_intersection(self._lines, other.center, other.rX, other.rY, other.cs, other.theta, other.dtheta);
            return i ? i.map(Point) : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(self);
        }
        return false;
    },
    bezierPoints: function() {
        var self = this,
            c = self.center,
            cx = c.x,
            cy = c.y,
            rx = self.rX,
            ry = self.rY,
            cs = self.cs,
            cos = cs[0],
            sin = cs[1],
            theta = self.theta,
            dtheta = self.dtheta,
            r = 2*abs(dtheta)/PI,
            i, n, beziers
        ;
        if (is_almost_equal(r, 1)) r = 1;
        if (is_almost_equal(r, stdMath.floor(r))) r = stdMath.floor(r);
        n = stdMath.max(1, stdMath.ceil(r));
        dtheta /= n;
        beziers = new Array(n);
        for (i=0; i<n; ++i,theta+=dtheta)
        {
            beziers[i] = arc2bezier(theta, dtheta, cx, cy, rx, ry, cos, sin);
        }
        return beziers;
    },
    toSVG: function(svg) {
        return this.toSVGPath(arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, p1 = self.start, p2 = self.end,
            rx = self.radiusX, ry = self.radiusY,
            a = self.angle,
            l = self.largeArc ? 1 : 0,
            s = self.sweep ? 1 : 0,
            path = ['M',p1.x,p1.y,'A',rx,ry,a,l,s,p2.x,p2.y].join(' ');
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
        ctx.stroke();
    },
    toCanvasPath: function(ctx) {
        var self = this, c = self.center, rx = self.rX, ry = self.rY, fs = !self.sweep,
            a = rad(self.angle), t1 = self.theta, dt = self.dtheta;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, rx, ry, a, t1, t1 + dt, fs);
        if (abs(dt) + EPS >= TWO_PI) ctx.closePath();
    },
    toTex: function() {
        var self = this;
        return '\\text{Arc: }\\left('+[Tex(self.start), Tex(self.end), Str(self.radiusX), Str(self.radiusY), Str(self.angle)+'\\text{°}', Str(self.largeArc ? 1 : 0), Str(self.sweep ? 1 : 0)].join(',')+'\\right)';
    },
    toString: function() {
        var self = this;
        return 'Arc('+[Str(self.start), Str(self.end), Str(self.radiusX), Str(self.radiusY), Str(self.angle)+'°', Str(self.largeArc), Str(self.sweep)].join(',')+')';
    }
});
Geometrize.Arc = Arc;
