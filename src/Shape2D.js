/**[DOC_MD]
 * ### Shape2D (subclass of Object2D)
 *
 * container for 2D geometric objects, grouped together
 * ```javascript
 * // construct a complex shape
 * const shape = Shape2D([Line(p1, p2), Line(p6, p7), Shape2D([Line(p3, p4), Line(p5, p6)])]);
 * ```
[/DOC_MD]**/
var Shape2D = makeClass(Object2D, {
    constructor: function Shape2D(objects) {
        var self = this, _svgs = null, _objects = null, __objects = null, _bbox = null, _hull = null,
            obj_add, obj_del, onObjectChange, onArrayChange;

        if (!(self instanceof Shape2D)) return new Shape2D(objects);

        if (null == objects) objects = [];
        Object2D.call(self);

        obj_add = function(o) {
            if (o instanceof Object2D) o.onChange(onObjectChange);
            return o;
        };
        obj_del = function(o) {
            if (o instanceof Object2D)
            {
                o.onChange(onObjectChange, false);
                if (_svgs)
                {
                    var el = _svgs[o.id];
                    if (el)
                    {
                        if (el.parentNode) el.parentNode.removeChild(el);
                        delete _svgs[o.id];
                    }
                }
            }
            return o;
        };
        onObjectChange = function onObjectChange(obj) {
            if (is_array(_object) && (-1 !== _objects.indexOf(obj)))
            {
                //if (!self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            }
        };
        onObjectChange.id = self.id;
        onArrayChange = function onArrayChange(changed) {
            //if (!self.isChanged())
            {
                self.isChanged(true);
                self.triggerChange();
            }
        };
        onArrayChange.id = self.id;

        def(self, '_svgs', {
            get: function() {
                if (null == _svgs) _svgs = {};
                return _svgs;
            },
            set: function(svgs) {
                if (null == svgs) _svgs = null;
            },
            enumerable: false,
            configurable: false
        });
        def(self, '_bbox', {
            get: function() {
                if (null == _bbox)
                {
                    _bbox = self._objects.reduce(function(_bbox, obj) {
                        var bb = obj.getBoundingBox();
                        _bbox.ymin = stdMath.min(_bbox.ymin, bb.ymin);
                        _bbox.xmin = stdMath.min(_bbox.xmin, bb.xmin);
                        _bbox.ymax = stdMath.max(_bbox.ymax, bb.ymax);
                        _bbox.xmax = stdMath.max(_bbox.xmax, bb.xmax);
                        return _bbox;
                    }, {
                        ymin: Infinity,
                        xmin: Infinity,
                        ymax: -Infinity,
                        xmax: -Infinity
                    });
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
                    _hull = convex_hull(self._objects.reduce(function(hulls, obj) {
                        hulls.push.apply(hulls, obj._hull);
                        return hulls;
                    }, []));
                }
                return _hull;
            },
            enumerable: false,
            configurable: false
        });
/**[DOC_MD]
 * **Properties:**
 *
[/DOC_MD]**/
/**[DOC_MD]
 * * `objects: Object2D[]` array of objects that are part of this shape
[/DOC_MD]**/
        def(self, 'objects', {
            get: function() {
                return _objects;
            },
            set: function(objects) {
                if (_objects !== objects)
                {
                    if (is_array(_objects))
                    {
                        unobserveArray(_objects, obj_del);
                    }

                    if (is_array(objects))
                    {
                        _objects = observeArray(objects, obj_add, obj_del);
                        _objects.onChange(onArrayChange);
                        //if (!self.isChanged())
                        {
                            self.isChanged(true);
                            self.triggerChange();
                        }
                    }
                    else if (null == objects)
                    {
                        _objects = null;
                        __objects = null;
                    }
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, '_objects', {
            get: function() {
                if (null == __objects)
                {
                    var matrix = self.matrix;
                    __objects = _objects.map(function(object) {return object.transform(matrix);});
                }
                return __objects;
            },
            enumerable: false,
            configurable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                __objects = null;
                _bbox = null;
                _hull = null;
            }
            else if (false === isChanged)
            {
                _objects.forEach(function(o) {o.isChanged(false);});
            }
            return Object2D.prototype.isChanged.apply(self, arguments);
        };
        self.objects = objects;
    },
    name: 'Shape2D',
    dispose: function() {
        var self = this;
        if (self.objects)
        {
            unobserveArray(self.objects, function(o) {
                if (o instanceof Object2D) o.onChange(self.id, false);
                return o;
            });
            self.objects = null;
            self._svgs = null;
        }
        Object2D.prototype.dispose.call(self);
    },
    clone: function() {
        return new Shape2D(this.objects.map(function(obj) {return obj.clone();}));
    },
    hasMatrix: function() {
        return true;
    },
    transform: function(matrix) {
        return new Shape2D(this.objects.map(function(obj) {return obj.transform(matrix);}));
    },
    getBoundingBox: function() {
        var bb = this._bbox;
        return {
        ymin: bb.ymin,
        xmin: bb.xmin,
        ymax: bb.ymax,
        xmax: bb.xmax
        };
    },
    getConvexHull: function() {
        return this._hull.map(function(p) {return p.clone();});
    },
    hasPoint: function(point) {
        for (var o=this._objects, n=o.length, i=0; i<n; ++i)
        {
            if (o[i].hasPoint(point))
                return true;
        }
        return false;
    },
    intersects: function(other) {
        var self = this;
        if (other instanceof Point2D)
        {
            return self.hasPoint(other) ? [other] : false;
        }
        else if (other instanceof Object2D)
        {
            for (var ii,i=[],o=self._objects,n=o.length,j=0; j<n; ++j)
            {
                ii = o[j].intersects(other);
                if (ii) i.push.apply(i, ii);
            }
            return i ? i.map(Point2D) : false;
        }
        return false;
    },
    intersectsSelf: function() {
        var self = this, ii, i = [], o = self._objects,
            n = o.length, j, k;
        for (j=0; j<n; ++j)
        {
            ii = o[j].intersectsSelf();
            if (ii) i.push.apply(i, ii);
            for (k=j+1; k<n; ++k)
            {
                ii = o[j].intersects(o[k]);
                if (ii) i.push.apply(i, ii);
            }
        }
        return i ? i.map(Point2D) : false;
    },
    toSVG: function(svg) {
        var self = this;
        return arguments.length ? SVG('g', {
            'id': [self.id, false],
            'transform': [self.matrix.toSVG(), self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, svg, null, function(g) {
            var svgs = self._svgs;
            self.objects.forEach(function(o) {
                if (o instanceof Object2D)
                {
                    if (o.isChanged())
                    {
                        var el = svgs[o.id];
                        if (!el)
                        {
                            g.appendChild(el = o.toSVG(null));
                            svgs[o.id] = el;
                        }
                        else
                        {
                            o.toSVG(el);
                        }
                    }
                }
            });
        }) : SVG('g', {
            'id': [self.id, false],
            'transform': [self.matrix.toSVG(), true],
            'style': [self.style.toSVG(), true]
        }, false, self.objects.map(function(o) {return o.toSVG();}).join(''));
    },
    toSVGPath: function(svg) {
        var self = this, toSVGPath = function(object) {return object.toSVGPath();};
        return arguments.length ? SVG('path', {
            'id': [self.id, false],
            'd': [self.objects.map(toSVGPath).join(' '), self.isChanged()],
            'transform': [self.matrix.toSVG(), self.isChanged()],
            'style': [self.style.toSVG(), self.style.isChanged()]
        }, svg) : (self._objects.map(toSVGPath).join(' '));
    },
    toCanvas: function(ctx) {
        var self = this, t = ctx.getTransform();
        self.matrix.toCanvas(ctx);
        self.style.toCanvas(ctx);
        self.toCanvasPath(ctx);
        ctx.setTransform(t);
    },
    toCanvasPath: function(ctx) {
        var objects = this.objects, n = objects.length, i;
        if (!n) return;
        ctx.beginPath();
        for (i=0; i<n; ++i) objects[i].toCanvas(ctx);
    }
});
Geometrize.Shape2D = Shape2D;
