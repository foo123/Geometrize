// Tween between 2D shapes
// TODO: support keyframes
var Tween = makeClass(Primitive, {
    constructor: function Tween(tween) {
        var self = this, a = null, b = null, p = null, v = null, step = 0, steps = 0,
            fa = null, fb = null, sa = null, sb = null, sp = null, fp = null,
            prepare, animate, run = false, onStart = null, onEnd = null, dt = 16/*1000/60*/;

        if (tween instanceof Tween) return tween;
        if (!(self instanceof Tween)) return new Tween(tween);

        prepare = function prepare() {
            if (null != a && null != b) return;
            tween = tween || EMPTY_OBJ;
            var from = tween.from || EMPTY_OBJ, to = tween.to || EMPTY_OBJ;
            a = from.shape && is_function(from.shape.toBezier3) ? from.shape.toBezier3() : [];
            b = to.shape && is_function(to.shape.toBezier3) ? to.shape.toBezier3() : [];
            sa = is_string(from.stroke) ? Color.parse(from.stroke) : null;
            sb = is_string(to.stroke) ? Color.parse(to.stroke) : null;
            fa = is_string(from.fill) ? Color.parse(from.fill) : null;
            fb = is_string(to.fill) ? Color.parse(to.fill) : null;

            var d = abs(a.length - b.length), t, i, p;
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

            steps = stdMath.ceil((tween.duration || 1000)/dt);
            v = a.map(function(ai, i) {
                var bi = b[i];
                return ai.map(function(aij, j) {
                    var bij = bi[j];
                    return {
                        x: (bij.x - aij.x)/steps,
                        y: (bij.y - aij.y)/steps
                    };
                });
            });
        };
        animate = function animate() {
            if (!run || (step > steps))
            {
                return;
            }
            if (step === steps)
            {
                if (p !== b)
                {
                    p = b;
                    sp = sb;
                    fp = fb;
                    if (null != sa && null != sb)
                        self.style['stroke'] = Color.toCSS(sp[0], sp[1], sp[2], sp[3]);
                    if (null != fa && null != fb)
                        self.style['fill'] = Color.toCSS(fp[0], fp[1], fp[2], fp[3]);
                    self.isChanged(true);
                    if (onEnd) onEnd(self);
                }
                return;
            }
            ++step;
            p = a.map(function(ai, i) {
                var vi = v[i];
                return ai.map(function(aij, j) {
                   var vij = vi[j];
                   return {
                       x: aij.x + step*vij.x,
                       y: aij.y + step*vij.y,
                       step: step, steps: steps
                   };
                });
            });
            if (null != sa && null != sb)
            {
                sp = Color.interpolate(sa[0], sa[1], sa[2], sa[3], sb[0], sb[1], sb[2], sb[3], step/steps);
                self.style['stroke'] = Color.toCSS(sp[0], sp[1], sp[2], sp[3]);
            }
            if (null != fa && null != fb)
            {
                fp = Color.interpolate(fa[0], fa[1], fa[2], fa[3], fb[0], fb[1], fb[2], fb[3], step/steps);
                self.style['fill'] = Color.toCSS(fp[0], fp[1], fp[2], fp[3]);
            }
            self.isChanged(true);
            setTimeout(animate, dt);
        };

        Primitive.call(self);
        self.start = function() {
            run = true;
            if ((0 === step) && onStart) onStart(self);
            setTimeout(animate, dt);
            return self;
        };
        self.stop = function() {
            run = false;
            return self;
        };
        self.rewind = function() {
            step = 0;
            p = a;
            sp = sa;
            fp = fa;
            if (null != sa && null != sb)
                self.style['stroke'] = Color.toCSS(sp[0], sp[1], sp[2], sp[3]);
            if (null != fa && null != fb)
                self.style['fill'] = Color.toCSS(fp[0], fp[1], fp[2], fp[3]);
            self.isChanged(true);
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
            if ('none' !== this.style['fill']) ctx.fillStyle = this.style['fill'];
            p.forEach(function(cb) {
                ctx.moveTo(cb[0].x, cb[0].y);
                ctx.bezierCurveTo(cb[1].x, cb[1].y, cb[2].x, cb[2].y, cb[3].x, cb[3].y);
            })
            if ('none' !== this.style['fill']) ctx.fill();
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

        prepare();
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
