// 2D generic Curve base class
var Curve = makeClass(Primitive, {
    constructor: function Curve(points, values) {
        var self = this, _points = null, _values = null,
            onPointChange, onArrayChange;

        if (null == points) points = [];
        if (null == values) values = {};
        Primitive.call(self);

        onPointChange = function onPointChange(point) {
            if (is_array(_points) && (-1 !== _points.indexOf(point)))
            {
                if (!self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            }
        };
        onPointChange.id = self.id;
        onArrayChange = function onArrayChange(changed) {
            if (!self.isChanged())
            {
                self.isChanged(true);
                self.triggerChange();
            }
        };
        onArrayChange.id = self.id;

        _points = observeArray(points.map(Point), Point, function(a, b) {return a.eq(b);});
        _points.forEach(function(point) {point.onChange(onPointChange);});
        _points.onChange(onArrayChange);
        _values = values;

        Object.defineProperty(self, 'points', {
            get() {
                return _points;
            },
            set(points) {
                if (_points !== points)
                {
                    if (is_array(_points))
                    {
                        unobserveArray(_points);
                        _points.forEach(function(point) {point.onChange(onPointChange, false);});
                    }

                    if (is_array(points))
                    {
                        _points = observeArray(points.map(Point), Point, function(a, b) {return a.eq(b);});
                        _points.forEach(function(point) {point.onChange(onPointChange);});
                        _points.onChange(onArrayChange);
                        if (!self.isChanged())
                        {
                            self.isChanged(true);
                            self.triggerChange();
                        }
                    }
                    else if (null == points)
                    {
                        _points = null;
                    }
                }
            },
            enumerable: true
        });
        Object.defineProperty(self, 'values', {
            get() {
                return _values;
            },
            set(values) {
                if (null == values) _values = null;
            },
            enumerable: false
        });
        Object.defineProperty(self, 'length', {
            get() {
                return 0;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'area', {
            get() {
                return 0;
            },
            enumerable: true
        });
    },
    dispose: function() {
        var self = this;
        if (self.points)
        {
            unobserveArray(self.points);
            self.points.forEach(function(point) {point.onChange(self.id, false);});
            self.points = null;
        }
        self.values = null;
        self.$super.dispose.call(self);
    },
    isChanged: function(isChanged) {
        var self = this;
        if (false === isChanged)
        {
            self.points.forEach(function(point) {point.isChanged(false);});
            Object.keys(self.values).forEach(function(k) {self.values[k].isChanged(false);});
        }
        return self.$super.isChanged.apply(self, arguments);
    },
    isClosed: function() {
        return false;
    },
    isConvex: function() {
        return false;
    },
    getPointAt: function(t) {
        return null;
    },
    toLines: function() {
        return [];
    },
    toBezier: function() {
        return this;
    },
    toTex: function() {
        return '\\text{Curve}';
    },
    toString: function() {
        return 'Curve()';
    }
});

// 2D generic Bezier curve base class
var Bezier = makeClass(Curve, {
    constructor: function Bezier(points) {
        var self = this;

        if (null == points) points = [];
        Curve.call(self, points);

        Object.defineProperty(self, 'degree', {
            get() {
                return self.points.length - 1;
            },
            enumerable: true
        });
    },
    toTex: function() {
        return '\\text{Bezier}';
    },
    toString: function() {
        return 'Bezier()';
    }
});

// 2D Composite Curve class (container of multiple, joined, curves)
var CompositeCurve = makeClass(Curve, {
    constructor: function CompositeCurve(curves) {
        var self = this,
            _curves = null,
            _points = null,
            _length = null,
            onCurveChange, onArrayChange;

        if (null == curves) curves = [];
        Primitive.call(self);

        onCurveChange = function onCurveChange(curve) {
            if (is_array(_curves) && (-1 !== _curves.indexOf(curve)))
            {
                if (!self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            }
        };
        onCurveChange.id = self.id;
        onArrayChange = function onArrayChange(changed) {
            if (!self.isChanged())
            {
                self.isChanged(true);
                self.triggerChange();
            }
        };
        onArrayChange.id = self.id;

        _curves = observeArray(curves);
        _curves.forEach(function(curve) {curve.onChange(onCurveChange);});
        _curves.onChange(onArrayChange);

        Object.defineProperty(self, 'points', {
            get() {
                if (null == _points)
                {
                    _points = _curves.reduce(function(points, curve) {
                        if (curve instanceof Curve)
                        {
                            points.push.apply(points, curve.points);
                        }
                        return points;
                    }, []);
                }
                return _points;
            },
            set(points) {
                if (null == points)
                {
                    _points = null;
                }
            },
            enumerable: true
        });
        Object.defineProperty(self, 'curves', {
            get() {
                return _curves;
            },
            set(curves) {
                if (_curves !== curves)
                {
                    if (is_array(_curves))
                    {
                        unobserveArray(_curves);
                        _curves.forEach(function(curve) {curve.onChange(onCurveChange, false);});
                    }

                    if (is_array(curves))
                    {
                        _curves = observeArray(curves);
                        _curves.forEach(function(curve) {curve.onChange(onCurveChange);});
                        _curves.onChange(onArrayChange);
                        if (!self.isChanged())
                        {
                            self.isChanged(true);
                            self.triggerChange();
                        }
                    }
                    else if (null == curves)
                    {
                        _curves = null;
                    }
                }
            },
            enumerable: true
        });
        Object.defineProperty(self, 'length', {
            get() {
                if (null == _length)
                {
                    _length = _curves.reduce(function(l, curve) {
                        if (curve instanceof Curve)
                        {
                            l += curve.length;
                        }
                        return l;
                    }, 0);
                }
                return _length;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'area', {
            get() {
                return 0;
            },
            enumerable: true
        });
        Object.defineProperty(self, '_bbox', {
            get() {
                if (null == _bbox)
                {
                    _bbox = _curves.reduce(function(_bbox, curve) {
                        if (curve instanceof Curve)
                        {
                            var box = curve.getBoundingBox();
                            _bbox.top = stdMath.min(_bbox.top, box.top);
                            _bbox.left = stdMath.min(_bbox.left, box.left);
                            _bbox.bottom = stdMath.max(_bbox.bottom, box.bottom);
                            _bbox.right = stdMath.max(_bbox.right, box.right);
                        }
                        return _bbox;
                    }, {
                        top: Infinity,
                        left: Infinity,
                        bottom: -Infinity,
                        right: -Infinity
                    });
                }
                return _bbox;
            },
            enumerable: false
        });
        Object.defineProperty(self, '_hull', {
            get() {
                if (null == _hull)
                {
                    _hull = convex_hull(_curves.reduce(function(hulls, curve) {
                        if (curve instanceof Curve)
                        {
                            hulls.push.apply(hulls, curve.getConvexHull());
                        }
                        return hulls;
                    }, []));
                }
                return _hull;
            },
            enumerable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _points = null;
                _length = null;
                _area = null;
                _bbox = null;
                _hull = null;
            }
            return Primitive.prototype.isChanged.apply(self, arguments);
        };
    },
    dispose: function() {
        var self = this;
        if (self.curves)
        {
            unobserveArray(self.curves);
            self.curves.forEach(function(curve) {curve.onChange(self.id, false);});
            self.curves = null;
            self.points = null;
        }
        Primitive.prototype.dispose.call(self);
    },
    clone: function() {
        return new CompositeCurve(this.curves.map(function(curve) {return curve.clone();}));
    },
    transform: function(matrix) {
        return new CompositeCurve(this.curves.map(function(curve) {return curve.transform(matrix);}));
    },
    isClosed: function() {
        var p = this.points;
        return p[0].eq(p[p.length-1]);
    },
    getBoundingBox: function() {
        return this._bbox;
    },
    getConvexHull: function() {
        return this._hull;
    },
    hasPoint: function(point) {
        for (var c=this.curves, n=c.length, i=0; i<n; ++i)
        {
            if (c[i].hasPoint(point))
                return true;
        }
        return false;
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Primitive)
        {
            for (var pp,p=[],c=this.curves, n=c.length, i=0; i<n; ++i)
            {
                pp = c[i].intersects(other);
                if (pp) p.push.apply(p, pp);
            }
            return p ? p.map(Point) : false;
        }
        return false;
    },
    toLines: function() {
        return this.curves.reduce(function(lines, curve) {
            if (curve instanceof Curve)
            {
                lines.push.apply(lines, curve.toLines());
            }
            return lines;
        }, []);
    },
    toTex: function() {
        return '\\text{CompositeCurve: }\\begin{cases}&'+this.curves.map(Tex).join('\\\\&')+'\\end{cases}';
    },
    toString: function() {
        return 'CompositeCurve('+"\n"+this.curves.map(Str).join("\n")+"\n"+')';
    }
});