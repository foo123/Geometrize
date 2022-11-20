// 2D generic Curve base class
var Curve = makeClass(Primitive, {
    constructor: function Curve(points) {
        var self = this, _points = null,
            onPointChange, onArrayChange;

        if (null == points) points = [];
        Primitive.call(self);

        onPointChange = function onPointChange(point) {
            if (is_array(_points) && (-1 !== _points.indexOf(point)))
            {
                if (!self.isDirty())
                {
                    self.isDirty(true);
                    self.triggerChange();
                }
            }
        };
        onPointChange.id = self.id;
        onArrayChange = function onArrayChange(changed) {
            if (!self.isDirty())
            {
                self.isDirty(true);
                self.triggerChange();
            }
        };
        onArrayChange.id = self.id;

        _points = observeArray(points.map(Point), Point, function(a, b) {return a.eq(b);});
        _points.forEach(function(point) {point.onChange(onPointChange);});
        _points.onChange(onArrayChange);

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
                        if (!self.isDirty())
                        {
                            self.isDirty(true);
                            self.triggerChange();
                        }
                    }
                    else if (null == points)
                    {
                        _points = null;
                    }
                }
            }
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
        this.$super.dispose.call(this);
    },
    isDirty: function(isDirty) {
        if (false === isDirty)
        {
            this.points.forEach(function(point) {point.isDirty(false);});
        }
        return this.$super.isDirty.apply(this, arguments);
    },
    isClosed: function() {
        return false;
    },
    getPoint: function(t) {
        return null;
    },
    toXYEquation: function() {
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
