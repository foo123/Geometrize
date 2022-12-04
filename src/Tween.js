// Tween between 2D shapes
var Easing = {
    // https://easings.net/
    // x is in [0, 1], 0 start, 1 end of animation
    // lin
    'linear': function(x) {
        return x;
    },
    // quad
    'ease-in': function(x) {
        return x*x;
    },
    'ease-out': function(x) {
        var xp = 1 - x;
        return 1 - xp*xp;
    },
    'ease-in-out': function(x) {
        return x < 0.5 ? 2*x*x : 1 - stdMath.pow(2 - 2*x, 2)/2;
    },
    // cubic bezier
    'cubic-bezier': function(c0, c1, c2, c3) {
        return bezier([c0, c1, c2, c3]);
    },
    //elastic
    'ease-in-elastic': function(x) {
        return 0 === x
            ? 0
            : (1 === x
            ? 1
            : -stdMath.pow(2, 10*x - 10)*stdMath.sin((x*10 - 10.75)*TWO_PI/3));
    },
    'ease-out-elastic': function(x) {
        return 0 === x
          ? 0
          : (1 === x
          ? 1
          : stdMath.pow(2, -10*x)*stdMath.sin((x*10 - 0.75)*TWO_PI/3) + 1);
    },
    'ease-in-out-elastic': function(x) {
        return 0 === x
          ? 0
          : (1 === x
          ? 1
          : (x < 0.5
          ? -(stdMath.pow(2, 20*x - 10)*stdMath.sin((20*x - 11.125)*TWO_PI/4.5))/2
          : (stdMath.pow(2, -20*x + 10)*stdMath.sin((20*x - 11.125)*TWO_PI/4.5))/2 + 1));
    },
    // bounce
    'ease-in-bounce': function(x) {
        return 1 - ease_out_bounce(1 - x);
    },
    'ease-out-bounce': function(x) {
        return ease_out_bounce(x);
    },
    'ease-in-out-bounce': function(x) {
        return x < 0.5
          ? (1 - ease_out_bounce(1 - 2*x))/2
          : (1 + ease_out_bounce(2*x - 1))/2;
    }
};
function ease_out_bounce(x)
{
    var n1 = 7.5625, d1 = 2.75, x1;

    if (x < 1/d1)
    {
        return n1*x*x;
    }
    else if (x < 2/d1)
    {
        x1 = x - 1.5;
        return n1*(x1/d1)*x1 + 0.75;
    }
    else if (x < 2.5/d1)
    {
        x1 = x - 2.25;
        return n1*(x1/d1)*x1 + 0.9375;
    }
    x1 = x - 2.625
    return n1*(x1/d1)*x1 + 0.984375;
}
function prepare_tween(tween, fps)
{
    tween = tween || EMPTY_OBJ;
    if (!tween.keyframes)
    {
        tween.keyframes = {
            "0%": tween.from,
            "100%": tween.to
        };
    }
    var t = {
        duration: null == tween.duration ? 1000 : (tween.duration || 0),
        fps: fps,
        nframes: 0,
        keyframes: null,
        kf: 0,
        current: null
        },
        maxCurves = -Infinity,
        easing = is_function(tween.easing) ? tween.easing : (is_string(tween.easing) && HAS.call(Tween.Easing, tween.easing) ? Tween.Easing[tween.easing] : Tween.Easing.linear)
    ;
    t.nframes = stdMath.ceil(t.duration/1000*t.fps);
    t.keyframes = Object.keys(tween.keyframes || EMPTY_OBJ).map(function(key) {
        var kf = tween.keyframes[key] || EMPTY_OBJ,
            stroke = is_string(kf.stroke) ? Color.parse(kf.stroke) : null,
            fill = is_string(kf.fill) ? Color.parse(kf.fill) : null,
            shape = kf.shape && is_function(kf.shape.toBezier3) ? kf.shape.toBezier3() : []
        ;
        maxCurves = stdMath.max(maxCurves, shape.length);
        return {
            frame: stdMath.round((parseFloat(key, 10) || 0)*t.nframes / 100),
            easing: is_function(kf.easing) ? kf.easing : (is_string(kf.easing) && HAS.call(Tween.Easing, kf.easing) ? Tween.Easing[kf.easing] : easing),
            shape: shape,
            'stroke': stroke ? stroke.slice(0, 3) : null,
            'stroke-opacity': stroke ? stroke[3] : 1,
            'fill': fill ? fill.slice(0, 3) : null,
            'fill-opacity': fill ? fill[3] : 1
        };
    }).sort(function(a, b) {return a.frame - b.frame});
    t.keyframes.forEach(function(kf) {
        add_curves(kf.shape, maxCurves);
    });
    return t;
}
function add_curves(curves, nCurves)
{
    if (curves.length < nCurves)
    {
        var i = curves.length ? 1 : 0,  p = [{x:0, y:0}, {x:0, y:0}];
        nCurves -= curves.length;
        while (0 < nCurves)
        {
            if (i >= 1) p = [curves[i-1][3], curves[i-1][3]];
            curves.splice(i, 0, [bezier1(0, p), bezier1(0.5, p), bezier1(0.5, p), bezier1(1, p)]);
            --nCurves;
            i += curves.length > i+1 ? 2 : 1;
        }
    }
}
function next_frame(tween)
{
    ++tween.current.frame;
    if (tween.current.frame > tween.nframes) return false;
    if (tween.current.frame === tween.nframes)
    {
        var lastkf = tween.keyframes[tween.keyframes.length-1];
        if (tween.current.shape !== lastkf.shape)
        {

            tween.current.shape = lastkf.shape;
            tween.current['stroke'] = lastkf['stroke'];
            tween.current['stroke-opacity'] = lastkf['stroke-opacity'];
            tween.current['fill'] = lastkf['fill'];
            tween.current['fill-opacity'] = lastkf['fill-opacity'];
        }
        return true;
    }
    if (tween.current.frame >= tween.keyframes[tween.kf+1].frame)
    {
        if (tween.kf+2 < tween.keyframes.length)
            ++tween.kf;

    }
    var a = tween.keyframes[tween.kf],
        b = tween.keyframes[tween.kf+1],
        t = (tween.current.frame - a.frame)/(b.frame - a.frame + 1),
        et = a.easing(t)
    ;
    tween.current.shape = a.shape.map(function(ai, i) {
        var bi = b.shape[i];
        return ai.map(function(aij, j) {
           var bij = bi[j];
           return {
               x: aij.x + et*(bij.x - aij.x),
               y: aij.y + et*(bij.y - aij.y)
           };
        });
    });
    tween.current['stroke'] = a['stroke'] && b['stroke'] ? Color.interpolateRGB(a['stroke'], b['stroke'], t) : (b['stroke'] ? b['stroke'] : (a['stroke'] || tween.current['stroke']));
    tween.current['stroke-opacity'] = Color.interpolate(a['stroke-opacity'], b['stroke-opacity'], t);
    tween.current['fill'] = a['fill'] && b['fill'] ? Color.interpolateRGB(a['fill'], b['fill'], t) : (b['fill'] ? b['fill'] : (a['fill'] || tween.current['fill']));
    tween.current['fill-opacity'] = Color.interpolate(a['fill-opacity'], b['fill-opacity'], t);
    return true;
}

