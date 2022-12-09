// Color utilities
// eg for stroke, fill, ..
var hexRE = /^#([0-9a-fA-F]{3,6})\b/,
    rgbRE = /^(rgba?)\b\s*\(([^\)]*)\)/i,
    hslRE = /^(hsla?)\b\s*\(([^\)]*)\)/i,
    hwbRE = /^(hwba?)\b\s*\(([^\)]*)\)/i,
    sepRE = /\s+|,/gm, aRE = /\/\s*(\d*?\.?\d+%?)/;

function hex2rgb(h)
{
    if (!h || 3 > h.length)
    {
        return [0, 0, 0, 0];
    }
    else if (6 > h.length)
    {
        return [
        clamp(parseInt(h[0]+h[0], 16)||0, 0, 255),
        clamp(parseInt(h[1]+h[1], 16)||0, 0, 255),
        clamp(parseInt(h[2]+h[2], 16)||0, 0, 255),
        1
        ];
    }
    else
    {
        return [
        clamp(parseInt(h[0]+h[1], 16)||0, 0, 255),
        clamp(parseInt(h[2]+h[3], 16)||0, 0, 255),
        clamp(parseInt(h[4]+h[5], 16)||0, 0, 255),
        1
        ];
    }
}
function hsl2rgb(h, s, l, a)
{
    var c, hp, d, x, m, r, g, b;
    s /= 100;
    l /= 100;
    c = (1 - abs(2*l - 1))*s;
    hp = h/60;
    d = stdMath.floor(hp / 2);
    x = c*(1 - abs(hp - 2*d - 1));
    m = l - c/2;
    if (hp >= 0 && hp < 1)
    {
        r = c + m;
        g = x + m;
        b = 0 + m;
    }
    else if (hp >= 1 && hp < 2)
    {
        r = x + m;
        g = c + m;
        b = 0 + m;
    }
    else if (hp >= 2 && hp < 3)
    {
        r = 0 + m;
        g = c + m;
        b = x + m;
    }
    else if (hp >= 3 && hp < 4)
    {
        r = 0 + m;
        g = x + m;
        b = c + m;
    }
    else if (hp >= 4 && hp < 5)
    {
        r = x + m;
        g = 0 + m;
        b = c + m;
    }
    else //if (hp >= 5 && hp < 6)
    {
        r = c + m;
        g = 0 + m;
        b = x + m;
    }
    return [
    clamp(stdMath.round(r*255), 0, 255),
    clamp(stdMath.round(g*255), 0, 255),
    clamp(stdMath.round(b*255), 0, 255),
    a
    ];
}
function hsv2rgb(h, s, v, a)
{
    v /= 100;
    var l = v*(1 - s/200), lm = stdMath.min(l, 1-l);
    return hsl2rgb(h, 0 === lm ? 0 : 100*(v-l)/lm, 100*l, a);
}
function hwb2rgb(h, w, b, a)
{
    var b1 = 1 - b/100;
    return hsv2rgb(h, 100 - w/b1, 100*b1, a);
}
function parseColor(s)
{
    var m, hasOpacity;
    s = trim(Str(s)).toLowerCase();
    if (m = s.match(hexRE))
    {
        // hex
        return hex2rgb(m[1]);
    }
    if (m = s.match(hwbRE))
    {
        // hwb(a)
        hasOpacity = m[2].match(aRE);
        var col = trim(m[2]).split(sepRE).map(trim),
            h = col[0] ? col[0] : '0',
            w = col[1] ? col[1] : '0',
            b = col[2] ? col[2] : '0',
            a = hasOpacity ? hasOpacity[1] : '1';
        h = parseFloat(h, 10);
        w = '%' === w.slice(-1) ? parseFloat(w, 10) : parseFloat(w, 10)*100/255;
        b = '%' === b.slice(-1) ? parseFloat(b, 10) : parseFloat(b, 10)*100/255;
        a = '%' === a.slice(-1) ? parseFloat(a, 10)/100 : parseFloat(a, 10);
        return hwb2rgb(h, w, b, a);
    }
    if (m = s.match(hslRE))
    {
        // hsl(a)
        hasOpacity = m[2].match(aRE);
        var col = trim(m[2]).split(sepRE).map(trim),
            h = col[0] ? col[0] : '0',
            s = col[1] ? col[1] : '0',
            l = col[2] ? col[2] : '0',
            a = hasOpacity ? hasOpacity[1] : ('hsla' === m[1] && null != col[3] ? col[3] : '1');
        h = parseFloat(h, 10);
        s = '%' === s.slice(-1) ? parseFloat(s, 10) : parseFloat(s, 10)*100/255;
        l = '%' === l.slice(-1) ? parseFloat(l, 10) : parseFloat(l, 10)*100/255;
        a = '%' === a.slice(-1) ? parseFloat(a, 10)/100 : parseFloat(a, 10);
        return hsl2rgb(h, s, l, a);
    }
    if (m = s.match(rgbRE))
    {
        // rgb(a)
        hasOpacity = m[2].match(aRE);
        var col = trim(m[2]).split(sepRE).map(trim),
            r = col[0] ? col[0] : '0',
            g = col[1] ? col[1] : '0',
            b = col[2] ? col[2] : '0',
            a = hasOpacity ? hasOpacity[1] : ('rgba' === m[1] && null != col[3] ? col[3] : '1');
        r = '%' === r.slice(-1) ? parseFloat(r, 10)*2.55 : parseFloat(r, 10);
        g = '%' === g.slice(-1) ? parseFloat(g, 10)*2.55 : parseFloat(g, 10);
        b = '%' === b.slice(-1) ? parseFloat(b, 10)*2.55 : parseFloat(b, 10);
        a = '%' === a.slice(-1) ? parseFloat(a, 10)/100 : parseFloat(a, 10);
        return [r, g, b, a];
    }
    if (HAS.call(Color.keywords, s))
    {
        // keyword
        return Color.keywords[s].slice();
    }
}
function interpolateRGB(r0, g0, b0, a0, r1, g1, b1, a1, t)
{
    if (9 <= arguments.length)
    {
        var t0 = (t||0), t1 = 1 - t0;
        return [
        clamp(stdMath.round(t1*r0 + t0*r1), 0, 255),
        clamp(stdMath.round(t1*g0 + t0*g1), 0, 255),
        clamp(stdMath.round(t1*b0 + t0*b1), 0, 255),
        clamp(t1*a0 + t0*a1, 0, 1)
        ];
    }
    else
    {
        var t0 = (b0||0), t1 = 1 - t0, rgba0 = r0, rgba1 = g0;
        return 3 < rgba0.length ? [
        clamp(stdMath.round(t1*rgba0[0] + t0*rgba1[0]), 0, 255),
        clamp(stdMath.round(t1*rgba0[1] + t0*rgba1[1]), 0, 255),
        clamp(stdMath.round(t1*rgba0[2] + t0*rgba1[2]), 0, 255),
        clamp(t1*rgba0[3] + t0*rgba1[3], 0, 1)
        ] : [
        clamp(stdMath.round(t1*rgba0[0] + t0*rgba1[0]), 0, 255),
        clamp(stdMath.round(t1*rgba0[1] + t0*rgba1[1]), 0, 255),
        clamp(stdMath.round(t1*rgba0[2] + t0*rgba1[2]), 0, 255)
        ];
    }
}
function interpolatePixel(pixel, index, rgba0, rgba1, t)
{
    pixel[index + 0] = clamp(stdMath.round(rgba0[0] + t*(rgba1[0] - rgba0[0])), 0, 255);
    pixel[index + 1] = clamp(stdMath.round(rgba0[1] + t*(rgba1[1] - rgba0[1])), 0, 255);
    pixel[index + 2] = clamp(stdMath.round(rgba0[2] + t*(rgba1[2] - rgba0[2])), 0, 255);
    pixel[index + 3] = 3 < rgba0.length ? clamp(stdMath.round(255*(rgba0[3] + t*(rgba1[3] - rgba0[3]))), 0, 255) : 255;
}
var Color = {
    keywords: {
    // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
    /* extended */
     'transparent'         : [  0,0,0        ,0]
    ,'aliceblue'           : [  240,248,255  ,1]
    ,'antiquewhite'        : [  250,235,215  ,1]
    ,'aqua'                : [  0,255,255    ,1]
    ,'aquamarine'          : [  127,255,212  ,1]
    ,'azure'               : [  240,255,255  ,1]
    ,'beige'               : [  245,245,220  ,1]
    ,'bisque'              : [  255,228,196  ,1]
    ,'black'               : [  0,0,0    ,    1]
    ,'blanchedalmond'      : [  255,235,205  ,1]
    ,'blue'                : [  0,0,255  ,    1]
    ,'blueviolet'          : [  138,43,226   ,1]
    ,'brown'               : [  165,42,42    ,1]
    ,'burlywood'           : [  222,184,135  ,1]
    ,'cadetblue'           : [  95,158,160   ,1]
    ,'chartreuse'          : [  127,255,0    ,1]
    ,'chocolate'           : [  210,105,30   ,1]
    ,'coral'               : [  255,127,80   ,1]
    ,'cornflowerblue'      : [  100,149,237  ,1]
    ,'cornsilk'            : [  255,248,220  ,1]
    ,'crimson'             : [  220,20,60    ,1]
    ,'cyan'                : [  0,255,255    ,1]
    ,'darkblue'            : [  0,0,139  ,    1]
    ,'darkcyan'            : [  0,139,139    ,1]
    ,'darkgoldenrod'       : [  184,134,11   ,1]
    ,'darkgray'            : [  169,169,169  ,1]
    ,'darkgreen'           : [  0,100,0  ,    1]
    ,'darkgrey'            : [  169,169,169  ,1]
    ,'darkkhaki'           : [  189,183,107  ,1]
    ,'darkmagenta'         : [  139,0,139    ,1]
    ,'darkolivegreen'      : [  85,107,47    ,1]
    ,'darkorange'          : [  255,140,0    ,1]
    ,'darkorchid'          : [  153,50,204   ,1]
    ,'darkred'             : [  139,0,0  ,    1]
    ,'darksalmon'          : [  233,150,122  ,1]
    ,'darkseagreen'        : [  143,188,143  ,1]
    ,'darkslateblue'       : [  72,61,139    ,1]
    ,'darkslategray'       : [  47,79,79 ,    1]
    ,'darkslategrey'       : [  47,79,79 ,    1]
    ,'darkturquoise'       : [  0,206,209    ,1]
    ,'darkviolet'          : [  148,0,211    ,1]
    ,'deeppink'            : [  255,20,147   ,1]
    ,'deepskyblue'         : [  0,191,255    ,1]
    ,'dimgray'             : [  105,105,105  ,1]
    ,'dimgrey'             : [  105,105,105  ,1]
    ,'dodgerblue'          : [  30,144,255   ,1]
    ,'firebrick'           : [  178,34,34    ,1]
    ,'floralwhite'         : [  255,250,240  ,1]
    ,'forestgreen'         : [  34,139,34    ,1]
    ,'fuchsia'             : [  255,0,255    ,1]
    ,'gainsboro'           : [  220,220,220  ,1]
    ,'ghostwhite'          : [  248,248,255  ,1]
    ,'gold'                : [  255,215,0    ,1]
    ,'goldenrod'           : [  218,165,32   ,1]
    ,'gray'                : [  128,128,128  ,1]
    ,'green'               : [  0,128,0  ,    1]
    ,'greenyellow'         : [  173,255,47   ,1]
    ,'grey'                : [  128,128,128  ,1]
    ,'honeydew'            : [  240,255,240  ,1]
    ,'hotpink'             : [  255,105,180  ,1]
    ,'indianred'           : [  205,92,92    ,1]
    ,'indigo'              : [  75,0,130 ,    1]
    ,'ivory'               : [  255,255,240  ,1]
    ,'khaki'               : [  240,230,140  ,1]
    ,'lavender'            : [  230,230,250  ,1]
    ,'lavenderblush'       : [  255,240,245  ,1]
    ,'lawngreen'           : [  124,252,0    ,1]
    ,'lemonchiffon'        : [  255,250,205  ,1]
    ,'lightblue'           : [  173,216,230  ,1]
    ,'lightcoral'          : [  240,128,128  ,1]
    ,'lightcyan'           : [  224,255,255  ,1]
    ,'lightgoldenrodyellow': [  250,250,210  ,1]
    ,'lightgray'           : [  211,211,211  ,1]
    ,'lightgreen'          : [  144,238,144  ,1]
    ,'lightgrey'           : [  211,211,211  ,1]
    ,'lightpink'           : [  255,182,193  ,1]
    ,'lightsalmon'         : [  255,160,122  ,1]
    ,'lightseagreen'       : [  32,178,170   ,1]
    ,'lightskyblue'        : [  135,206,250  ,1]
    ,'lightslategray'      : [  119,136,153  ,1]
    ,'lightslategrey'      : [  119,136,153  ,1]
    ,'lightsteelblue'      : [  176,196,222  ,1]
    ,'lightyellow'         : [  255,255,224  ,1]
    ,'lime'                : [  0,255,0  ,    1]
    ,'limegreen'           : [  50,205,50    ,1]
    ,'linen'               : [  250,240,230  ,1]
    ,'magenta'             : [  255,0,255    ,1]
    ,'maroon'              : [  128,0,0  ,    1]
    ,'mediumaquamarine'    : [  102,205,170  ,1]
    ,'mediumblue'          : [  0,0,205  ,    1]
    ,'mediumorchid'        : [  186,85,211   ,1]
    ,'mediumpurple'        : [  147,112,219  ,1]
    ,'mediumseagreen'      : [  60,179,113   ,1]
    ,'mediumslateblue'     : [  123,104,238  ,1]
    ,'mediumspringgreen'   : [  0,250,154    ,1]
    ,'mediumturquoise'     : [  72,209,204   ,1]
    ,'mediumvioletred'     : [  199,21,133   ,1]
    ,'midnightblue'        : [  25,25,112    ,1]
    ,'mintcream'           : [  245,255,250  ,1]
    ,'mistyrose'           : [  255,228,225  ,1]
    ,'moccasin'            : [  255,228,181  ,1]
    ,'navajowhite'         : [  255,222,173  ,1]
    ,'navy'                : [  0,0,128  ,    1]
    ,'oldlace'             : [  253,245,230  ,1]
    ,'olive'               : [  128,128,0    ,1]
    ,'olivedrab'           : [  107,142,35   ,1]
    ,'orange'              : [  255,165,0    ,1]
    ,'orangered'           : [  255,69,0 ,    1]
    ,'orchid'              : [  218,112,214  ,1]
    ,'palegoldenrod'       : [  238,232,170  ,1]
    ,'palegreen'           : [  152,251,152  ,1]
    ,'paleturquoise'       : [  175,238,238  ,1]
    ,'palevioletred'       : [  219,112,147  ,1]
    ,'papayawhip'          : [  255,239,213  ,1]
    ,'peachpuff'           : [  255,218,185  ,1]
    ,'peru'                : [  205,133,63   ,1]
    ,'pink'                : [  255,192,203  ,1]
    ,'plum'                : [  221,160,221  ,1]
    ,'powderblue'          : [  176,224,230  ,1]
    ,'purple'              : [  128,0,128    ,1]
    ,'red'                 : [  255,0,0  ,    1]
    ,'rosybrown'           : [  188,143,143  ,1]
    ,'royalblue'           : [  65,105,225   ,1]
    ,'saddlebrown'         : [  139,69,19    ,1]
    ,'salmon'              : [  250,128,114  ,1]
    ,'sandybrown'          : [  244,164,96   ,1]
    ,'seagreen'            : [  46,139,87    ,1]
    ,'seashell'            : [  255,245,238  ,1]
    ,'sienna'              : [  160,82,45    ,1]
    ,'silver'              : [  192,192,192  ,1]
    ,'skyblue'             : [  135,206,235  ,1]
    ,'slateblue'           : [  106,90,205   ,1]
    ,'slategray'           : [  112,128,144  ,1]
    ,'slategrey'           : [  112,128,144  ,1]
    ,'snow'                : [  255,250,250  ,1]
    ,'springgreen'         : [  0,255,127    ,1]
    ,'steelblue'           : [  70,130,180   ,1]
    ,'tan'                 : [  210,180,140  ,1]
    ,'teal'                : [  0,128,128    ,1]
    ,'thistle'             : [  216,191,216  ,1]
    ,'tomato'              : [  255,99,71    ,1]
    ,'turquoise'           : [  64,224,208   ,1]
    ,'violet'              : [  238,130,238  ,1]
    ,'wheat'               : [  245,222,179  ,1]
    ,'white'               : [  255,255,255  ,1]
    ,'whitesmoke'          : [  245,245,245  ,1]
    ,'yellow'              : [  255,255,0    ,1]
    ,'yellowgreen'         : [  154,205,50   ,1]
    },
    parse: parseColor,
    interpolateRGB: interpolateRGB,
    toCSS: function(r, g, b, a) {
        if (1 === arguments.length)
        {
            var rgba = r;
            return 3 < rgba.length ? 'rgba('+rgba[0]+','+rgba[1]+','+rgba[2]+','+rgba[3]+')' : 'rgb('+rgba[0]+','+rgba[1]+','+rgba[2]+')';
        }
        else
        {
            return 3 < arguments.length ? 'rgba('+r+','+g+','+b+','+a+')' : 'rgb('+r+','+g+','+b+')';
        }
    }
};
// gradients
var U8A = 'undefined' !== typeof root.Uint8Array ? root.Uint8Array : Array;
function q(a, b, c)
{
    var s = solve_quadratic(a, b, c);
    if (!s) return -1;
    if (1 < s.length)
    {
        if (0 <= s[0] && s[0] <= 1 && 0 <= s[1] && s[1] <= 1) return stdMath.min(s[0], s[1]);
        if (0 <= s[0] && s[0] <= 1) return s[0];
        if (0 <= s[1] && s[1] <= 1) return s[1];
        return stdMath.min(s[0], s[1]);
    }
    return s[0];
}
Color.Gradient = {
    Linear: function(x1, y1, x2, y2, colors, stops) {
        return function(w, h) {
            var i, x, y, t, dx, dy, px, py, stop1, stop2,
                size = (w*h)<<2, grad = new U8A(size),
                vert, hor, sl = stops.length;
            x1 = x1 || 0;
            y1 = y1 || 0;
            x2 = x2 || 0;
            y2 = y2 || 0;
            dx = x2 - x1;
            dy = y2 - y1;
            vert = is_strictly_equal(dx, 0);
            hor = is_strictly_equal(dy, 0);
            for (x=0,y=0,i=0; i<size; i+=4,++x)
            {
                if (x >= w) {x=0; ++y;}
                px = x - x1; py = y - y1;
                t = hor && vert ? 0 : (vert ? py/dy : (hor ? px/dx : (px*dy + py*dx)/(2*dx*dy)));
                if (0 >= t)
                {
                    stop1 = stop2 = 0;
                    t = 0;
                }
                else if (1 <= t)
                {
                    stop1 = stop2 = sl - 1;
                    t = 1;
                }
                else
                {
                    stop2 = binary_search(t, stops, sl);
                    stop1 = 0 === stop2 ? 0 : (stop2 - 1);
                }
                interpolatePixel(
                    grad, i,
                    colors[stop1], colors[stop2],
                    // warp the value if needed, between stop ranges
                    stops[stop2] > stops[stop1] ? (t - stops[stop1])/(stops[stop2] - stops[stop1]) : t
                );
            }
            return grad;
        };
    },
    Radial: function(x0, y0, r0, x1, y1, r1, colors, stops) {
        return function(w, h) {
            var i, x, y, t, px0, py0, px1, py1, pr0, pr1, stop1, stop2,
                size = (w*h)<<2, grad = new U8A(size),
                sl = stops.length, abs = stdMath.abs, sqrt = stdMath.sqrt;
            x0 = x0 || 0;
            y0 = y0 || 0;
            r0 = r0 || 0;
            x1 = x1 || 0;
            y1 = y1 || 0;
            r1 = r1 || 0;
            for (x=0,y=0,i=0; i<size; i+=4,++x)
            {
                if (x >= w) {x=0; ++y;}
                // 0 = (r0+t*(r1-r0))**2 - (x - (x0 + t*(x1-x0)))**2 - (y - (y0 + t*(y1-y0)))**2
                // t^{2} \left(r_{0}^{2} - 2 r_{0} r_{1} + r_{1}^{2} - x_{0}^{2} + 2 x_{0} x_{1} - x_{1}^{2} - y_{0}^{2} + 2 y_{0} y_{1} - y_{1}^{2}\right) + t \left(- 2 r_{0}^{2} + 2 r_{0} r_{1} - 2 x x_{0} + 2 x x_{1} + 2 x_{0}^{2} - 2 x_{0} x_{1} - 2 y y_{0} + 2 y y_{1} + 2 y_{0}^{2} - 2 y_{0} y_{1}\right) - x^{2} + 2 x x_{0} - x_{0}^{2} - y^{2} + 2 y y_{0} - y_{0}^{2}+r_{0}^{2}
                /*px1 = x - cx1; py1 = y - cy1;
                dr1 = sqrt(px1*px1 + py1*py1) - r1;
                px2 = x - cx2; py2 = y - cy2;
                dr2 = r2 - sqrt(px2*px2 + py2*py2);*/
                t = q(
                    r0*r0 - 2*r0*r1 + r1*r1 - x0*x0 + 2*x0*x1 - x1*x1 - y0*y0 + 2*y0*y1 - y1*y1,
                    -2*r0*r0 + 2*r0*r1 - 2*x*x0 + 2*x*x1 + 2*x0*x0 - 2*x0*x1 - 2*y*y0 + 2*y*y1 + 2*y0*y0 - 2*y0*y1,
                    -x*x + 2*x*x0 - x0*x0 - y*y + 2*y*y0 - y0*y0 + r0*r0
                );
                //rt = r0 + t*(r1 - r0);
                if (0 >= t || t >= 1)
                {
                    px0 = x - x0; py0 = y - y0;
                    pr0 = sqrt(px0*px0 + py0*py0);
                    //px1 = x - x1; py1 = y - y1;
                    //pr1 = sqrt(px1*px1 + py1*py1);
                    if (pr0 < r0)
                    {
                        t = 0;
                        stop2 = stop1 = 0;
                    }
                    else //if (pr1 > r1)
                    {
                        t = 1;
                        stop2 = stop1 = sl - 1;
                    }
                }
                else
                {
                    //t = dr1/(dr2 + dr1);
                    stop2 = binary_search(t, stops, sl);
                    stop1 = 0 === stop2 ? 0 : (stop2 - 1);
                }
                interpolatePixel(
                    grad, i,
                    colors[stop1], colors[stop2],
                    // warp the value if needed, between stop ranges
                    stops[stop2] > stops[stop1] ? (t - stops[stop1])/(stops[stop2] - stops[stop1]) : t
                );
            }
            return grad;
        };
    },
    Conic: function(angle, cx, cy, colors, stops) {
        return function(w, h) {
            var i, x, y, t, stop1, stop2,
                size = (w*h)<<2, grad = new U8A(size),
                sl = stops.length, atan2 = stdMath.atan2;
            angle = angle || 0;
            cx = cx || 0;
            cy = cy || 0;
            for (x=0,y=0,i=0; i<size; i+=4,++x)
            {
                if (x >= w) {x=0; ++y;}
                t = atan2(y - cy, x - cx) + HALF_PI - angle;
                if (0 > t) t += TWO_PI;
                if (t > TWO_PI) t -= TWO_PI;
                t = clamp(t/TWO_PI, 0, 1);
                stop2 = binary_search(t, stops, sl);
                stop1 = 0 === stop2 ? 0 : (stop2 - 1);
                interpolatePixel(
                    grad, i,
                    colors[stop1], colors[stop2],
                    // warp the value if needed, between stop ranges
                    stops[stop2] > stops[stop1] ? (t - stops[stop1])/(stops[stop2] - stops[stop1]) : t
                );
            }
            return grad;
        };
    },
    Elliptic: function(cx, cy, rx, ry, angle, colors, stops) {
        return function(w, h) {
            var i, x, y, t, px, py, cos, sin, stop1, stop2,
                size = (w*h)<<2, grad = new U8A(size),
                sl = stops.length, sqrt = stdMath.sqrt;
            cx = cx || 0;
            cy = cy || 0;
            rx = rx || 0;
            ry = ry || 0;
            angle = angle || 0;
            cos = stdMath.cos(angle);
            sin = stdMath.sin(angle);
            for (x=0,y=0,i=0; i<size; i+=4,++x)
            {
                if (x >= w) {x=0; ++y;}
                px = (cos*(x - cx) - sin*(y - cy))/rx;
                py = (sin*(x - cx) + cos*(y - cy))/ry;
                t = sqrt(px*px + py*py);
                if (1 <= t)
                {
                    stop2 = stop1 = sl - 1;
                    t = 1;
                }
                else
                {
                    stop2 = binary_search(t, stops, sl);
                    stop1 = 0 === stop2 ? 0 : (stop2 - 1);
                }
                interpolatePixel(
                    grad, i,
                    colors[stop1], colors[stop2],
                    // warp the value if needed, between stop ranges
                    stops[stop2] > stops[stop1] ? (t - stops[stop1])/(stops[stop2] - stops[stop1]) : t
                );
            }
            return grad;
        };
    }
};
Geometrize.Color = Color;
