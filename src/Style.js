// 2D Primitive Style class
// eg stroke, fill, width, ..
var Style = makeClass(EventEmitter, {
    constructor: function Style(style) {
        var self = this, _props = null, _style = null;
        if (style instanceof Style) return style;
        if (!(self instanceof Style)) return new Style(style);
        _props = ['stroke', 'stroke-width', 'fill'];
        // defaults
        _style = {
            'stroke': '#000000',
            'stroke-width': 1,
            'fill': null
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
                        if (!self.isDirty())
                        {
                            self.isDirty(true);
                            self.triggerChange();
                        }
                    }
                }
            });
        });
        self.isDirty(true);
    },
    dispose: function() {
        this.$super.dispose.call(this);
    },
    clone: function() {
        return new Style({
            stroke: this.stroke,
            fill: this.fill,
            width: this.width
        });
    },
    toSVG: function() {
        var styl = this;
        return 'stroke:'+Str(styl['stroke'])+';stroke-width:'+Str(styl['stroke-width'])+';'+(null != styl['fill'] ? 'fill:'+Str(styl['fill'])+';' : '');
    }
});