var Tween = makeClass(Primitive, {
    constructor: function Tween(tween) {
        var self = this, run = false,
            fps = 60, dt = 0,
            onStart = null, onEnd = null, animate;

        if (tween instanceof Tween) return tween;
        if (!(self instanceof Tween)) return new Tween(tween);

        Primitive.call(self);
        self.start = function() {
            run = true;
            if ((0 === tween.current.frame) && onStart) onStart(self);
            setTimeout(animate, dt);
            return self;
        };
        self.stop = function() {
            run = false;
            return self;
        };
        self.rewind = function() {
            tween.kf = 0;
            tween.current = {
                frame: 0,
                shape: tween.keyframes[0].shape,
                'stroke': tween.keyframes[0]['stroke'],
                'fill': tween.keyframes[0]['fill'],
                'stroke': tween.keyframes[0]['stroke'],
                'fill': tween.keyframes[0]['fill']
            };
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
            var path = tween.current.shape.map(function(cb) {
                return 'M '+cb[0].x+' '+cb[0].y+' C '+cb[1].x+' '+cb[1].y+','+cb[2].x+' '+cb[2].y+','+cb[3].x+' '+cb[3].y;
            }).join(' ');
            if (tween.current['stroke'])
            {
                self.style['stroke'] = Color.toCSS(tween.current['stroke']);
                self.style['stroke-opacity'] = tween.current['stroke-opacity'];
            }
            if (tween.current['fill'])
            {
                self.style['fill'] = Color.toCSS(tween.current['fill']);
                self.style['fill-opacity'] = tween.current['fill-opacity'];
            }
            return SVG('path', {
                'id': [self.id, false],
                'd': [path, self.isChanged()],
                'style': [self.style.toSVG(), self.style.isChanged()]
            }, arguments.length ? svg : false);
        };
        self.toSVGPath = function(svg) {
            var path = tween.current.shape.map(function(cb) {
                return 'M '+cb[0].x+' '+cb[0].y+' C '+cb[1].x+' '+cb[1].y+','+cb[2].x+' '+cb[2].y+','+cb[3].x+' '+cb[3].y;
            }).join(' ');
            if (tween.current['stroke'])
            {
                self.style['stroke'] = Color.toCSS(tween.current['stroke']);
                self.style['stroke-opacity'] = tween.current['stroke-opacity'];
            }
            if (tween.current['fill'])
            {
                self.style['fill'] = Color.toCSS(tween.current['fill']);
                self.style['fill-opacity'] = tween.current['fill-opacity'];
            }
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
            tween = null;
            self.$super('dispose');
        };

        fps = 60;
        dt = stdMath.floor(1000/fps);
        tween = prepare_tween(tween, fps);
        animate = function animate() {
            if (!run) return;
            var has_next = next_frame(tween);
            if (has_next)
            {
                self.isChanged(true);
                setTimeout(animate, dt);
                if ((tween.current.frame === tween.nframes) && onEnd) onEnd(self);
            }
        };
        self.rewind();
    },
    name: 'Tween',
    rewind: null,
    start: null,
    stop: null,
    onStart: null,
    onEnd: null
}, {Easing: Easing});
Geometrize.Tween = Tween;
