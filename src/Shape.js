// 2D generic Shape class
// container for primitives shapes
var Shape = makeClass(Primitive, {});

var Tween = makeClass(Primitive, {
    constructor: function Tween(from, to, dur) {
        var self = this, t = null, i = 0, k = 0, animate, run = false;

        if (from instanceof Tween) return from;
        if (!(self instanceof Tween)) return new Tween(from, to, dur);

        Primitive.call(self);

        t = {
            a: from.toBezier3(),
            b: to.toBezier3(),
            p: null,
            v: null
        };
        k = stdMath.ceil(dur/(1000/60));
        var a = t.a.length < t.b.length ? t.a : t.b,
            d = abs(t.a.length - t.b.length);
        if (d)
        {
            i = 0;
            while (0 < d)
            {
                a.splice(i, 0, a[i].map(function(xy) {
                    return {x:xy.x, y:xy.y};
                }));
                --d;
                i += 2;
            }
        }
        t.v = t.a.map(function(_, i) {
            return t.a[i].map(function(_, j) {
                return {
                    x: (t.b[i][j].x - t.a[i][j].x)/k,
                    y: (t.b[i][j].y - t.a[i][j].y)/k
                };
            });
        });

        animate = function animate() {
            if (!run) return;
            if (i >= k)
            {
                t.p = t.b;
                return;
            }
            ++i;
            t.p = t.a.map(function(a, n) {
                return a.map(function(xy, m) {
                   return {
                       x: xy.x + i*t.v[n][m].x,
                       y: xy.y + i*t.v[n][m].y
                   };
                });
            });
            self.isChanged(true);
            setTimeout(animate, 1000/60);
        };

        self.start = function() {
            run = true;
            animate();
            return self;
        };
        self.stop = function() {
            run = false;
            return self;
        };
        self.rewind = function() {
            i = 0;
            t.p = t.a;
            return self;
        };
        self.toSVG = function(svg) {
            var path = t.p.map(function(cb) {
                return 'M '+cb[0].x+' '+cb[0].y+' C '+cb[1].x+' '+cb[1].y+','+cb[2].x+' '+cb[2].y+','+cb[3].x+' '+cb[3].y;
            }).join(' ');
            return SVG('path', {
                'id': [self.id, false],
                'd': [path, self.isChanged()],
                'style': [self.style.toSVG(), self.style.isChanged()]
            }, arguments.length ? svg : false);
        };
        self.dispose = function() {
            run = false;
            t = null;
            self.$super('dispose');
        };
        self.rewind();
    },
    name: 'Tween',
    rewind: null,
    start: null,
    stop: null
});