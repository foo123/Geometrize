/**[DOC_MD]
 * ### Object2D Base Class
 *
 * Represents a generic 2D object
 * (not used directly)
 * 
[/DOC_MD]**/
var Object2D = makeClass(null, merge(null, {
    constructor: function Object2D() {
        var self = this, _style = null, onStyleChange;

        self.id = uuid(self.name);

        onStyleChange = function onStyleChange(style) {
            if (_style === style)
            {
                //if (!self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            }
        };
        _style = new Style();
        _style.onChange(onStyleChange);
/**[DOC_MD]
 * **Properties:**
 *
[/DOC_MD]**/
/**[DOC_MD]
 * * `id: String` unique ID for this object
[/DOC_MD]**/
/**[DOC_MD]
 * * `style: Style` the style applied to this object
[/DOC_MD]**/
        def(self, 'style', {
            get: function() {
                return _style;
            },
            set: function(style) {
                style = Style(style);
                if (_style !== style)
                {
                    if (_style) _style.onChange(onStyleChange, false);
                    _style = style;
                    if (_style)
                    {
                        _style.onChange(onStyleChange);
                        //if (!self.isChanged())
                        {
                            self.isChanged(true);
                            self.triggerChange();
                        }
                    }
                }
            },
            enumerable: true,
            configurable: false
        });
        self.setStyle = function(prop, val) {
            if (arguments.length)
            {
                if (1 < arguments.length)
                {
                    self.style[prop] = val;
                }
                else
                {
                    self.style = prop;
                }
            }
            return self;
        };
        self.isChanged(true);
    },
    id: '',
    name: 'Object2D',
/**[DOC_MD]
 * **Methods:**
 *
[/DOC_MD]**/
/**[DOC_MD]
 * * `clone(): Object2D` get a copy of this object
[/DOC_MD]**/
    clone: function() {
        return this;
    },
/**[DOC_MD]
 * * `transform(matrix2d): Object2D` get a transformed copy of this object by matrix2d
[/DOC_MD]**/
    transform: function() {
        return this;
    },
    setStyle: null,
/**[DOC_MD]
 * * `getBoundingBox(): Object{xmin,ymin,xmax,ymax}` get bounding box of object
[/DOC_MD]**/
    getBoundingBox: function() {
        return {
        ymin: -Infinity,
        xmin: -Infinity,
        ymax: Infinity,
        xmax: Infinity
        };
    },
/**[DOC_MD]
 * * `getConvexHull(): Point2D[]` get points of convex hull enclosing object
[/DOC_MD]**/
    getConvexHull: function() {
        return [];
    },
/**[DOC_MD]
 * * `getCenter(): Object{x,y}` get center of object
[/DOC_MD]**/
    getCenter: function() {
        var bb = this.getBoundingBox();
        return {
            x: (bb.xmin + bb.xmax)/2,
            y: (bb.ymin + bb.ymax)/2
        };
    },
/**[DOC_MD]
 * * `hasPoint(point): Bool` check if given point is part of the boundary this object
[/DOC_MD]**/
    hasPoint: function(point) {
        return false;
    },
/**[DOC_MD]
 * * `hasInsidePoint(point, strict): Bool` check if given point is part of the interior of this object (where applicable)
[/DOC_MD]**/
    hasInsidePoint: function(point, strict) {
        return false;
    },
/**[DOC_MD]
 * * `intersects(other): Point2D[]|Bool` return array of intersection points with other 2d object or false
[/DOC_MD]**/
    intersects: function(other) {
        return false;
    },
/**[DOC_MD]
 * * `intersects(other): Point2D[]|Bool` return array of intersection points of object with itself or false
[/DOC_MD]**/
    intersectsSelf: function() {
        return false;
    },
    toSVG: function(svg) {
        return arguments.length ? svg : '';
    },
    toSVGPath: function(svg) {
        return arguments.length ? svg : '';
    },
    toCanvas: function(ctx) {
    },
    toCanvasPath: function(ctx) {
    },
/**[DOC_MD]
 * * `toTex(): String` get Tex representation of this object
[/DOC_MD]**/
    toTex: function() {
        return '\\text{Object2D}';
    },
/**[DOC_MD]
 * * `toString(): String` get String representation of this object
[/DOC_MD]**/
    toString: function() {
        return 'Object2D('+this.id+')';
    }
}, Changeable));
Geometrize.Object2D = Object2D;
