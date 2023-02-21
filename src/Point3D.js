/**[DOC_MD]
 * ### Point3D (subclass of Object3D)
 *
 * Represents a point in 3D space
 *
 * ```javascript
 * const p = Point3D(x, y, z);
 * p.x += 10; // change it
 * p.y += 5; // change it
 * p.z = 20; // change it
 * ```
[/DOC_MD]**/
var Point3D = makeClass(Object3D, {
    constructor: function Point3D(x, y, z) {
        var self = this, _x = 0, _y = 0, _z = 0, _n = null;
        if (x instanceof Point3D)
        {
            return x;
        }
        if (!(self instanceof Point3D))
        {
            return new Point3D(x, y, z);
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
            _z = Num(x.z);
        }
        else if (x instanceof Point2D)
        {
            _x = x.x;
            _y = x.y;
            _z = 0;
        }
        else
        {
            _x = Num(x);
            _y = Num(y);
            _z = Num(z);
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
        def(self, 'z', {
            get: function() {
                return _z;
            },
            set: function(z) {
                z = Num(z);
                var isChanged = !is_almost_equal(z, _z);
                _z = z;
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
                    _n = hypot3(_x, _y, _z);
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
            _z = null;
            self.$super('dispose');
        };
    },
    name: 'Point3D',
    clone: function() {
        return new Point3D(this.x, this.y, this.z);
    },
    transform: function(matrix) {
        return matrix.transform(this);
    },
    getBoundingBox: function() {
        var self = this;
        return {
        zmin: self.z,
        ymin: self.y,
        xmin: self.x,
        zmax: self.z,
        ymax: self.y,
        xmax: self.x
        };
    },
    eq: function(other) {
        var self = this;
        if (other instanceof Point3D)
        {
            return p_eq3(self, other);
        }
        else if (null != other.x && null != other.y && null != other.z)
        {
            return p_eq3(self, other);
        }
        else if (is_array(other))
        {
            return p_eq3(self, {x: other[0], y: other[1], z: other[2]});
        }
        return false;
    },
    add: function(other) {
        var self = this;
        return other instanceof Point3D ? new Point3D(self.x+other.x, self.y+other.y, self.z+other.z) : new Point3D(self.x+Num(other), self.y+Num(other), self.z+Num(other));
    },
    mul: function(other) {
        other = Num(other);
        return new Point3D(this.x*other, this.y*other, this.z*other);
    },
    dot: function(other) {
        return dotp3(this.x, this.y, this.z, other.x, other.y, other.z);
    },
    cross: function(other) {
        return crossp3(this.x, this.y, this.z, other.x, other.y, other.z);
    },
    intersects: function(other) {
        if (other instanceof Point3D)
        {
            return this.eq(other) ? [this] : false;
        }
        else if (other instanceof Object3D)
        {
            return other.intersects(this);
        }
        return false;
    },
    toObj: function() {
        return {
            x: this.x,
            y: this.y,
            z: this.z
        };
    },
    toTex: function() {
        var self = this;
        return '\\begin{pmatrix}'+Str(self.x)+'\\\\'+Str(self.y)+'\\\\'+Str(self.z)+'\\end{pmatrix}';
    },
    toString: function() {
        var self = this;
        return 'Point3D('+Str(self.x)+','+Str(self.y)+','+Str(self.z)+')';
    }
});
Geometrize.Point3D = Point3D;
