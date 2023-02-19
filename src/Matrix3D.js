/**[DOC_MD]
 * ### Matrix3D 3D Homogeneous Transformation Matrix
 *
 * Represents a homogeneous transformation matrix for 3D transforms
 *
 * ```javascript
 * const m = Matrix3D.translate(tx, ty, tz).mul(Matrix3D.rotateZ(theta).mul(Matrix3D.scale(sx, sy, sz)));
 * const invm = m.inv();
 * // p is a point, p2 is a transformed point
 * const p2 = m.transform(p);
 * ```
[/DOC_MD]**/
var Matrix3D = makeClass(null, {
    constructor: function Matrix3D(
        m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23
    ) {
        var self = this;
        if (m00 instanceof Matrix3D)
        {
            return m00;
        }
        if (!(self instanceof Matrix3D))
        {
            return new Matrix3D(
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23
            );
        }
        if (is_array(m00) && (12 <= m00.length))
        {
            self.$00 = Num(m00[0]);
            self.$01 = Num(m00[1]);
            self.$02 = Num(m00[2]);
            self.$03 = Num(m00[3]);
            self.$10 = Num(m00[4]);
            self.$11 = Num(m00[5]);
            self.$12 = Num(m00[6]);
            self.$13 = Num(m00[7]);
            self.$20 = Num(m00[8]);
            self.$21 = Num(m00[9]);
            self.$22 = Num(m00[10]);
            self.$23 = Num(m00[11]);
        }
        else
        {
            self.$00 = m00;
            self.$01 = m01;
            self.$02 = m02;
            self.$03 = m03;
            self.$10 = m10;
            self.$11 = m11;
            self.$12 = m12;
            self.$13 = m13;
            self.$20 = m20;
            self.$21 = m21;
            self.$22 = m22;
            self.$23 = m23;
        }
    },
    $00: 1,
    $01: 0,
    $02: 0,
    $03: 0,
    $10: 0,
    $11: 1,
    $12: 0,
    $13: 0,
    $20: 0,
    $21: 0,
    $22: 1,
    $23: 0,
    clone: function() {
        var self = this;
        return new Matrix3D(
        self.$00, self.$01, self.$02, self.$03,
        self.$10, self.$11, self.$12, self.$13,
        self.$20, self.$21, self.$22, self.$23
        );
    },
    eq: function(other) {
        if (other instanceof Matrix3D)
        {
            var self = this;
            return is_almost_equal(self.$00, other.$00) &&
                is_almost_equal(self.$01, other.$01) &&
                is_almost_equal(self.$02, other.$02) &&
                is_almost_equal(self.$03, other.$03) &&
                is_almost_equal(self.$10, other.$10) &&
                is_almost_equal(self.$11, other.$11) &&
                is_almost_equal(self.$12, other.$12) &&
                is_almost_equal(self.$13, other.$13) &&
                is_almost_equal(self.$20, other.$20) &&
                is_almost_equal(self.$21, other.$21) &&
                is_almost_equal(self.$22, other.$22) &&
                is_almost_equal(self.$23, other.$23)
            ;
        }
        return false;
    },
    add: function(other) {
        var self = this;
        if (other instanceof Matrix3D)
        {
            return new Matrix3D(
            self.$00 + other.$00, self.$01 + other.$01, self.$02 + other.$02, self.$03 + other.$03,
            self.$10 + other.$10, self.$11 + other.$11, self.$12 + other.$12, self.$13 + other.$13,
            self.$20 + other.$20, self.$21 + other.$21, self.$22 + other.$22, self.$23 + other.$23
            );
        }
        else
        {
            other = Num(other);
            return new Matrix3D(
            self.$00 + other, self.$01 + other, self.$02 + other, self.$03 + other,
            self.$10 + other, self.$11 + other, self.$12 + other, self.$13 + other,
            self.$20 + other, self.$21 + other, self.$22 + other, self.$23 + other
            );
        }
    },
    mul: function(other) {
        var self = this,
            a00 = self.$00, a01 = self.$01, a02 = self.$02, a03 = self.$03,
            a10 = self.$10, a11 = self.$11, a12 = self.$12, a13 = self.$13,
            a20 = self.$20, a21 = self.$21, a22 = self.$22, a23 = self.$23,
            a30 = 0, a31 = 0, a32 = 0, a33 = 1;
        if (other instanceof Matrix3D)
        {
            var b00 = other.$00, b01 = other.$01, b02 = other.$02, b03 = other.$03,
            b10 = other.$10, b11 = other.$11, b12 = other.$12, b13 = other.$13,
            b20 = other.$20, b21 = other.$21, b22 = other.$22, b23 = other.$23,
            b30 = 0, b31 = 0, b32 = 0, b33 = 1;
            return new Matrix3D(
            a00*b00 + a01*b10 + a02*b20,
            a00*b01 + a01*b11 + a02*b21,
            a00*b02 + a01*b12 + a02*b22,
            a00*b03 + a01*b13 + a02*b23 + a03,
            a10*b00 + a11*b10 + a12*b20,
            a10*b01 + a11*b11 + a12*b21,
            a10*b02 + a11*b12 + a12*b22,
            a10*b03 + a11*b13 + a12*b23 + a13,
            a20*b00 + a21*b10 + a22*b20,
            a20*b01 + a21*b11 + a22*b21,
            a20*b02 + a21*b12 + a22*b22,
            a20*b03 + a21*b13 + a22*b23 + a23
            );
        }
        else
        {
            other = Num(other);
            return new Matrix3D(
            a00*other, a01*other, a02*other, a03*other,
            a10*other, a11*other, a12*other, a13*other,
            a20*other, a21*other, a22*other, a23*other
            );
        }
    },
    det: function() {
        var self = this,
        a00 = self.$00, a01 = self.$01, a02 = self.$02, a03 = self.$03,
        a10 = self.$10, a11 = self.$11, a12 = self.$12, a13 = self.$13,
        a20 = self.$20, a21 = self.$21, a22 = self.$22, a23 = self.$23,
        a30 = 0, a31 = 0, a32 = 0, a33 = 1;
        //return a00*a11*a22*a33 + a00*a12*a23*a31 + a00*a13*a21*a32 - a00*a13*a22*a31 - a00*a12*a21*a33 - a00*a11*a23*a32 - a01*a10*a22*a33 - a02*a10*a23*a31 - a03*a10*a21*a32 + a03*a10*a22*a31 + a02*a10*a21*a33 + a01*a10*a23*a32 + a01*a12*a20*a33 + a02*a13*a20*a31 + a03*a11*a20*a32 - a03*a12*a20*a31 - a02*a11*a20*a33 - a01*a13*a20*a32 - a01*a12*a23*a30 - a02*a13*a21*a30 - a03*a11*a22*a30 + a03*a12*a21*a30 + a02*a11*a23*a30 + a01*a13*a22*a30;
        return a00*(a11*a22 - a12*a21) + a01*(a12*a20 - a10*a22) + a02*(a21*a10 - a11*a20);
    },
    inv: function() {
        var self = this,
            a00 = self.$00, a01 = self.$01, a02 = self.$02, a03 = self.$03,
            a10 = self.$10, a11 = self.$11, a12 = self.$12, a13 = self.$13,
            a20 = self.$20, a21 = self.$21, a22 = self.$22, a23 = self.$23,
            det3 = a00*(a11*a22 - a12*a21) + a01*(a12*a20 - a10*a22) + a02*(a21*a10 - a11*a20),
            i00 = 0, i01 = 0, i02 = 0, i03 = 0,
            i10 = 0, i11 = 0, i12 = 0, i13 = 0,
            i20 = 0, i21 = 0, i22 = 0, i23 = 0;

        if (is_strictly_equal(det3, 0)) return null;

        i00 = (a11*a22-a12*a21)/det3;
        i01 = (a02*a21-a01*a22)/det3;
        i02 = (a01*a12-a02*a11)/det3;
        i10 = (a12*a20-a10*a22)/det3;
        i11 = (a00*a22-a02*a20)/det3;
        i12 = (a02*a10-a00*a12)/det3;
        i20 = (a10*a21-a11*a20)/det3;
        i21 = (a01*a20-a00*a21)/det3;
        i22 = (a00*a11-a01*a10)/det3;
        return new Matrix3D(
        i00, i01, i02, -i00*a03 - i01*a13 - i02*a23,
        i10, i11, i12, -i10*a03 - i11*a13 - i12*a23,
        i20, i21, i22, -i20*a03 - i21*a13 - i22*a23
        );
    },
    transform: function(point, newpoint) {
        var self = this,
            x = point.x,
            y = point.y,
            z = point.z,
            nx = self.$00*x + self.$01*y + self.$02*z + self.$03,
            ny = self.$10*x + self.$11*y + self.$12*z + self.$13,
            nz = self.$20*x + self.$21*y + self.$22*z + self.$23
            ;
        if (newpoint)
        {
            newpoint.x = nx;
            newpoint.y = ny;
            newpoint.z = nz;
        }
        else
        {
            newpoint = new Point3D(nx, ny, nz);
        }
        return newpoint;
    },
    toArray: function() {
        var self = this;
        return [
        self.$00, self.$01, self.$02, self.$03,
        self.$10, self.$11, self.$12, self.$13,
        self.$20, self.$21, self.$22, self.$23,
        0, 0, 0, 1
        ];
    },
    toTex: function() {
        return Matrix3D.arrayTex(this.toArray(), 4, 4);
    },
    toString: function() {
        return Matrix3D.arrayString(this.toArray(), 4, 4);
    }
}, {
    eye: function() {
        return new Matrix3D(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0
        );
    },
    translate: function(tx, ty, tz) {
        return new Matrix3D(
        1, 0, 0, Num(tx),
        0, 1, 0, Num(ty),
        0, 0, 1, Num(tz)
        );
    },
    rotateX: function(theta, ox, oy, oz) {
        // (ox,oy,oz) is rotation origin, default (0,0,0)
        oz = Num(oz || 0);
        oy = Num(oy || 0);
        ox = Num(ox || 0);
        theta = Num(theta || 0);
        var cos = stdMath.cos(theta), sin = stdMath.sin(theta);
        return new Matrix3D(
        1,  0,   0,   0,
        0,  cos, sin, oy - cos*oy - sin*oz,
        0, -sin, cos, oz - cos*oz + sin*oy
        );
    },
    rotateY: function(theta, ox, oy, oz) {
        // (ox,oy,oz) is rotation origin, default (0,0,0)
        oz = Num(oz || 0);
        oy = Num(oy || 0);
        ox = Num(ox || 0);
        theta = Num(theta || 0);
        var cos = stdMath.cos(theta), sin = stdMath.sin(theta);
        return new Matrix3D(
         cos, 0, sin, ox - cos*ox - sin*oz,
         0,   1, 0,   0,
        -sin, 0, cos, oz - cos*oz + sin*ox
        );
    },
    rotateZ: function(theta, ox, oy, oz) {
        // (ox,oy,oz) is rotation origin, default (0,0,0)
        oz = Num(oz || 0);
        oy = Num(oy || 0);
        ox = Num(ox || 0);
        theta = Num(theta || 0);
        var cos = stdMath.cos(theta), sin = stdMath.sin(theta);
        return new Matrix3D(
         cos, sin, 0, ox - cos*ox - sin*oy,
        -sin, cos, 0, oy - cos*oy + sin*ox,
         0,   0,   1, 0
        );
    },
    rotateAxis: function(theta, ux, uy, uz, ox, oy, oz) {
        // rotate about arbitrary axis defined by vector ux,uy,uz
        // (ox,oy,oz) is axis/rotation origin, default (0,0,0)
        oz = Num(oz || 0);
        oy = Num(oy || 0);
        ox = Num(ox || 0);
        uz = Num(uz || 0);
        uy = Num(uy || 0);
        ux = Num(ux || 0);
        theta = Num(theta || 0);
        // normalize to unit vector at origin
        ux -= ox;
        uy -= oy;
        uz -= oz;
        var d = stdMath.sqrt(ux*ux + uy*uy + uz*uz);
        ux /= d;
        uy /= d;
        uz /= d;
        // compute rotation matrix about unit vector
        var cos = stdMath.cos(theta), sin = stdMath.sin(theta), scos = 1 - cos,
            sxy = ux*uy*scos, syz = uy*uz*scos, sxz = ux*uz*scos,
            sz = sin*uz, sy = sin*uy, sx = sin*ux;
        var R = new Matrix3D(
          cos + ux*ux*scos, -sz + sxy        ,  sy + sxz        , 0,
          sz + sxy        ,  cos + uy*uy*scos, -sx + syz        , 0,
         -sy + sxz        ,  sx + syz        ,  cos + uz*uz*scos, 0
        );
        // translate to origin if needed
        if (ox || oy || oz)
        {
            R = R.mul(new Matrix3D(
            1, 0, 0, -ox,
            0, 1, 0, -oy,
            0, 0, 1, -oz
            ));
            R.$03 += ox;
            R.$13 += oy;
            R.$23 += oz;
        }
        return R;
    },
    scale: function(sx, sy, sz, ox, oy, oz) {
        // (ox,oy,oz) is scale origin, default (0,0,0)
        oz = Num(oz || 0);
        oy = Num(oy || 0);
        ox = Num(ox || 0);
        sx = Num(sx);
        sy = Num(sy);
        sz = Num(sz);
        return new Matrix3D(
        sx, 0,  0, -sx*ox + ox,
        0,  sy, 0, -sy*oy + oy,
        0,  0, sz, -sz*oz + oz
        );
    },
    reflectX: function() {
        return new Matrix3D(
        -1, 0, 0, 0,
        0,  1, 0, 0,
        0,  0, 1, 0
        );
    },
    reflectY: function() {
        return new Matrix3D(
        1,  0, 0, 0,
        0, -1, 0, 0
        0,  0, 1, 0
        );
    },
    reflectZ: function() {
        return new Matrix3D(
        1, 0,  0, 0,
        0, 1,  0, 0
        0, 0, -1, 0
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
        return '\\begin{pmatrix}'+Str(point.x)+'\\\\'+Str(point.y)+'\\\\'+Str(point.z)+'\\\\1\\end{pmatrix}';
    },
    pointString: function(point) {
        var maxlen = [point.x, point.y, point.z].reduce(function(maxlen, s) {
            return stdMath.max(maxlen, Str(s).length);
        }, 1);
        return '['+pad(point.x, maxlen)+"]\n["+pad(point.y, maxlen)+"]\n["+pad(point.z, maxlen)+"]\n["+pad(1, maxlen)+']';
    }
});
var EYE3D = Matrix3D.eye();
Geometrize.Matrix3D = Matrix3D;
