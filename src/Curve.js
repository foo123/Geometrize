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
        if (this.points)
        {
            unobserveArray(this.points);
            this.points.forEach(function(point) {point.onChange(this.id, false);});
            this.points = null;
        }
        this.values = null;
        this.$super.dispose.call(this);
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
    hasPoint: function(p) {
        return false;
    },
    hasInsidePoint: function(p, strict) {
        return false;
    },
    getPointAt: function(t) {
        return null;
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
        var self = this, degree = 0;

        if (null == points) points = [];
        Curve.call(self, points);

        degree = self.points.length - 1;
        Object.defineProperty(self, 'degree', {
            get() {
                return degree;
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
