// 2D generic Curve base class
var Curve = makeClass(Primitive, {
    constructor: function Curve(points, values) {
        var self = this,
            _matrix = null,
            _points = null,
            _points2 = null,
            _lines = null,
            _values = null,
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

        _matrix = self.hasMatrix() ? Matrix.eye() : null;
        _values.matrix = new Changeable();
        _values.matrix.isChanged(self.hasMatrix());

        Object.defineProperty(this, 'matrix', {
            get() {
                return _matrix ? _matrix : Matrix.eye();
            },
            set(matrix) {
                if (self.hasMatrix())
                {
                    matrix = Matrix(matrix);
                    var isChanged = !matrix.eq(_matrix);
                    _matrix = matrix;
                    if (isChanged && !self.isChanged())
                    {
                        _values.matrix.isChanged(true);
                        self.isChanged(true);
                        self.triggerChange();
                    }
                }
            }
        });
        Object.defineProperty(self, '_points', {
            get() {
                if (null == _points2)
                {
                    _points2 = !_matrix || _matrix.eq(EYE) ? _points : _points.map(function(p) {
                        return _matrix.transform(p);
                    });
                }
                return _points2;
            },
            set(points) {
                if (null == points)
                {
                    _points2 = null;
                }
            },
            enumerable: false
        });
        Object.defineProperty(self, '_lines', {
            get() {
                if (null == _lines)
                {
                    _lines = sample_curve(function(t) {
                        var pt = self.f(t);
                        return _matrix ? _matrix.transform(pt, pt) : pt;
                    }, 20, 0.001, true);
                }
                return _lines;
            },
            set(lines) {
                if (null == lines)
                {
                    _lines = null;
                }
            },
            enumerable: false
        });
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
                if (null == values)
                {
                    _values = null;
                }
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
            self.style.isChanged(false);
        }
        if (true === isChanged)
        {
            self._points = null;
            self._lines = null;
        }
        return self.$super.isChanged.apply(self, arguments);
    },
    isClosed: function() {
        return false;
    },
    isConvex: function() {
        return false;
    },
    hasMatrix: function() {
        return true;
    },
    f: function(t) {
        return null;
    },
    getPointAt: function(t) {
        return null;
    },
    toLines: function() {
        return this._lines;
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
            if (null != changed.from && null != changed.to)
            {
                for (var i=changed.from; i<=changed.to; ++i)
                {
                    if (!(_curves[i] instanceof Curve) || _curves[i].isClosed())
                    {
                        unobserveArray(_curves);
                        _curves = observeArray(curves.filter(is_not_closed_curve));
                        self.isChanged(true);
                        self.triggerChange();
                        return;
                    }
                }
            }
            else
            {
                if (!self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            }
        };
        onArrayChange.id = self.id;

        _curves = observeArray(curves.filter(is_not_closed_curve));
        _curves.forEach(function(curve) {curve.onChange(onCurveChange);});
        _curves.onChange(onArrayChange);

        Object.defineProperty(self, 'points', {
            get() {
                if (null == _points)
                {
                    _points = _curves.reduce(function(points, curve) {
                        points.push.apply(points, curve.points);
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
                        _curves = observeArray(curves.filter(is_not_closed_curve));
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
                        l += curve.length;
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
                        var box = curve.getBoundingBox();
                        _bbox.top = stdMath.min(_bbox.top, box.top);
                        _bbox.left = stdMath.min(_bbox.left, box.left);
                        _bbox.bottom = stdMath.max(_bbox.bottom, box.bottom);
                        _bbox.right = stdMath.max(_bbox.right, box.right);
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
                        hulls.push.apply(hulls, curve.getConvexHull());
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
        var c = this.curves, p1, p2, n = c.length, i;
        for (i=0; i<n; ++i)
        {
            p1 = c[i].points;
            p2 = c[(i+1) % n].points;
            if (!p1[p1.length-1].eq(p2[0]))
            {
                return false;
            }
        }
        return true;
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
            for (var ii,i=[],c=this.curves,n=c.length,j=0; j<n; ++j)
            {
                ii = c[j].intersects(other);
                if (ii) i.push.apply(i, ii);
            }
            return i ? i.map(Point) : false;
        }
        return false;
    },
    toLines: function() {
        return this.curves.reduce(function(lines, curve) {
            lines.push.apply(lines, curve.toLines());
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
function is_not_closed_curve(curve)
{
    return (curve instanceof Curve) && !curve.isClosed();
}