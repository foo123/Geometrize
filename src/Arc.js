/**[DOC_MD]
 * ### 2D Elliptical Arc (subclass of EllipticArc2D)
 *
 * Represents an elliptic arc between start and end (points) having radiusX, radiusY and rotation angle and given largeArc and sweep flags
 * ```javascript
 * const arc = Arc(start, end, radiusX, radiusY, angle, largeArc, sweep);
 * ```
[/DOC_MD]**/
var Arc = makeClass(EllipticArc2D, {
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
                if (_radiusX.isChanged() /*&& !self.isChanged()*/)
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
                if (_radiusY.isChanged() /*&& !self.isChanged()*/)
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
                if (_angle.isChanged() /*&& !self.isChanged()*/)
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
                if (_largeArc.isChanged() /*&& !self.isChanged()*/)
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
                if (_sweep.isChanged() /*&& !self.isChanged()*/)
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
        BB = function BB(o1, o2, cx, cy, rx, ry, theta, dtheta, angle, otherArc, sweep, _cos, _sin) {
            var theta2 = theta + dtheta,
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
                otherArc = !otherArc;
            }
            // find min/max from zeroes of directional derivative along x and y
            // first get of whole ellipse
            // along x axis
            t = stdMath.atan2(-ry*tan, rx);
            p1 = arc(t, cx, cy, rx, ry, _cos, _sin);
            p2 = arc(t + PI, cx, cy, rx, ry, _cos, _sin);
            // along y axis
            t = stdMath.atan2(ry, rx*tan);
            p3 = arc(t, cx, cy, rx, ry, _cos, _sin);
            p4 = arc(t + PI, cx, cy, rx, ry, _cos, _sin);
            if (p1.x < p2.x)
            {
                xmin = p1;
                xmax = p2;
            }
            else
            {
                xmin = p2;
                xmax = p1;
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
            txmin = vector_angle(1, 0, (xmin.x - cx)/rx, (xmin.y - cy)/ry);
            txmax = vector_angle(1, 0, (xmax.x - cx)/rx, (xmax.y - cy)/ry);
            tymin = vector_angle(1, 0, (ymin.x - cx)/rx, (ymin.y - cy)/ry);
            tymax = vector_angle(1, 0, (ymax.x - cx)/rx, (ymax.y - cy)/ry);
             if ((!otherArc && (cmod(theta) > cmod(txmin) || cmod(theta2) < cmod(txmin))) || (otherArc && !(cmod(theta) > cmod(txmin) || cmod(theta2) < cmod(txmin))))
            {
                xmin = o1.x < o2.x ? o1 : o2;
            }
            if ((!otherArc && (cmod(theta) > cmod(txmax) || cmod(theta2) < cmod(txmax))) || (otherArc && !(cmod(theta) > cmod(txmax) || cmod(theta2) < cmod(txmax))))
            {
                xmax = o1.x > o2.x ? o1 : o2;
            }
            if ((!otherArc && (cmod(theta) > cmod(tymin) || cmod(theta2) < cmod(tymin))) || (otherArc && !(cmod(theta) > cmod(tymin) || cmod(theta2) < cmod(tymin))))
            {
                ymin = o1.y < o2.y ? o1 : o2;
            }
            if ((!otherArc && (cmod(theta) > cmod(tymax) || cmod(theta2) < cmod(tymax))) || (otherArc && !(cmod(theta) > cmod(tymax) || cmod(theta2) < cmod(tymax))))
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
                    _bbox = BB(self.start, self.end, self.center.x, self.center.y, self.rX, self.rY, self.theta, self.dtheta, self.angle, self.largeArc, self.sweep, _cos, _sin);
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
                    var c = self.center,
                        rx = self.rX,
                        ry = self.rY,
                        theta = self.theta,
                        dtheta = self.dtheta,
                        p0 = self.start,
                        p1 = self.end,
                        p;
                    if (stdMath.abs(dtheta) + QTR_PI < TWO_PI)
                    {
                        // not complete ellipse, refine the covering
                        p = BB(rot(null, p0, _cos, -_sin, c.x, c.y), rot(null, p1, _cos, -_sin, c.x, c.y), c.x, c.y, rx, ry, theta, dtheta, 0, self.largeArc, self.sweep, 1, 0);
                        p = [
                            {x:p.xmin, y:p.ymin},
                            {x:p.xmax, y:p.ymin},
                            {x:p.xmax, y:p.ymax},
                            {x:p.xmin, y:p.ymax}
                        ].map(function(pi) {return rot(pi, pi, _cos, _sin, c.x, c.y);});
                    }
                    else
                    {
                        p = [
                            toarc(-1, -1, c.x, c.y, rx, ry, _cos, _sin),
                            toarc(1, -1, c.x, c.y, rx, ry, _cos, _sin),
                            toarc(1, 1, c.x, c.y, rx, ry, _cos, _sin),
                            toarc(-1, 1, c.x, c.y, rx, ry, _cos, _sin)
                        ];
                    }
                    _hull = p.map(Point2D);
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
