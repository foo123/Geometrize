// 2D Point class
var Point = makeClass(Primitive, {
    constructor: function Point(x, y) {
        var self = this, _x = 0, _y = 0, _n = null;
        if (x instanceof Point)
        {
            return x;
        }
        if (!(self instanceof Point))
        {
            return new Point(x, y);
        }
        self.$super('constructor');
        if (is_array(x))
        {
            _x = Num(x[0]);
            _y = Num(x[1]);
        }
        else if (is_object(x))
        {
            _x = Num(x.x);
            _y = Num(x.y);
        }
        else
        {
            _x = Num(x);
            _y = Num(y);
        }
        def(self, 'x', {
            get: function() {
                return _x;
            },
            set: function(x) {
                x = Num(x);
                var isChanged = !is_almost_equal(x, _x);
                _x = x;
                if (isChanged && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'y', {
            get: function() {
                return _y;
            },
            set: function(y) {
                y = Num(y);
                var isChanged = !is_almost_equal(y, _y);
                _y = y;
                if (isChanged && !self.isChanged())
                {
                    self.isChanged(true);
                    self.triggerChange();
                }
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'norm', {
            get: function() {
                if (null == _n)
                {
                    _n = hypot(_x, _y);
                }
                return _n;
            },
            enumerable: true,
            configurable: false
        });
        self.isChanged = function(isChanged) {
            if (true === isChanged)
            {
                _n = null;
            }
            return self.$super('isChanged', arguments);
        };
        self.dispose = function() {
            _x = null;
            _y = null;
            self.$super('dispose');
        };
    },
    name: 'Point',
    clone: function() {
        return new Point(this.x, this.y);
    },
    transform: function(matrix) {
        return matrix.transform(this);
    },
    getBoundingBox: function() {
        return {
        ymin: this.y,
        xmin: this.x,
        ymax: this.y,
        xmax: this.x
        };
    },
    eq: function(other) {
        if (other instanceof Point)
        {
            return p_eq(this, other);
        }
        else if (null != other.x && null != other.y)
        {
            return p_eq(this, other);
        }
        else if (is_array(other))
        {
            return p_eq(this, {x: other[0], y: other[1]});
        }
        return false;
    },
    add: function(other) {
        return other instanceof Point ? new Point(this.x+other.x, this.y+other.y) : new Point(this.x+Num(other), this.y+Num(other));
    },
    mul: function(other) {
        other = Num(other);
        return new Point(this.x*other, this.y*other);
    },
    dot: function(other) {
        return dotp(this.x, this.y, other.x, other.y);
    },
    cross: function(other) {
        return crossp(this.x, this.y, other.x, other.y);
    },
    angle: function(other) {
        return angle(this.x, this.y, other.x, other.y);
    },
    between: function(p1, p2) {
        return !!(p1 instanceof Line ? point_on_line_segment(this, p1.start, p1.end) : point_on_line_segment(this, p1, p2));
    },
    distanceToLine: function(p1, p2) {
        return p1 instanceof Line ? point_line_distance(this, p1.start, p1.end) : point_line_distance(this, p1, p2);
    },
    isOn: function(curve) {
        return is_function(curve.hasPoint) ? curve.hasPoint(this) : false;
    },
    isInside: function(closedCurve, strict) {
        return is_function(closedCurve.hasInsidePoint) ? closedCurve.hasInsidePoint(this, strict) : false;
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.eq(other) ? [this] : false;
        }
        else if (other instanceof Primitive)
        {
            return other.intersects(this);
        }
        return false;
    },
    toObj: function() {
        return {
            x: this.x,
            y: this.y
        };
    },
    bezierPoints: function() {
        var x = this.x, y = this.y;
        return [
        [{x:x, y:y}, {x:x, y:y}, {x:x, y:y}, {x:x, y:y}]
        ];
    },
    toSVG: function(svg) {
        return SVG('circle', {
            'id': [this.id, false],
            'cx': [this.x, this.isChanged()],
            'cy': [this.y, this.isChanged()],
            'r': [this.style['stroke-width'], this.style.isChanged()],
            //'transform': [this.matrix.toSVG(), this.isChanged()],
            'style': ['fill:'+Str(this.style['stroke'])+';', this.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var c = this, r = this.style['stroke-width'],
            path = 'M '+Str(c.x - r)+' '+Str(c.y)+' a '+Str(r)+' '+Str(r)+' 0 0 0 '+Str(r + r)+' 0 a '+Str(r)+' '+Str(r)+' 0 0 0 '+Str(-r - r)+' 0 z';
        return arguments.length ? SVG('path', {
            'id': [this.id, false],
            'd': [path, this.isChanged()],
            'style': ['fill:'+Str(this.style['stroke'])+';', this.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.style['stroke'];
        ctx.arc(this.x, this.y, this.style['stroke-width'], 0, TWO_PI);
        ctx.fill();
        //ctx.closePath();
    },
    toTex: function() {
        return '\\begin{pmatrix}'+Str(this.x)+'\\\\'+Str(this.y)+'\\end{pmatrix}';
    },
    toString: function() {
        return 'Point('+Str(this.x)+','+Str(this.y)+')';
    }
});
Geometrize.Point = Point;
