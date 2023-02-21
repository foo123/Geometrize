/**[DOC_MD]
 * ### Point2D (subclass of Object2D)
 *
 * Represents a point in 2D space
 *
 * ```javascript
 * const p = Point2D(x, y);
 * p.x += 10; // change it
 * p.y = 5; // change it
 * ```
[/DOC_MD]**/
var Point2D = makeClass(Object2D, {
    constructor: function Point2D(x, y) {
        var self = this, _x = 0, _y = 0, _n = null;
        if (x instanceof Point2D)
        {
            return x;
        }
        if (!(self instanceof Point2D))
        {
            return new Point2D(x, y);
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
                if (isChanged /*&& !self.isChanged()*/)
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
                if (isChanged /*&& !self.isChanged()*/)
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
    name: 'Point2D',
    clone: function() {
        return new Point2D(this.x, this.y);
    },
    transform: function(matrix) {
        return matrix.transform(this);
    },
    getBoundingBox: function() {
        var self = this;
        return {
        ymin: self.y,
        xmin: self.x,
        ymax: self.y,
        xmax: self.x
        };
    },
    eq: function(other) {
        var self = this;
        if (other instanceof Point2D)
        {
            return p_eq(self, other);
        }
        else if (null != other.x && null != other.y)
        {
            return p_eq(self, other);
        }
        else if (is_array(other))
        {
            return p_eq(self, {x: other[0], y: other[1]});
        }
        return false;
    },
    add: function(other) {
        var self = this;
        return other instanceof Point2D ? new Point2D(self.x+other.x, self.y+other.y) : new Point2D(self.x+Num(other), self.y+Num(other));
    },
    mul: function(other) {
        other = Num(other);
        return new Point2D(this.x*other, this.y*other);
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
        return point_on_line_segment(this, p1, p2);
    },
    distanceToLine: function(p1, p2) {
        return point_line_distance(this, p1, p2);
    },
    isOn: function(curve) {
        return is_function(curve.hasPoint) ? curve.hasPoint(this) : false;
    },
    isInside: function(closedCurve, strict) {
        return is_function(closedCurve.hasInsidePoint) ? closedCurve.hasInsidePoint(this, strict) : false;
    },
    intersects: function(other) {
        if (other instanceof Point2D)
        {
            return this.eq(other) ? [this] : false;
        }
        else if (other instanceof Object2D)
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
        var self = this;
        return SVG('circle', {
            'id': [self.id, false],
            'cx': [self.x, self.isChanged()],
            'cy': [self.y, self.isChanged()],
            'r': [self.style['stroke-width'], self.style.isChanged()],
            'style': ['fill:'+Str(self.style['stroke'])+';', self.style.isChanged()]
        }, arguments.length ? svg : false);
    },
    toSVGPath: function(svg) {
        var c = this, r = c.style['stroke-width'],
            path = 'M '+Str(c.x - r)+' '+Str(c.y)+' a '+Str(r)+' '+Str(r)+' 0 0 0 '+Str(r + r)+' 0 a '+Str(r)+' '+Str(r)+' 0 0 0 '+Str(-r - r)+' 0 Z';
        return arguments.length ? SVG('path', {
            'id': [c.id, false],
            'd': [path, c.isChanged()],
            'style': ['fill:'+Str(c.style['stroke'])+';', c.style.isChanged()]
        }, svg) : path;
    },
    toCanvas: function(ctx) {
        var self = this;
        ctx.fillStyle = self.style['stroke']
        self.toCanvasPath(ctx);
    },
    toCanvasPath: function(ctx) {
        var self = this;
        ctx.beginPath();
        ctx.arc(self.x, self.y, self.style['stroke-width'], 0, TWO_PI);
        ctx.closePath();
        ctx.fill();
    },
    toTex: function() {
        var self = this;
        return '\\begin{pmatrix}'+Str(self.x)+'\\\\'+Str(self.y)+'\\end{pmatrix}';
    },
    toString: function() {
        var self = this;
        return 'Point2D('+Str(self.x)+','+Str(self.y)+')';
    }
});
Geometrize.Point2D = Point2D;
