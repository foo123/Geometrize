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
            transform = kf.transform || EMPTY_OBJ,
            style = kf.style || EMPTY_OBJ,
            stroke = is_string(style.stroke) ? Color.parse(style.stroke) : null,
            fill = is_string(style.fill) ? Color.parse(style.fill) : null,
            rotate = transform.rotate || [0, 0, 0],
            shape = kf.shape && is_function(kf.shape.toBezier3) ? kf.shape.toBezier3() : []
        ;
        maxCurves = stdMath.max(maxCurves, shape.length);
        return {
            frame: stdMath.round((parseFloat(key, 10) || 0)/100*(t.nframes - 1)),
            easing: is_function(kf.easing) ? kf.easing : (is_string(kf.easing) && HAS.call(Tween.Easing, kf.easing) ? Tween.Easing[kf.easing] : easing),
            shape: shape,
            transform: {
                scale: (transform.scale || [1, 1]).slice(0, 2),
                rotate: !is_array(rotate) ? [(+rotate)||0, 0, 0] : (rotate.length < 3 ? [rotate[0]||0, rotate[1]||0, rotate[2]||0] : rotate.slice(0, 3)),
                translate: (transform.translate || [0, 0]).slice(0, 2)
            },
            style: {
                'stroke': stroke ? stroke.slice(0, 3) : null,
                'stroke-opacity': stroke ? stroke[3] : 1,
                'fill': fill ? fill.slice(0, 3) : null,
                'fill-opacity': fill ? fill[3] : 1
            }
        };
    }).sort(function(a, b) {return a.frame - b.frame});
    var add_curves = function(curves, nCurves) {
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
    };
    t.keyframes.forEach(function(kf) {
        add_curves(kf.shape, maxCurves);
    });
    return t;
}
function first_frame(tween)
{
    tween.kf = 0;
    var frame = tween.keyframes[tween.kf];
    tween.current = {
        frame: 0,
        shape: frame.shape,
        transform: frame.transform,
        style: frame.style
    };
}
function next_frame(tween)
{
    ++tween.current.frame;
    if (tween.current.frame >= tween.nframes) return false;
    if (tween.current.frame >= tween.keyframes[tween.kf+1].frame)
    {
        if (tween.kf+2 < tween.keyframes.length)
            ++tween.kf;

    }
    var a = tween.keyframes[tween.kf],
        b = tween.keyframes[tween.kf+1],
        _t = (tween.current.frame - a.frame)/(b.frame - a.frame + 1),
        t = a.easing(_t),
        // translation
        tx = interpolate(a.transform.translate[0]||0, b.transform.translate[0]||0, t),
        ty = interpolate(a.transform.translate[1]||0, b.transform.translate[1]||0, t),
        // scale
        sx = interpolate(a.transform.scale[0], b.transform.scale[0], t),
        sy = interpolate(a.transform.scale[1], b.transform.scale[1], t),
        // rotation of theta around (rx, ry)
        theta = rad(interpolate(a.transform.rotate[0]||0, b.transform.rotate[0]||0, t)),
        rx = sx*interpolate(a.transform.rotate[1]||0, b.transform.rotate[1]||0, t),
        ry = sy*interpolate(a.transform.rotate[2]||0, b.transform.rotate[2]||0, t),
        cos = 1, sin = 0
    ;
    if (!is_almost_equal(theta, 0))
    {
        cos = stdMath.cos(theta);
        sin = stdMath.sin(theta);
    }
    tween.current.shape = a.shape.map(function(ai, i) {
        var bi = b.shape[i];
        return ai.map(function(aij, j) {
           var bij = bi[j],
               x = sx*(aij.x + t*(bij.x - aij.x)),
               y = sy*(aij.y + t*(bij.y - aij.y));
           return {
               x: cos*x - sin*y + rx - cos*rx + sin*ry + tx,
               y: sin*x + cos*y + ry - cos*ry - sin*rx + ty
           }
        });
    });
    tween.current.style = {
        'stroke': a.style['stroke'] && b.style['stroke'] ? Color.interpolateRGB(a.style['stroke'], b.style['stroke'], t) : (b.style['stroke'] ? b.style['stroke'] : (a.styke['stroke'] || tween.current.style['stroke'])),
        'stroke-opacity': interpolate(a.style['stroke-opacity'], b.style['stroke-opacity'], t),
        'fill': a.style['fill'] && b.style['fill'] ? Color.interpolateRGB(a.style['fill'], b.style['fill'], t) : (b.style['fill'] ? b.style['fill'] : (a.style['fill'] || tween.current.style['fill'])),
        'fill-opacity': interpolate(a.style['fill-opacity'], b.style['fill-opacity'], t)
    };
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
            first_frame(tween);
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
        self.toSVGPath = function(svg) {
            var path = tween.current.shape.map(function(cb) {
                return 'M '+cb[0].x+' '+cb[0].y+' C '+cb[1].x+' '+cb[1].y+','+cb[2].x+' '+cb[2].y+','+cb[3].x+' '+cb[3].y;
            }).join(' ');
            if (arguments.length)
            {
                if (tween.current.style['stroke'])
                {
                    self.style['stroke'] = Color.toCSS(tween.current.style['stroke']);
                    self.style['stroke-opacity'] = tween.current.style['stroke-opacity'];
                }
                if (tween.current.style['fill'])
                {
                    self.style['fill'] = Color.toCSS(tween.current.style['fill']);
                    self.style['fill-opacity'] = tween.current.style['fill-opacity'];
                }
            }
            return arguments.length ? SVG('path', {
                'id': [self.id, false],
                'd': [path, self.isChanged()],
                'style': [self.style.toSVG(), self.style.isChanged()]
            }, svg) : path;
        };
        self.toSVG = function(svg) {
            return self.toSVGPath(arguments.length ? svg : false);
        };
        self.toCanvas = function(ctx) {
            ctx.beginPath();
            ctx.lineWidth = this.style['stroke-width'];
            ctx.strokeStyle = Color.toCSS(tween.current.style['stroke'].concat([tween.current.style['stroke-opacity']]));
            if (tween.current.style['fill']) ctx.fillStyle = Color.toCSS(tween.current.style['fill'].concat([tween.current.style['fill-opacity']]));
            tween.current.shape.forEach(function(cb) {
                ctx.moveTo(cb[0].x, cb[0].y);
                ctx.bezierCurveTo(cb[1].x, cb[1].y, cb[2].x, cb[2].y, cb[3].x, cb[3].y);
            })
            if (tween.current.style['fill']) ctx.fill();
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
            if (!run || !tween) return;
            if (next_frame(tween))
            {
                self.isChanged(true);
                if (tween.current.frame+1 === tween.nframes)
                {
                    if (onEnd) onEnd(self);
                }
                else
                {
                    setTimeout(animate, dt);
                }
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
