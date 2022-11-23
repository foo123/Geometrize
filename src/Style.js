// 2D Primitive Style class
// eg stroke, fill, width, ..
var Style = makeClass(Changeable, {
    constructor: function Style(style) {
        var self = this, _props = null, _style = null;
        if (style instanceof Style) return style;
        if (!(self instanceof Style)) return new Style(style);
        _props = [
            'stroke-width',
            'stroke',
            'stroke-opacity',
            'stroke-linecap',
            'stroke-linejoin',
            'fill',
            'fill-opacity'
        ];
        // defaults
        _style = {
            'stroke-width': 1,
            'stroke': '#000000',
            'stroke-opacity': 1,
            'stroke-linecap': 'butt',
            'stroke-linejoin': 'miter',
            'fill': 'none',
            'fill-opacity': 1
        };
        if (is_object(style))
        {
            _style = merge(_props, _style, style);
        }
        _props.forEach(function(p) {
            Object.defineProperty(self, p, {
                get() {
                    return _style[p];
                },
                set(val) {
                    if (_style[p] !== val)
                    {
                        _style[p] = val;
                        if (!self.isChanged())
                        {
                            self.isChanged(true);
                            self.triggerChange();
                        }
                    }
                }
            });
        });
        self.toObj = function() {
            return _props.reduce(function(o, p) {
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
    }
});
