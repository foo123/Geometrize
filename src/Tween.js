// Tween between 2D shapes
var Tween = makeClass(Primitive, {
    constructor: function Tween(fromShape, toShape, dur) {
        var self = this, a, b, p, v, i = 0, k = 0,
            animate, run = false, onStart = null, onEnd = null;

        if (fromShape instanceof Tween) return fromShape;
        if (!(self instanceof Tween)) return new Tween(fromShape, toShape, dur);

        Primitive.call(self);

        a = fromShape.toBezier3 ? fromShape.toBezier3() : [];
        b = toShape.toBezier3 ? toShape.toBezier3() : [];
        p = null;
        v = null;
        k = stdMath.ceil(dur/(16/*1000/60*/));
        var d = abs(a.length - b.length), t;
        if (0 < d)
        {
            t = a.length < b.length ? a : b;
            i = t.length ? 1 : 0;
            p = [{x:0, y:0}, {x:0, y:0}];
            while (0 < d)
            {
                if (i >= 1) p = [t[i-1][3], t[i-1][3]];
                t.splice(i, 0, [bezier1(0, p), bezier1(0.5, p), bezier1(0.5, p), bezier1(1, p)]);
                --d;
                i += t.length > i+1 ? 2 : 1;
            }
        }
        v = a.map(function(ai, i) {
            var bi = b[i];
            return ai.map(function(aij, j) {
                var bij = bi[j];
                return {
                    x: (bij.x - aij.x)/k,
                    y: (bij.y - aij.y)/k
                };
            });
        });

        animate = function animate() {
            if (!run) return;
            if (i >= k)
            {
                if (p !== b)
                {
                    p = b;
                    if (onEnd) onEnd(self);
                }
                return;
            }
            ++i;
            p = a.map(function(an, n) {
                var vn = v[n];
                return an.map(function(anm, m) {
                   var vnm = vn[m];
                   return {
                       x: anm.x + i*vnm.x,
                       y: anm.y + i*vnm.y,
                       i: i
                   };
                });
            });
            self.isChanged(true);
            setTimeout(animate, 16/*1000/60*/);
        };

        self.start = function() {
            run = true;
            if (onStart) onStart(self);
            animate();
            return self;
        };
        self.stop = function() {
            run = false;
            return self;
        };
        self.rewind = function() {
            i = 0;
            p = a;
            return self;
        };
        self.onStart = function(cb) {
            onStart = is_function(cb) ? cb : null;
            return self;
        };
        self.onEnd = function(cb) {
            onEnd = is_function(cb) ? cb : null;
            return self;
        };
        self.toSVG = function(svg) {
            var path = p.map(function(cb) {
                return 'M '+cb[0].x+' '+cb[0].y+' C '+cb[1].x+' '+cb[1].y+','+cb[2].x+' '+cb[2].y+','+cb[3].x+' '+cb[3].y;
            }).join(' ');
            return SVG('path', {
                'id': [self.id, false],
                'd': [path, self.isChanged()],
                'style': [self.style.toSVG(), self.style.isChanged()]
            }, arguments.length ? svg : false);
        };
        self.toSVGPath = function(svg) {
            var path = p.map(function(cb) {
                return 'M '+cb[0].x+' '+cb[0].y+' C '+cb[1].x+' '+cb[1].y+','+cb[2].x+' '+cb[2].y+','+cb[3].x+' '+cb[3].y;
            }).join(' ');
            return arguments.length ? SVG('path', {
                'id': [self.id, false],
                'd': [path, self.isChanged()],
                'style': [self.style.toSVG(), self.style.isChanged()]
            }, svg) : path;
        };
        self.toCanvas = function(ctx) {
            ctx.beginPath();
            ctx.lineWidth = this.style['stroke-width'];
            ctx.strokeStyle = this.style['stroke'];
            p.forEach(function(cb) {
                ctx.moveTo(cb[0].x, cb[0].y);
                ctx.bezierCurveTo(cb[1].x, cb[1].y, cb[2].x, cb[2].y, cb[3].x, cb[3].y);
            })
            ctx.stroke();
        };
        self.dispose = function() {
            run = false;
            onStart = null;
            onEnd = null;
            a = null;
            b = null;
            p = null;
            v = null;
            self.$super('dispose');
        };
        self.rewind();
    },
    name: 'Tween',
    rewind: null,
    start: null,
    stop: null,
    onStart: null,
    onEnd: null
});
Geometrize.Tween = Tween;
