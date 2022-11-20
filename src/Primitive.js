// 2D Geometric Primitive base class
var Primitive = makeClass(EventEmitter, {
    constructor: function Primitive() {
        var _matrix = null,
            _style = null,
            _dom = null,
            onStyleChange
        ;

        this.id = uuid(this.constructor.name);

        _matrix = Matrix.eye();
        Object.defineProperty(this, 'matrix', {
            get() {
                return _matrix;
            },
            set(matrix) {
                matrix = Matrix(matrix);
                if (_matrix !== matrix)
                {
                    _matrix = matrix;
                    if (!self.isDirty())
                    {
                        self.isDirty(true);
                        self.triggerChange();
                    }
                }
            }
        });

        onStyleChange = function onStyleChange(style) {
            if (_style === style)
            {
                self.isDirty(true);
                self.triggerChange();
            }
        };
        _style = new Style();
        _style.onChange(onStyleChange);
        Object.defineProperty(this, 'style', {
            get() {
                return _style;
            },
            set(style) {
                style = Style(style);
                if (_style !== style)
                {
                    if (_style) _style.onChange(onStyleChange, false);
                    _style = style;
                    if (_style) _style.onChange(onStyleChange);
                    if (!self.isDirty())
                    {
                        self.isDirty(true);
                        self.triggerChange();
                    }
                }
            }
        });

        /*Object.defineProperty(this, 'dom', {
            get() {
                return _dom;
            },
            set(dom) {
                _dom = dom;
            }
        });*/
        self.isDirty(true);
    },
    id: '',
    dispose: function() {
        this.$super.dispose.call(this);
    },
    clone: function() {
        return this;
    },
    transform: function() {
        return this;
    },
    intersects: function(other) {
        return false;
    },
    hasPoint: function(point) {
        return false;
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
    toSVG: function(svg) {
        return arguments.length ? svg : '';
    },
    toTex: function() {
        return '\\text{Primitive}';
    },
    toString: function() {
        return 'Primitive()';
    }
});
