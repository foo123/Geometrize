// https://easings.net/
var Easing = {
    // x is in [0, 1], 0=start, 1=end of animation
    // linear
    'linear': function(x) {
        return x;
    },
    // quadratic
    'ease-in-quad': function(x) {
        return x*x;
    },
    'ease-out-quad': function(x) {
        var xp = 1 - x;
        return 1 - xp*xp;
    },
    'ease-in-out-quad': function(x) {
        return x < 0.5 ? 2*x*x : 1 - stdMath.pow(2 - 2*x, 2)/2;
    },
    // cubic
    'ease-in-cubic': function(x) {
        return x*x*x;
    },
    'ease-out-cubic': function(x) {
        return 1 - stdMath.pow(1 - x, 3);
    },
    'ease-in-out-cubic': function(x) {
        return x < 0.5 ? 4*x*x*x : 1 - stdMath.pow(2 - 2*x, 3)/2;
    },
    // cubic bezier
    'cubic-bezier': function(c0, c1, c2, c3) {
        return bezier([c0, c1, c2, c3]);
    },
    // exponential
    'ease-in-expo': function(x) {
        return 0 === x ? 0 : stdMath.pow(2, 10*x - 10);
    },
    'ease-out-expo': function(x) {
        return 1 === x ? 1 : 1 - stdMath.pow(2, -10*x);
    },
    'ease-in-out-expo': function(x) {
        return 0 === x
              ? 0
              : (1 === x
              ? 1
              : (x < 0.5
              ? stdMath.pow(2, 20*x - 10)/2
              : (2 - stdMath.pow(2, 10 - 20*x))/2));
    },
    // back
    'ease-in-back': function(x) {
        var c1 = 1.70158, c3 = c1 + 1;
        return c3*x*x*x - c1*x*x;
    },
    'ease-out-back': function(x) {
        var c1 = 1.70158, c3 = c1 + 1, xp = x - 1;
        return 1 + c3*stdMath.pow(xp, 3) + c1*stdMath.pow(xp, 2);
    },
    'ease-in-out-back': function(x) {
        var c1 = 1.70158, c2 = c1*1.525;
        return x < 0.5
            ? (stdMath.pow(2*x, 2)*((c2 + 1)*2*x - c2))/2
            : (stdMath.pow(2*x - 2, 2)*((c2 + 1)*(x*2 - 2) + c2) + 2)/2;
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
Easing['ease-in'] = Easing['ease-in-quad'];
Easing['ease-out'] = Easing['ease-out-quad'];
Easing['ease-in-out'] = Easing['ease-in-out-quad'];

function prepare_tween(tween, fps)
{
    tween = tween || {};
    if (!tween.keyframes)
    {
        tween.keyframes = {
            "0%": tween.from,
            "100%": tween.to
        };
    }
    var t = {
            duration: null == tween.duration ? 1000 : (tween.duration || 0),
            delay: tween.delay || 0,
            fps: clamp(null != tween.fps ? Num(tween.fps) : fps, 1, fps),
            nframes: 0,
            keyframes: null,
            kf: 0,
            current: null,
            reverse: false,
            bb: {
                ymin: Infinity,
                xmin: Infinity,
                ymax: -Infinity,
                xmax: -Infinity
            }
        },
        easing = is_function(tween.easing) ? tween.easing : (is_string(tween.easing) && HAS.call(Tween.Easing, tween.easing) ? Tween.Easing[tween.easing] : Tween.Easing.linear)
    ;
    t.nframes = stdMath.ceil(t.duration/1000*t.fps);
    t.keyframes = Object.keys(tween.keyframes || EMPTY_OBJ).map(function(key) {
        var kf = tween.keyframes[key] || EMPTY_OBJ,
            length = HAS.call(kf, 'length') ? clamp(Num(kf.length), 0, 1) : 1,
            obj = kf.shape && is_function(kf.shape.bezierPoints) ? kf.shape : null,
            shape = obj ? obj.bezierPoints(length) : [],
            transform = kf.transform || EMPTY_OBJ,
            sc = transform.scale || EMPTY_OBJ,
            scOrig = sc.origin || {x:0, y:0},
            rot = transform.rotate || EMPTY_OBJ,
            rotOrig = rot.origin || {x:0, y:0},
            tr = transform.translate || EMPTY_OBJ,
            style = kf.style || EMPTY_OBJ,
            stroke = is_string(style.stroke) ? (Color.parse(style.stroke) || style.stroke) : null,
            fill = is_string(style.fill) ? (Color.parse(style.fill) || style.fill) : null,
            hasStroke = is_array(stroke),
            hasFill = is_array(fill),
            hasStrokeOpacity = HAS.call(style, 'stroke-opacity'),
            hasFillOpacity = HAS.call(style, 'fill-opacity'),
            bb
        ;
        if (obj && is_function(obj.getBoundingBox))
        {
            bb = obj.getBoundingBox();
        }
        else
        {
            bb = {ymin:0, ymax:0, xmin:0, xmax:0};
        }
        t.bb.ymin = stdMath.min(t.bb.ymin, bb.ymin||0);
        t.bb.xmin = stdMath.min(t.bb.xmin, bb.xmin||0);
        t.bb.ymax = stdMath.max(t.bb.ymax, bb.ymax||0);
        t.bb.xmax = stdMath.max(t.bb.xmax, bb.xmax||0);
        return {
            frame: stdMath.round(Num(key)/100*(t.nframes - 1)),
            obj: obj,
            shape: [
                shape,
                shape.slice()
            ],
            box: bb,
            length: length,
            transform: {
                scale: {
                    origin: {
                        x: scOrig.x || 0,
                        y: scOrig.y || 0
                    },
                    x: (null == sc.x ? 1 : sc.x) || 0,
                    y: (null == sc.y ? 1 : sc.y) || 0
                },
                rotate: {
                    origin: {
                        x: rotOrig.x || 0,
                        y: rotOrig.y || 0
                    },
                    angle: rad(rot.angle || 0)
                },
                translate: {
                    x: tr.x || 0,
                    y: tr.y || 0
                }
            },
            style: {
                'stroke': hasStroke ? stroke.slice(0, 3) : stroke,
                'stroke-opacity': hasStrokeOpacity ? Num(style['stroke-opacity']) : (hasStroke ? stroke[3] : 1),
                'fill': hasFill ? fill.slice(0, 3) : fill,
                'fill-opacity': hasFillOpacity ? Num(style['fill-opacity']) : (hasFill ? fill[3] : 1),
                hasStroke: hasStroke,
                hasFill: hasFill
            },
            easing: is_function(kf.easing) ? kf.easing : (is_string(kf.easing) && HAS.call(Tween.Easing, kf.easing) ? Tween.Easing[kf.easing] : easing)
        };
    }).sort(function(a, b) {
        return a.frame - b.frame
    });
    var match_shapes = function match_shapes(kf1, kf2, index1, index2) {
        var s1 = kf1.shape[index1], s2 = kf2.shape[index2],
            l1 = s1.length, l2 = s2.length,
            m = stdMath.max(1, l1, l2),
            d00, d11, d01, d10, md,
            i, i1, i2, p, b1, b2;
        /*if (l1 && l2)
        {
            b1 = s1[0];
            b2 = s2[0];
            md = stdMath.max(dist(b1[0], b2[0]), dist(b1[3], b2[3]));
            i = 0;
            for (i2=1; i2<l2; ++i2)
            {
                b2 = s2[i2];
                d00 = stdMath.max(dist(b1[0], b2[0]), dist(b1[3], b2[3]));
                if (d00 < md)
                {
                    md = d00;
                    i = i2;
                }
            }
            if (0 < i)
            {
                // rotate shape to match better with other shape
                b2 = s2;
                for (i2=0; i2<l2; ++i2)
                {
                    s2[i2] = b2[(i2+i) % l2];
                }
            }
        }*/
        for (i1=0,i2=0,i=0; i<m; ++i)
        {
            if ((i1 >= l1) || (i2 >= l2))
            {
                if (i1 >= l1)
                {
                    s1.push(bezierfrom(0 < l1 ? s1[l1-1][3] : {x:0, y:0}));
                    ++l1;
                }
                if (i2 >= l2)
                {
                    s2.push(bezierfrom(0 < l2 ? s2[l2-1][3] : {x:0, y:0}));
                    ++l2;
                }
                ++i1; ++i2;
                continue;
            }
            b1 = s1[i1];
            b2 = s2[i2];
            d00 = dist(b1[0], b2[0]);
            d11 = dist(b1[3], b2[3]);
            d01 = dist(b1[0], b2[3]);
            d10 = dist(b1[3], b2[0]);
            // adjust shapes to avoid curves splitting or crossing over
            if (d00 > d01 || d11 > d10)
            {
                p = b1[0];
                s1.splice(i1, 0, bezierfrom(p));
                p = b2[3];
                s2.splice(i2+1, 0, bezierfrom(p));
                l1 += 1;
                l2 += 1;
                m += 1;
                i1 += 2;
                i2 += 2;
            }
            else
            {
                ++i1;
                ++i2;
            }
        }
        //s1.length must equal s2.length after matching
    };
    t.keyframes.forEach(function(kf, i) {
        if (i+1 < t.keyframes.length)
        {
            match_shapes(kf, t.keyframes[i+1], 0, 1);
        }
        if (0 === i)
        {
            kf.shape[1] = kf.shape[0];
        }
        if (i+1 === t.keyframes.length)
        {
            kf.shape[0] = kf.shape[1];
        }
    });
    return t;
}
function render_shape(t, as, bs, sx, sy, osx, osy, angle, orx, ory, tx, ty)
{
    var cos = 1, sin = 0,
        ai, aij, bi, bij,
        i, j, n, x, y, s, cs
    ;
    if (!is_almost_equal(angle, 0))
    {
        cos = stdMath.cos(angle);
        sin = stdMath.sin(angle);
    }
    tx += orx - cos*orx + sin*ory;
    ty += ory - cos*ory - sin*orx;
    if (bs)
    {
        n = stdMath.min(as.length, bs.length);
        cs = new Array(n);
        for (i=0; i<n; ++i)
        {
            ai = as[i];
            bi = bs[i];
            s = new Array(4);
            for (j=0; j<4; ++j)
            {
                aij = ai[j];
                bij = bi[j];
                x = sx*(aij.x + t*(bij.x - aij.x) - osx) + osx;
                y = sy*(aij.y + t*(bij.y - aij.y) - osy) + osy;
                s[j] = {
                x: cos*x - sin*y + tx,
                y: sin*x + cos*y + ty
               };
            }
            cs[i] = s;
        }
    }
    else
    {
        n = as.length;
        cs = new Array(n);
        for (i=0; i<n; ++i)
        {
            ai = as[i];
            s = new Array(4);
            for (j=0; j<4; ++j)
            {
                aij = ai[j];
                x = sx*(aij.x - osx) + osx;
                y = sy*(aij.y - osy) + osy;
                s[j] = {
                x: cos*x - sin*y + tx,
                y: sin*x + cos*y + ty
               };
            }
            cs[i] = s;
        }
    }
    return cs;
}
function first_frame(tween)
{
    if (tween.reverse)
    {
        tween.kf = tween.keyframes.length - 1;
    }
    else
    {
        tween.kf = 0;
    }
    var frame = tween.keyframes[tween.kf],
        a = frame,
        // translate
        tx = a.transform.translate.x,
        ty = a.transform.translate.y,
        // scale
        osx = a.transform.scale.origin.x,
        osy = a.transform.scale.origin.y,
        sx = a.transform.scale.x,
        sy = a.transform.scale.y,
        // rotate
        orx = a.transform.rotate.origin.x,
        ory = a.transform.rotate.origin.y,
        angle = a.transform.rotate.angle
    ;
    tween.current = {
        frame: tween.reverse ? tween.nframes - 1 : 0,
        shape: render_shape(1, a.shape[tween.reverse ? 1 : 0], null, sx, sy, osx, osy, angle, orx, ory, tx, ty),
        transform: frame.transform,
        style: frame.style
    };
}
function is_first_frame(tween)
{
    return tween.reverse ? (tween.nframes - 1 === tween.current.frame) : (0 === tween.current.frame);
}
function is_tween_finished(tween)
{
    return tween.reverse ? (0 > tween.current.frame) : (tween.current.frame >= tween.nframes);
}
function next_frame(tween)
{
    tween.current.frame = clamp(tween.current.frame + (tween.reverse ? -1 : 1), -1, tween.nframes);
    if (is_tween_finished(tween)) return false;
    if (tween.reverse)
    {
        if (tween.kf >= 1 && tween.current.frame <= tween.keyframes[tween.kf-1].frame)
        {
            if (tween.kf-2 >= 0)
                --tween.kf;
        }
        var a = tween.keyframes[tween.kf],
            b = tween.keyframes[tween.kf >= 1 ? tween.kf-1 : 0],
            _t = abs(tween.current.frame - a.frame)/stdMath.max(EPS, a.frame - b.frame);
    }
    else
    {
        if (tween.kf+1 < tween.keyframes.length && tween.current.frame >= tween.keyframes[tween.kf+1].frame)
        {
            if (tween.kf+2 < tween.keyframes.length)
                ++tween.kf;
        }
        var a = tween.keyframes[tween.kf],
            b = tween.keyframes[tween.kf+1 < tween.keyframes.length ? tween.kf+1 : tween.keyframes.length-1],
            _t = (tween.current.frame - a.frame)/stdMath.max(EPS, b.frame - a.frame);
    }
    var t = a.easing(_t),
        // translate
        tx = interpolate(a.transform.translate.x, b.transform.translate.x, t),
        ty = interpolate(a.transform.translate.y, b.transform.translate.y, t),
        // scale
        osx = interpolate(a.transform.scale.origin.x, b.transform.scale.origin.x, t),
        osy = interpolate(a.transform.scale.origin.y, b.transform.scale.origin.y, t),
        sx = interpolate(a.transform.scale.x, b.transform.scale.x, t),
        sy = interpolate(a.transform.scale.y, b.transform.scale.y, t),
        // rotate
        orx = interpolate(a.transform.rotate.origin.x, b.transform.rotate.origin.x, t),
        ory = interpolate(a.transform.rotate.origin.y, b.transform.rotate.origin.y, t),
        angle = interpolate(a.transform.rotate.angle, b.transform.rotate.angle, t)
    ;
    if (a.obj === b.obj)
    {
        tween.current.shape = render_shape(t, a.obj && (a.length !== b.length) ? a.obj.bezierPoints(a.length + t*(b.length - a.length)) : a.shape[tween.reverse ? 1 : 0], null, sx, sy, osx, osy, angle, orx, ory, tx, ty);
    }
    else
    {
        tween.current.shape = render_shape(t, a.shape[tween.reverse ? 1 : 0], b.shape[tween.reverse ? 0 : 1], sx, sy, osx, osy, angle, orx, ory, tx, ty);
    }
    tween.current.style = {
        'stroke': a.style.hasStroke && b.style.hasStroke ? interpolateRGB(a.style['stroke'], b.style['stroke'], t) : (a.style['stroke'] ? a.style['stroke'] : (b.style['stroke'] || tween.current.style['stroke'])),
        'stroke-opacity': interpolate(a.style['stroke-opacity'], b.style['stroke-opacity'], t),
        'fill': a.style.hasFill && b.style.hasFill ? interpolateRGB(a.style['fill'], b.style['fill'], t) : (a.style['fill'] ? a.style['fill'] : (b.style['fill'] || 'none')),
        'fill-opacity': interpolate(a.style['fill-opacity'], b.style['fill-opacity'], t),
        hasStroke: a.style.hasStroke && b.style.hasStroke,
        hasFill: a.style.hasFill && b.style.hasFill
    };
    return true;
}

// Tween between 2D shapes
// TODO:
// 1. export frames to images via toCanvas and to responsive CSS steps animation
var Tween = makeClass(Primitive, {
    constructor: function Tween(tween) {
        var self = this, run = false,
            fps = 60, dt = 0, timer = null,
            onStart = null, onEnd = null, animate;

        if (tween instanceof Tween) return tween;
        if (!(self instanceof Tween)) return new Tween(tween);

        Primitive.call(self);
        self.start = function() {
            run = true;
            if (timer) {clearTimeout(timer); timer = null;}
            if (is_first_frame(tween) && onStart) onStart(self);
            timer = setTimeout(animate, (is_first_frame(tween) ? (tween.delay || 0) : 0) + dt);
            return self;
        };
        self.stop = function() {
            run = false;
            if (timer) {clearTimeout(timer); timer = null;}
            return self;
        };
        self.rewind = function() {
            first_frame(tween);
            self.isChanged(true);
            return self;
        };
        self.reverse = function(bool) {
            tween.reverse = !!bool;
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
        self.numberOfFrames = function() {
            return tween.nframes;
        };
        self.framesPerSecond = function() {
            return tween.fps;
        };
        self.getBoundingBox = function() {
            return {
                ymin: tween.bb.ymin,
                xmin: tween.bb.xmin,
                ymax: tween.bb.ymax,
                xmax: tween.bb.xmax
            };
        };
        self.toSVGPath = function(svg) {
            var firstx = 0, firsty = 0,
                lastx = 0, lasty = 0,
                isConnected = true,
                path = tween.current.shape.map(function(b, i) {
                    var connects = true, c;
                    if (0 === i)
                    {
                        firstx = b[0].x;
                        firsty = b[0].y;
                        connects = true;
                        c = ['M',b[0].x,b[0].y,'C',b[1].x,b[1].y,b[2].x,b[2].y,b[3].x,b[3].y].join(' ');
                    }
                    else
                    {
                        connects = is_almost_equal(b[0].x, lastx) && is_almost_equal(b[0].y, lasty);
                        c = (connects ? ['C',b[1].x,b[1].y,b[2].x,b[2].y,b[3].x,b[3].y] : ['M',b[0].x,b[0].y,'C',b[1].x,b[1].y,b[2].x,b[2].y,b[3].x,b[3].y]).join(' ');
                        if (!connects)
                        {
                            if (isConnected && is_almost_equal(firstx, lastx) && is_almost_equal(firsty, lasty))
                            {
                                // close this and start new path
                                c = 'Z ' + c;
                                isConnected = true;
                            }
                            else
                            {
                                isConnected = false;
                            }
                            firstx = b[0].x;
                            firsty = b[0].y;
                        }
                    }
                    lastx = b[3].x;
                    lasty = b[3].y;
                    return c;
                }).join(' ')
            ;
            if (isConnected && is_almost_equal(firstx, lastx) && is_almost_equal(firsty, lasty))
                path += ' Z';
            if (arguments.length)
            {
                if (tween.current.style['stroke'])
                {
                    self.style['stroke'] = tween.current.style.hasStroke ? Color.toCSS(tween.current.style['stroke']) : tween.current.style['stroke'];
                    self.style['stroke-opacity'] = tween.current.style['stroke-opacity'];
                }
                if (tween.current.style['fill'])
                {
                    self.style['fill'] = tween.current.style.hasFill ? Color.toCSS(tween.current.style['fill']) : tween.current.style['fill'];
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
            ctx.lineWidth = self.style['stroke-width'];
            ctx.strokeStyle = tween.current.style.hasStroke ? Color.toCSS(tween.current.style['stroke'].concat([tween.current.style['stroke-opacity']])) : (tween.current.style['stroke'] || self.style['stroke']);
            if (tween.current.style['fill'])
            {
                ctx.fillStyle = tween.current.style.hasFill ? Color.toCSS(tween.current.style['fill'].concat([tween.current.style['fill-opacity']])) : tween.current.style['fill'];
            }
            self.toCanvasPath(ctx);
            if (tween.current.style['fill']) ctx.fill();
            ctx.stroke();
        };
        self.toCanvasPath = function(ctx) {
            var firstx = 0, firsty = 0,
                lastx = 0, lasty = 0,
                isConnected = true;
            tween.current.shape.forEach(function(b, i) {
                var connects = true;
                if (0 === i)
                {
                    connects = true;
                    firstx = b[0].x;
                    firsty = b[0].y;
                    ctx.beginPath();
                    ctx.moveTo(firstx, firsty);
                    ctx.bezierCurveTo(b[1].x, b[1].y, b[2].x, b[2].y, b[3].x, b[3].y);
                }
                else
                {
                    connects = is_almost_equal(b[0].x, lastx) && is_almost_equal(b[0].y, lasty);
                    if (connects)
                    {
                        ctx.bezierCurveTo(b[1].x, b[1].y, b[2].x, b[2].y, b[3].x, b[3].y);
                    }
                    else
                    {
                        if (isConnected && is_almost_equal(firstx, lastx) && is_almost_equal(firsty, lasty))
                        {
                            // close this and start new path
                            ctx.closePath();
                            ctx.beginPath();
                            isConnected = true;
                        }
                        else
                        {
                            isConnected = false;
                        }
                        firstx = b[0].x;
                        firsty = b[0].y;
                        ctx.moveTo(firstx, firsty);
                        ctx.bezierCurveTo(b[1].x, b[1].y, b[2].x, b[2].y, b[3].x, b[3].y);
                    }
                }
                lastx = b[3].x;
                lasty = b[3].y;
            });
            if (isConnected && is_almost_equal(firstx, lastx) && is_almost_equal(firsty, lasty))
                ctx.closePath();
        };
        self.dispose = function() {
            run = false;
            if (timer) clearTimeout(timer);
            timer = null;
            onStart = null;
            onEnd = null;
            tween = null;
            self.$super('dispose');
        };

        fps = 60;
        tween = prepare_tween(tween, fps);
        fps = tween.fps;
        dt = stdMath.floor(1000/fps);
        animate = function animate() {
            if (!run || !tween) return;
            if (next_frame(tween))
            {
                self.isChanged(true);
                if (is_tween_finished(tween))
                {
                    if (onEnd) setTimeout(function() {onEnd(self);}, dt);
                }
                else
                {
                    timer = setTimeout(animate, dt);
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
