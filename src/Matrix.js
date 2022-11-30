// 2D Homogeneous Transformation Matrix class
var Matrix = makeClass(null, {
    constructor: function Matrix(
        m00, m01, m02,
        m10, m11, m12,
        m20, m21, m22
    ) {
        var self = this;
        if (m00 instanceof Matrix)
        {
            return m00;
        }
        if (!(self instanceof Matrix))
        {
            return new Matrix(
            m00, m01, m02,
            m10, m11, m12,
            m20, m21, m22
            );
        }
        if (is_array(m00) && (9 <= m00.length))
        {
            self.$00 = Num(m00[0]);
            self.$01 = Num(m00[1]);
            self.$02 = Num(m00[2]);
            self.$10 = Num(m00[3]);
            self.$11 = Num(m00[4]);
            self.$12 = Num(m00[5]);
            self.$20 = 0;
            self.$21 = 0;
            self.$22 = 1;
        }
        else
        {
            self.$00 = m00;
            self.$01 = m01;
            self.$02 = m02;
            self.$10 = m10;
            self.$11 = m11;
            self.$12 = m12;
            self.$20 = 0;
            self.$21 = 0;
            self.$22 = 1;
        }
    },
    $00: 1,
    $01: 0,
    $02: 0,
    $10: 0,
    $11: 1,
    $12: 0,
    $20: 0,
    $21: 0,
    $22: 1,
    clone: function() {
        var self = this;
        return new Matrix(
        self.$00, self.$01, self.$02,
        self.$10, self.$11, self.$12,
        //self.$20, self.$21, self.$22
        0, 0, 1
        );
    },
    eq: function(other) {
        if (other instanceof Matrix)
        {
            var self = this;
            return is_almost_equal(self.$00, other.$00) && is_almost_equal(self.$01, other.$01) && is_almost_equal(self.$02, other.$02) && is_almost_equal(self.$10, other.$10) && is_almost_equal(self.$11, other.$11) && is_almost_equal(self.$12, other.$12);
        }
        return false;
    },
    add: function(other) {
        var self = this;
        if (other instanceof Matrix)
        {
            return new Matrix(
                self.$00 + other.$00, self.$01 + other.$01, self.$02 + other.$02,
                self.$10 + other.$10, self.$11 + other.$11, self.$12 + other.$12,
                0, 0, 1
            );
        }
        else
        {
            other = Num(other);
            return new Matrix(
                self.$00 + other, self.$01 + other, self.$02 + other,
                self.$10 + other, self.$11 + other, self.$12 + other,
                0, 0, 1
            );
        }
    },
    mul: function(other) {
        var self = this;
        if (other instanceof Matrix)
        {
            return new Matrix(
                self.$00*other.$00 + self.$01*other.$10 + self.$02*other.$20,
                self.$00*other.$01 + self.$01*other.$11 + self.$02*other.$21,
                self.$00*other.$02 + self.$01*other.$12 + self.$02*other.$22,
                self.$10*other.$00 + self.$11*other.$10 + self.$12*other.$20,
                self.$10*other.$01 + self.$11*other.$11 + self.$12*other.$21,
                self.$10*other.$02 + self.$11*other.$12 + self.$12*other.$22,
                0, 0, 1
            );
        }
        else
        {
            other = Num(other);
            return new Matrix(
                self.$00*other, self.$01*other, self.$02*other,
                self.$10*other, self.$11*other, self.$12*other,
                0, 0, 1
            );
        }
    },
    det: function() {
        var self = this;
        return self.$00*(self.$11*self.$22 - self.$12*self.$21) + self.$01*(self.$12*self.$20 - self.$10*self.$22) + self.$02*(self.$21*self.$10 - self.$11*self.$20);
    },
    inv: function() {
        var self = this,
            a00 = self.$00, a01 = self.$01, a02 = self.$02,
            a10 = self.$10, a11 = self.$11, a12 = self.$12,
            //a20 = self.$20, a21 = self.$21, a22 = self.$22,
            det2 = a00*a11 - a01*a10,
            i00 = 0, i01 = 0, i10 = 0, i11 = 0;

        if (is_almost_zero(det2)) return null;

        /*return new Matrix(
        (a11*a22-a12*a21)/det, (a02*a21-a01*a22)/det, (a01*a12-a02*a11)/det,
        (a12*a20-a10*a22)/det, (a00*a22-a02*a20)/det, (a02*a10-a00*a12)/det,
        //(a10*a21-a11*a20)/det, (a01*a20-a00*a21)/det, (a00*a11-a01*a10)/det
        0, 0, 1
        );*/
        i00 = a11/det2; i01 = -a01/det2;
        i10 = -a10/det2; i11 = a00/det2;
        return new Matrix(
        i00, i01, -i00*a02 - i01*a12,
        i10, i11, -i10*a02 - i11*a12,
        0, 0, 1
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
            newpoint = new Point(nx, ny);
        }
        return newpoint;
    },
    getTranslation: function() {
        var self = this;
        return {
            x: self.$02,
            y: self.$12
        };
    },
    getRotationAngle: function() {
        var self = this;
        return stdMath.atan2(-self.$01, self.$00);
    },
    getScale: function() {
        var self = this,
            a = self.$00, b = self.$01,
            c = self.$10, d = self.$11;
        return {
            x: sign(a)*stdMath.sqrt(a*a + b*b),
            y: sign(d)*stdMath.sqrt(c*c + d*d)
        };
    },
    toArray: function() {
        var self = this;
        return [
        self.$00, self.$01, self.$02,
        self.$10, self.$11, self.$12,
        self.$20, self.$21, self.$22
        ];
    },
    toSVG: function() {
        var self = this;
        return 'matrix('+Str(self.$00)+' '+Str(self.$10)+' '+Str(self.$01)+' '+Str(self.$11)+' '+Str(self.$02)+' '+Str(self.$12)+')';
    },
    toCSS: function() {
        var self = this;
        return 'matrix('+Str(self.$00)+', '+Str(self.$10)+', '+Str(self.$01)+', '+Str(self.$11)+', '+Str(self.$02)+', '+Str(self.$12)+')';
    },
    toTex: function() {
        return Matrix.arrayTex(this.toArray(), 3, 3);
    },
    toString: function() {
        return Matrix.arrayString(this.toArray(), 3, 3);
    }
}, {
    eye: function() {
        return new Matrix(
        1,0,0,
        0,1,0,
        0,0,1
        );
    },
    scale: function(sx, sy) {
        return new Matrix(
        Num(sx),0,0,
        0,Num(sy),0,
        0,0,1
        );
    },
    reflectX: function() {
        return new Matrix(
        -1,0,0,
        0,1,0,
        0,0,1
        );
    },
    reflectY: function() {
        return new Matrix(
        1,0,0,
        0,-1,0,
        0,0,1
        );
    },
    shearX: function(s) {
        return new Matrix(
        1,Num(s),0,
        0,1,0,
        0,0,1
        );
    },
    shearY: function(s) {
        return new Matrix(
        1,0,0,
        Num(s),1,0,
        0,0,1
        );
    },
    translate: function(tx, ty) {
        return new Matrix(
        1,0,Num(tx),
        0,1,Num(ty),
        0,0,1
        );
    },
    rotate: function(theta) {
        theta = Num(theta);
        var cos = stdMath.cos(theta), sin = stdMath.sin(theta);
        return new Matrix(
        cos,-sin,0,
        sin,cos,0,
        0,0,1
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
var EYE = Matrix.eye();