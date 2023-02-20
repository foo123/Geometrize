/**[DOC_MD]
 * ### Topos2D 2D Geometric Topos (subclass of Object2D)
 *
 * Represents a geometric topos, ie a set of points
 * ```javascript
 * const topos = Topos2D([p1, p2, p3, .., pn]);
 * ```
[/DOC_MD]**/
var Topos2D = makeClass(Object2D, {
    constructor: function Topos2D(points) {
        var self = this,
            _points = null,
            onPointChange,
            onArrayChange,
            point_add,
            point_del
        ;
        if (points instanceof Topos2D) return points;
        if (!(self instanceof Topos2D)) return new Topos2D(points);
        if (null == points) points = [];

        self.$super('constructor');

        point_add = function(p) {
            p = Point2D(p);
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
                //if (!self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            }
        };
        onPointChange.id = self.id;
        onArrayChange = function onArrayChange(changed) {
            //if (!self.isChanged())
            {
                self.isChanged(true);
                self.triggerChange();
            }
        };
        onArrayChange.id = self.id;

        _points = observeArray(points, point_add, point_del, p_eq);
        _points.onChange(onArrayChange);

/**[DOC_MD]
 * **Properties:**
 *
[/DOC_MD]**/
/**[DOC_MD]
 * * `points: Point2D[]` the points that define this topos
[/DOC_MD]**/
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
                        //if (!self.isChanged())
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
    name: 'Topos2D',
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
        return new Topos2D(this.points.map(function(p) {return p.clone();}));
    },
    transform: function(matrix) {
        return new Topos2D(this.points.map(function(p) {return matrix.transform(p);}));
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
        if (other instanceof Object2D)
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
    toSVG: function(svg) {
        return this.toSVGPath(arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var self = this, path = self.points.map(function(p) {return p.toSVGPath();}).join(' ');
        return arguments.length ? SVG('path', {
            'id': [self.id, false],
            'd': [path, self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        this.style.toCanvas(ctx)
        this.toCanvasPath(ctx);
    },
    toCanvasPath: function(ctx) {
        this.points.forEach(function(p) {
            p.toCanvasPath(ctx);
        });
    }
});
Geometrize.Topos2D = Topos2D;
