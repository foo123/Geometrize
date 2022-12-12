// 2D Geometric Primitive base class
var Primitive = makeClass(null, merge(null, {
    constructor: function Primitive() {
        var self = this, _style = null, onStyleChange;

        self.id = uuid(self.name);

        onStyleChange = function onStyleChange(style) {
            if (_style === style)
            {
                if (!self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            }
        };
        _style = new Style();
        _style.onChange(onStyleChange);
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
                        if (!self.isChanged())
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
    name: 'Primitive',
    clone: function() {
        return this;
    },
    transform: function() {
        return this;
    },
    setStyle: null,
    getBoundingBox: function() {
        return {
        ymin: -Infinity,
        xmin: -Infinity,
        ymax: Infinity,
        xmax: Infinity
        };
    },
    getConvexHull: function() {
        return [];
    },
    getCenter: function() {
        var bb = this.getBoundingBox();
        return {
            x: (bb.xmin + bb.xmax)/2,
            y: (bb.ymin + bb.ymax)/2
        };
    },
    hasPoint: function(point) {
        return false;
    },
    hasInsidePoint: function(point, strict) {
        return false;
    },
    intersects: function(other) {
        return false;
    },
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
    toTex: function() {
        return '\\text{Primitive}';
    },
    toString: function() {
        return 'Primitive()';
    }
}, Changeable));
Geometrize.Primitive = Primitive;
