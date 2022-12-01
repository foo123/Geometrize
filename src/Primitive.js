// 2D Geometric Primitive base class
var Primitive = makeClass(null, merge(null, {
    constructor: function Primitive() {
        var self = this, _style = null, onStyleChange;

        self.id = uuid(self.constructor.name);

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
        self.isChanged(true);
    },
    id: '',
    clone: function() {
        return this;
    },
    transform: function() {
        return this;
    },
    getBoundingBox: function() {
        return {
        top: -Infinity,
        left: -Infinity,
        bottom: Infinity,
        right: Infinity
        };
    },
    getConvexHull: function() {
        return [];
    },
    getCenter: function() {
        var box = this.getBoundingBox();
        return {
            x: (box.left + box.right)/2,
            y: (box.top + box.bottom)/2
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
    toSVG: function(svg) {
        return arguments.length ? svg : '';
    },
    toSVGPath: function() {
        return '';
    },
    toTex: function() {
        return '\\text{Primitive}';
    },
    toString: function() {
        return 'Primitive()';
    }
}, Changeable));
