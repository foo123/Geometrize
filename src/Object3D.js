/**[DOC_MD]
 * ### Object3D Base Class
 *
 * Represents a generic 3D object
 * (not used directly)
 * 
[/DOC_MD]**/
var Object3D = makeClass(null, merge(null, {
    constructor: function Object3D() {
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
    name: 'Object3D',
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
 * * `transform(matrix): Object2D` get a transformed copy of this object by matrix
[/DOC_MD]**/
    transform: function() {
        return this;
    },
    setStyle: null,
/**[DOC_MD]
 * * `getBoundingBox(): Object` get bounding box {xmin,ymin,xmax,ymax,zmin,zmax} of object
[/DOC_MD]**/
    getBoundingBox: function() {
        return {
        zmin: -Infinity,
        ymin: -Infinity,
        xmin: -Infinity,
        zmax: Infinity,
        ymax: Infinity,
        xmax: Infinity
        };
    },
/**[DOC_MD]
 * * `getCenter(): Object` get center {x,y} of object
[/DOC_MD]**/
    getCenter: function() {
        var bb = this.getBoundingBox();
        return {
            x: (bb.xmin + bb.xmax)/2,
            y: (bb.ymin + bb.ymax)/2,
            z: (bb.zmin + bb.zmax)/2
        };
    },
    intersects: function(other) {
        return false;
    },
    intersectsSelf: function() {
        return false;
    },
/**[DOC_MD]
 * * `toTex(): String` get Tex representation of this object
[/DOC_MD]**/
    toTex: function() {
        return '\\text{Object3D}';
    },
/**[DOC_MD]
 * * `toString(): String` get String representation of this object
[/DOC_MD]**/
    toString: function() {
        return 'Object3D('+this.id+')';
    }
}, Changeable));
Geometrize.Object3D = Object3D;
