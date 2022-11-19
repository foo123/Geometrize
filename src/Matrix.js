// 2D Transformation Matrix class
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
            self.$00 = Num(m00);
            self.$01 = Num(m01);
            self.$02 = Num(m02);
            self.$10 = Num(m10);
            self.$11 = Num(m11);
            self.$12 = Num(m12);
            self.$20 = 0;
            self.$21 = 0;
            self.$22 = 1;
        }
    },
    $00: 1
    $01: 0,
    $02: 0,
    $10: 0,
    $11: 1,
    $12: 0,
    $20: 0,
    $21: 0,
    $22: 1,
    clone: function() {
        return new Matrix(
        this.$00, this.$01, this.$02,
        this.$10, this.$11, this.$12,
        this.$20, this.$21, this.$22
        );
    },
    add: function (other) {
        var self = this;
        if (other instanceof Matrix)
        {
            return new Matrix(
                self.$00 + other.$00,
                self.$01 + other.$01,
                self.$02 + other.$02,
                self.$10 + other.$10,
                self.$11 + other.$11,
                self.$12 + other.$12,
                0,
                0,
                1
            );
        }
        else
        {
            other = Num(other);
            return new Matrix(
                self.$00 + other,
                self.$01 + other,
                self.$02 + other,
                self.$10 + other,
                self.$11 + other,
                self.$12 + other,
                0,
                0,
                1
            );
        }
    },
    mul: function (other) {
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
                0,
                0,
                1
            );
        }
        else
        {
            other = Num(other);
            return new Matrix(
                self.$00*other,
                self.$01*other,
                self.$02*other,
                self.$10*other,
                self.$11*other,
                self.$12*other,
                0,
                0,
                1
            );
        }
    },
    transform: function(point, newpoint) {
        var x = point.x, y = point.y;
        if (newpoint instanceof Point)
        {
            newpoint.x = this.$00*x + this.$01*y + this.$02;
            newpoint.y = this.$10*x + this.$11*y + this.$12;
        }
        else
        {
            newpoint = new Point(
                this.$00*x + this.$01*y + this.$02,
                this.$10*x + this.$11*y + this.$12
            );
        }
        return newpoint;
    },
    toArray: function() {
        return [
        this.$00, this.$01, this.$02,
        this.$10, this.$11, this.$12,
        this.$20, this.$21, this.$22
        ];
    },
    toSVG: function() {
        return 'matrix('+Str(this.$00)+' '+Str(this.$10)+' '+Str(this.$01)+' '+Str(this.$11)+' '+Str(this.$02)+' '+Str(this.$12)+')';
    },
    toCSS: function() {
        return 'matrix('+Str(this.$00)+', '+Str(this.$10)+', '+Str(this.$01)+', '+Str(this.$11)+', '+Str(this.$02)+', '+Str(this.$12)+')';
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
        return new Matrix(
        stdMath.cos(theta),-stdMath.sin(theta),0,
        stdMath.sin(theta),stdMath.cos(theta),0,
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
    }
    pointTex: function(point) {
        return '\\begin{pmatrix}'+Str(point.x)+'\\\\'+Str(point.y)+'\\\\1\\end{pmatrix}';
    },
    pointString: function(point) {
        var maxlen = [point.x, point.y].reduce(function(maxlen, s) {
            return stdMath.max(maxlen, Str(s).length);
        }, 0);
        return '['+pad(point.x, maxlen)+"]\n["+pad(point.y, maxlen)+"]\n["+pad(1, maxlen)+']';
    }
});
