// 2D Style class
// eg stroke, fill, width, ..
var Style = makeClass(null, merge(null, {
    constructor: function Style(style) {
        var self = this, styleProps = null, _style = null;

        if (style instanceof Style) return style;
        if (!(self instanceof Style)) return new Style(style);

        // defaults
        styleProps = Style.Properties;
        _style = merge(styleProps, {}, Style.Defaults);
        if (is_object(style)) _style = merge(styleProps, _style, style);

        styleProps.forEach(function(p) {
            def(self, p, {
                get: function() {
                    return _style[p];
                },
                set: function(val) {
                    if (_style[p] !== val)
                    {
                        _style[p] = val;
                        if (!self.isChanged())
                        {
                            self.isChanged(true);
                            self.triggerChange();
                        }
                    }
                },
                enumerable: true,
                configurable: false
            });
        });
        self.toObj = function() {
            return styleProps.reduce(function(o, p) {
                o[p] = _style[p];
                return o;
            }, {});
        };
        self.isChanged(true);
    },
    clone: function() {
        return new Style(this.toObj());
    },
    toSVG: function() {
        var style = this.toObj();
        return Object.keys(style).reduce(function(s, p) {
            return s + p + ':' + Str(style[p]) + ';';
        }, '');
    },
    toCanvas: function(ctx) {
        ctx.lineCap = this['stroke-linecap'];
        ctx.lineJoin = this['stroke-linejoin'];
        ctx.lineWidth = this['stroke-width'];
        ctx.fillStyle = this['fill'];
        ctx.strokeStyle = this['stroke'];
        return ctx;
    }
}, Changeable), {
    Properties: [
    'stroke-width',
    'stroke',
    'stroke-opacity',
    'stroke-linecap',
    'stroke-linejoin',
    'fill',
    'fill-opacity'
    ],
    Defaults: {
    'stroke-width': 1,
    'stroke': '#000000',
    'stroke-opacity': 1,
    'stroke-linecap': 'butt',
    'stroke-linejoin': 'miter',
    'fill': 'none',
    'fill-opacity': 1
    }
});
Geometrize.Style = Style;
