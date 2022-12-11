// 2D geometric Topos ie set of points
var Topos = makeClass(Primitive, {
    constructor: function Topos(points) {
        var self = this,
            _points = null,
            onPointChange,
            onArrayChange,
            point_add,
            point_del
        ;
        if (points instanceof Topos) return points;
        if (!(self instanceof Topos)) return new Topos(points);
        if (null == points) points = [];

        self.$super('constructor');

        point_add = function(p) {
            p = Point(p);
            p.onChange(onPointChange);
            return p;
        };
        point_del = function(p) {
            p.onChange(onPointChange, false);
            return p;
        };
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

        _points = observeArray(points, point_add, point_del, p_eq);
        _points.onChange(onArrayChange);

        def(self, 'points', {
            get: function() {
                return _points;
            },
            set: function(points) {
                if (_points !== points)
                {
                    if (is_array(_points))
                    {
                        unobserveArray(_points, point_del);
                    }

                    if (is_array(points))
                    {
                        _points = observeArray(points, point_add, point_del, p_eq);
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
            enumerable: true,
            configurable: true
        });
    },
    name: 'Topos',
    dispose: function() {
        var self = this;
        if (self.points)
        {
            unobserveArray(self.points, function(p) {
                p.onChange(self.id, false);
                return p;
            });
            self.points = null;
        }
        self.$super('dispose');
    },
    isChanged: function(isChanged) {
        var self = this;
        if (false === isChanged)
        {
            self.points.forEach(function(point) {point.isChanged(false);});
        }
        return self.$super('isChanged', arguments);
    },
    clone: function() {
        return new Topos(this.points.map(function(p) {return p.clone();}));
    },
    transform: function(matrix) {
        return new Topos(this.points.map(function(p) {return matrix.transform(p);}));
    },
    hasPoint: function(point) {
        var p = this.points, n = p.length, j;
        for (j=0; j<n; ++j)
        {
            if (p_eq(p[j], point))
                return true;
        }
        return false;
    },
    hasInsidePoint: function(point, strict) {
        return this.hasPoint(point);
    },
    intersects: function(other) {
        if (other instanceof Primitive)
        {
            var p = this.points, n = p.length, j, i = [];
            for (j=0; j<n; ++j)
            {
                if (other.intersects(p[j]))
                    i.push(p[j]);
            }
            return i.length ? i : false;
        }
        return false;
    },
    toTex: function() {
        return '\\text{Topos}';
    },
    toString: function() {
        return 'Topos()';
    }
});
Geometrize.Topos = Topos;