// 2D Geometric Primitive base class
var Primitive = makeClass(Changeable, {
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
                    if (!self.isChanged())
                    {
                        self.isChanged(true);
                        self.triggerChange();
                    }
                }
            }
        });

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
});