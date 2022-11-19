// 2D Point class
var Point = makeClass(Primitive, {
    constructor: function Point(x, y) {
        var self = this, _x = 0, _y = 0;
        if (x instanceof Point)
        {
            return x;
        }
        if (!(self instanceof Point))
        {
            return new Point(x, y);
        }
        Primitive.call(self);
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
        Object.defineProperty(self, 'x', {
            get() {
                return _x;
            },
            set(x) {
                x = Num(x);
                if (_x !== x)
                {
                    _x = x;
                    if (!self.isDirty())
                    {
                        self.isDirty(true);
                        self.triggerChange();
                    }
                }
            }
        });
        Object.defineProperty(self, 'y', {
            get() {
                return _y;
            },
            set(y) {
                y = Num(y);
                if (_y !== y)
                {
                    _y = y;
                    if (!self.isDirty())
                    {
                        self.isDirty(true);
                        self.triggerChange();
                    }
                }
            }
        });
        self.dispose = function() {
            _x = null;
            _y = null;
            self.$super.dispose.call(self);
        };
    },
    clone: function() {
        return new Point(this.x, this.y);
    },
    transform: function(matrix) {
        return matrix.transform(this);
    },
    getBoundingBox: function() {
        return {
        top: this.y,
        left: this.x,
        bottom: this.y,
        right: this.x
        };
    },
    isEqual: function(other) {
        if (other instanceof Point)
        {
            return is_almost_equal(this.x, other.x) && is_almost_equal(this.y, other.y);
        }
        return false;
    },
    add: function(other) {
        return other instanceof Point ? new Point(this.x+other.x, this.y+other.y) : new Point(this.x+other,this.y+other);
    },
    mul: function(other) {
        return new Point(this.x*other,this.y*other);
    },
    dot: function(other) {
        return dotp(this.x, this.y, other.x, other.y);
    },
    cross: function(other) {
        return crossp(this.x, this.y, other.x, other.y);
    },
    distanceToLine: function(p1, p2) {
        return p1 instanceof Line ? point_line_distance(this, p1.start, p1.end) : point_line_distance(this, p1, p2);
    },
    isOnLine: function(p1, p2) {
        return !!(p1 instanceof Line ? points_colinear(this, p1.start, p1.end) : points_colinear(this, p1, p2));
    },
    intersects: function(other) {
        if (other instanceof Point)
        {
            return this.isEqual(other) ? this : false;
        }
        else if ((other instanceof Primitive) && is_function(other.intersects))
        {
            return other.intersects(this);
        }
        return false;
    },
    toTex: function() {
        return '\begin{pmatrix}'+Str(this.x)+'\\\\'+Str(this.y)+'\end{pmatrix}';
    },
    toString: function() {
        return 'Point('+Str(this.x)+','+Str(this.y)+')';
    }
});
