/**[DOC_MD]
 * ### Matrix2D, 2D Homogeneous Transformation Matrix
 *
 * Represents a homogeneous transformation matrix for 2D transforms
 *
 * ```javascript
 * const m = Matrix2D.translate(tx, ty).mul(Matrix2D.rotate(theta).mul(Matrix2D.scale(sx, sy)));
 * const invm = m.inv();
 * // p is a point, p2 is a transformed point
 * const p2 = m.transform(p);
 * ```
[/DOC_MD]**/
var Matrix2D = makeClass(null, {
    constructor: function Matrix2D(
        m00, m01, m02,
        m10, m11, m12
    ) {
        var self = this;
        if (m00 instanceof Matrix2D)
        {
            return m00;
        }
        if (!(self instanceof Matrix2D))
        {
            return new Matrix2D(
            m00, m01, m02,
            m10, m11, m12
            );
        }
        if (is_array(m00) && (6 <= m00.length))
        {
            self.$00 = Num(m00[0]);
            self.$01 = Num(m00[1]);
            self.$02 = Num(m00[2]);
            self.$10 = Num(m00[3]);
            self.$11 = Num(m00[4]);
            self.$12 = Num(m00[5]);
        }
        else
        {
            self.$00 = m00;
            self.$01 = m01;
            self.$02 = m02;
            self.$10 = m10;
            self.$11 = m11;
            self.$12 = m12;
        }
    },
    $00: 1,
    $01: 0,
    $02: 0,
    $10: 0,
    $11: 1,
    $12: 0,
    clone: function() {
        var self = this;
        return new Matrix2D(
        self.$00, self.$01, self.$02,
        self.$10, self.$11, self.$12
        );
    },
    eq: function(other) {
        if (other instanceof Matrix2D)
        {
            var self = this;
            return is_almost_equal(self.$00, other.$00) && is_almost_equal(self.$01, other.$01) && is_almost_equal(self.$02, other.$02) && is_almost_equal(self.$10, other.$10) && is_almost_equal(self.$11, other.$11) && is_almost_equal(self.$12, other.$12);
        }
        return false;
    },
    add: function(other) {
        var self = this;
        if (other instanceof Matrix2D)
        {
            return new Matrix2D(
            self.$00 + other.$00, self.$01 + other.$01, self.$02 + other.$02,
            self.$10 + other.$10, self.$11 + other.$11, self.$12 + other.$12
            );
        }
        else
        {
            other = Num(other);
            return new Matrix2D(
            self.$00 + other, self.$01 + other, self.$02 + other,
            self.$10 + other, self.$11 + other, self.$12 + other
            );
        }
    },
    mul: function(other) {
        var self = this,
        a00 = self.$00, a01 = self.$01, a02 = self.$02,
        a10 = self.$10, a11 = self.$11, a12 = self.$12,
        a20 = 0, a21 = 0, a22 = 1;
        if (other instanceof Matrix2D)
        {
            var b00 = other.$00, b01 = other.$01, b02 = other.$02,
            b10 = other.$10, b11 = other.$11, b12 = other.$12,
            b20 = 0, b21 = 0, b22 = 1;
            return new Matrix2D(
            a00*b00 + a01*b10,
            a00*b01 + a01*b11,
            a00*b02 + a01*b12 + a02,
            a10*b00 + a11*b10,
            a10*b01 + a11*b11,
            a10*b02 + a11*b12 + a12
            );
        }
        else
        {
            other = Num(other);
            return new Matrix2D(
            a00*other, a01*other, a02*other,
            a10*other, a11*other, a12*other
            );
        }
    },
    det: function() {
        var self = this,
        a00 = self.$00, a01 = self.$01, a02 = self.$02,
        a10 = self.$10, a11 = self.$11, a12 = self.$12,
        a20 = 0, a21 = 0, a22 = 1;
        //return a00*(a11*a22 - a12*a21) + a01*(a12*a20 - a10*a22) + a02*(a21*a10 - a11*a20);
        return a00*a11 - a01*a10;
    },
    inv: function() {
        var self = this,
            a00 = self.$00, a01 = self.$01, a02 = self.$02,
            a10 = self.$10, a11 = self.$11, a12 = self.$12,
            det2 = a00*a11 - a01*a10,
            i00 = 0, i01 = 0, i10 = 0, i11 = 0;

        if (is_strictly_equal(det2, 0)) return null;

        /*
        var det = self.det();
        return new Matrix2D(
        (a11*a22-a12*a21)/det, (a02*a21-a01*a22)/det, (a01*a12-a02*a11)/det,
        (a12*a20-a10*a22)/det, (a00*a22-a02*a20)/det, (a02*a10-a00*a12)/det,
        //(a10*a21-a11*a20)/det, (a01*a20-a00*a21)/det, (a00*a11-a01*a10)/det
        0, 0, 1
        );
        */
        i00 = a11/det2; i01 = -a01/det2;
        i10 = -a10/det2; i11 = a00/det2;
        return new Matrix2D(
        i00, i01, -i00*a02 - i01*a12,
        i10, i11, -i10*a02 - i11*a12
        );
    },
    transform: function(point, newpoint) {
        var self = this, x = point.x, y = point.y,
            nx = self.$00*x + self.$01*y + self.$02,
            ny = self.$10*x + self.$11*y + self.$12;
        if (newpoint)
        {
            newpoint.x = nx;
            newpoint.y = ny;
        }
        else
        {
            newpoint = new Point2D(nx, ny);
        }
        return newpoint;
    },
    getTranslation: function() {
        /*
        if matrix can be factored as:
        T * R * S = |1 0 tx| * |cos -sin 0| * |sx 0  0| = |sxcos -sysin tx| = |00 01 02|
                    |0 1 ty|   |sin cos  0|   |0  sy 0|   |sxsin sycos  ty|   |10 11 12|
                    |0 0 1 |   |0   0    1|   |0  0  1|   |0      0     1 |   |20 21 22|
        */
        var self = this;
        return {
            x: self.$02,
            y: self.$12
        };
    },
    getRotationAngle: function() {
        /*
        if matrix can be factored as:
        T * R * S = |1 0 tx| * |cos -sin 0| * |sx 0  0| = |sxcos -sysin tx| = |00 01 02|
                    |0 1 ty|   |sin cos  0|   |0  sy 0|   |sxsin sycos  ty|   |10 11 12|
                    |0 0 1 |   |0   0    1|   |0  0  1|   |0      0     1 |   |20 21 22|
        */
        var self = this;
        return stdMath.atan2(self.$10, self.$00);
    },
    getScale: function() {
        /*
        if matrix can be factored as:
        T * R * S = |1 0 tx| * |cos -sin 0| * |sx 0  0| = |sxcos -sysin tx| = |00 01 02|
                    |0 1 ty|   |sin cos  0|   |0  sy 0|   |sxsin sycos  ty|   |10 11 12|
                    |0 0 1 |   |0   0    1|   |0  0  1|   |0      0     1 |   |20 21 22|
        */
        var self = this,
            a = self.$00, b = -self.$01,
            c = self.$10, d = self.$11;
        return {
        x: sign(a)*hypot(a, c),
        y: sign(d)*hypot(b, d)
        };
    },
    toArray: function() {
        var self = this;
        return [
        self.$00, self.$01, self.$02,
        self.$10, self.$11, self.$12,
        0, 0, 1
        ];
    },
    toSVG: function() {
        var self = this;
        return 'matrix('+Str(self.$00)+' '+Str(self.$10)+' '+Str(self.$01)+' '+Str(self.$11)+' '+Str(self.$02)+' '+Str(self.$12)+')';
    },
    toCSS: function() {
        var self = this;
        return 'matrix('+Str(self.$00)+','+Str(self.$10)+','+Str(self.$01)+','+Str(self.$11)+','+Str(self.$02)+','+Str(self.$12)+')';
    },
    toCanvas: function(ctx, reset) {
        var self = this;
        ctx[true === reset ? 'setTransform' : 'transform'](self.$00, self.$10, self.$01, self.$11, self.$02, self.$12);
        return ctx;
    },
    toTex: function() {
        return Matrix2D.arrayTex(this.toArray(), 3, 3);
    },
    toString: function() {
        return Matrix2D.arrayString(this.toArray(), 3, 3);
    }
}, {
    eye: function() {
        return new Matrix2D(
        1,0,0,
        0,1,0
        );
    },
    translate: function(tx, ty) {
        return new Matrix2D(
        1, 0, Num(tx),
        0, 1, Num(ty)
        );
    },
    rotate: function(theta, ox, oy) {
        // (ox,oy) is rotation origin, default (0,0)
        oy = Num(oy || 0);
        ox = Num(ox || 0);
        theta = Num(theta || 0);
        var cos = stdMath.cos(theta), sin = stdMath.sin(theta);
        return new Matrix2D(
        cos, -sin, ox - cos*ox + sin*oy,
        sin,  cos, oy - cos*oy - sin*ox
        );
    },
    scale: function(sx, sy, ox, oy) {
        // (ox,oy) is scale origin, default (0,0)
        oy = Num(oy || 0);
        ox = Num(ox || 0);
        sx = Num(sx);
        sy = Num(sy);
        return new Matrix2D(
        sx, 0,  -sx*ox + ox,
        0,  sy, -sy*oy + oy
        );
    },
    reflectX: function() {
        return new Matrix2D(
        -1, 0, 0,
        0,  1, 0
        );
    },
    reflectY: function() {
        return new Matrix2D(
        1,  0, 0,
        0, -1, 0
        );
    },
    shearX: function(s) {
        return new Matrix2D(
        1, Num(s), 0,
        0, 1,      0
        );
    },
    shearY: function(s) {
        return new Matrix2D(
        1,      0, 0,
        Num(s), 1, 0
        );
    },
    arrayTex: function(array, rows, cols) {
        var tex = '\\begin{pmatrix}';
        for (var i=0; i<rows; ++i)
        {
            tex += array.slice(i*cols,i*cols+cols).join('&');
            if (i+1 < rows) tex += '\\\\';
        }
        tex += '\\end{pmatrix}';
        return tex;
    },
    arrayString: function(array, rows, cols) {
        var maxlen = array.reduce(function(maxlen, x) {
            return stdMath.max(maxlen, Str(x).length);
        }, 0);
        var str = '';
        for (var i=0; i<rows; ++i)
        {
            str += '['+array.slice(i*cols,i*cols+cols).map(function(x){return pad(x, maxlen);}).join(' ')+']';
            if (i+1 < rows) str += "\n";
        }
        return str;
    },
    pointTex: function(point) {
        return '\\begin{pmatrix}'+Str(point.x)+'\\\\'+Str(point.y)+'\\\\1\\end{pmatrix}';
    },
    pointString: function(point) {
        var maxlen = [point.x, point.y].reduce(function(maxlen, s) {
            return stdMath.max(maxlen, Str(s).length);
        }, 1);
        return '['+pad(point.x, maxlen)+"]\n["+pad(point.y, maxlen)+"]\n["+pad(1, maxlen)+']';
    }
});
var EYE = Matrix2D.eye();
Geometrize.Matrix2D = Matrix2D;
