// ---- utilities -----
function is_almost_zero(x)
{
    return stdMath.abs(x) < Number.EPSILON;
}
function is_almost_equal(a, b)
{
    return is_almost_zero(a - b);
}
function dotp(x1, y1, x2, y2)
{
    return x1*x2 + y1*y2;
}
function crossp(x1, y1, x2, y2)
{
    return x1*y2 - y1*x2;
}
function dist(p1, p2)
{
    var dx = p1.x - p2.x, dy = p1.y - p2.y;
    return stdMath.sqrt(dx*dx + dy*dy);
}
function polar_angle(p1, p2)
{
    var a = stdMath.atan2(p2.y - p1.y, p2.x - p1.x);
    return a < 0 ? a + 2*stdMath.PI : a;
}
function dir(p1, p2, p3)
{
    var dx1 = p1.x - p3.x, dx2 = p2.x - p3.x,
        dy1 = p1.y - p3.y, dy2 = p2.y - p3.y;
    return dx1*dy2 - dy1*dx2;
}
function point_line_distance(p0, p1, p2)
{
    // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    var dx = p2.x - p1.x, dy = p2.y - p1.y;
    return stdMath.abs(dx*(p1.y-p0.y) - dy*(p1.x-p0.x)) / stdMath.sqrt(dx*dx + dy*dy);
}
function point_between(p, p1, p2)
{
    var t = 0,
        dxp = p.x - p1.x,
        dx = p2.x - p1.x,
        dyp = p.y - p1.y,
        dy = p2.y - p1.y
    ;
    if (is_almost_zero(dyp*dx - dy*dxp))
    {
        // colinear and inside line segment of p1-p2
        t = is_almost_zero(dx) ? dyp/dy : dxp/dx;
        return (0 <= t) && (t <= 1);
    }
    return false;
}
function line_line_intersection(a, b, c, k, l, m)
{
    /*
    https://www.wolframalpha.com/input?key=&i=system+of+equations&assumption=%7B%22F%22%2C+%22SolveSystemOf2EquationsCalculator%22%2C+%22equation1%22%7D+-%3E%22ax%2Bby%2Bc%3D0%22&assumption=%7B%22C%22%2C+%22system+of+equations%22%7D+-%3E+%7B%22Calculator%22%7D&assumption=%22FSelect%22+-%3E+%7B%7B%22SolveSystemOf2EquationsCalculator%22%7D%7D&assumption=%7B%22F%22%2C+%22SolveSystemOf2EquationsCalculator%22%2C+%22equation2%22%7D+-%3E%22kx%2Bly%2Bm%3D0%22

    ax+by+c=0
    kx+ly+m=0

    x = (c l - b m)/(b k - a l)
    y = (c k - a m)/(a l - b k)
    and b k!=a l and b!=0
    */
    var det = a*l - b*k;
    // zero, infinite or one point
    return is_almost_zero(det) ? false : new Point((b*m - c*l)/det, (c*k - a*m)/det);
}
function line_quadratic_intersection(m, n, k, a, b, c, d, e, f)
{
    // https://live.sympy.org/
    /*
    https://live.sympy.org/
    mx+ny+k=0
    ax^2+by^2+cxy+dx+ey+f=0

    x,y,a,b,c,d,e,f,n,m,k = symbols('x y a b c d e f n m k', real=True)
    nonlinsolve([a*x**2+b*y**2+c*x*y+d*x+e*y+f, m*x+n*y+k], [x, y])

    {(-(k + n*(-m*sqrt(-4*a*b*k**2 + 4*a*e*k*n - 4*a*f*n**2 + 4*b*d*k*m - 4*b*f*m**2 + c**2*k**2 - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d**2*n**2 - 2*d*e*m*n + e**2*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)) - (2*a*k*n - c*k*m - d*m*n + e*m**2)/(2*(a*n**2 + b*m**2 - c*m*n))))/m, -m*sqrt(-4*a*b*k**2 + 4*a*e*k*n - 4*a*f*n**2 + 4*b*d*k*m - 4*b*f*m**2 + c**2*k**2 - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d**2*n**2 - 2*d*e*m*n + e**2*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)) - (2*a*k*n - c*k*m - d*m*n + e*m**2)/(2*(a*n**2 + b*m**2 - c*m*n))), (-(k + n*(m*sqrt(-4*a*b*k**2 + 4*a*e*k*n - 4*a*f*n**2 + 4*b*d*k*m - 4*b*f*m**2 + c**2*k**2 - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d**2*n**2 - 2*d*e*m*n + e**2*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)) - (2*a*k*n - c*k*m - d*m*n + e*m**2)/(2*(a*n**2 + b*m**2 - c*m*n))))/m, m*sqrt(-4*a*b*k**2 + 4*a*e*k*n - 4*a*f*n**2 + 4*b*d*k*m - 4*b*f*m**2 + c**2*k**2 - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d**2*n**2 - 2*d*e*m*n + e**2*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)) - (2*a*k*n - c*k*m - d*m*n + e*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)))}
    */

    /*
    https://www.wolframalpha.com/input?key=&i=systems+of+equations+calculator&assumption=%7B%22F%22%2C+%22SolveSystemOf2EquationsCalculator%22%2C+%22equation1%22%7D+-%3E%22mx%2Bny%2Bk%3D0%22&assumption=%22FSelect%22+-%3E+%7B%7B%22SolveSystemOf2EquationsCalculator%22%7D%7D&assumption=%7B%22F%22%2C+%22SolveSystemOf2EquationsCalculator%22%2C+%22equation2%22%7D+-%3E%22ax%5E2%2Bby%5E2%2Bcxy%2Bdx%2Bey%2Bf%3D+0%22
    mx+ny+k=0
    ax^2+by^2+cxy+dx+ey+f=0

    x = (-sqrt((2 b k m - c k n + d n^2 - e m n)^2 - 4 (b k^2 + f n^2 - e k n) (a n^2 + b m^2 - c m n)) - 2 b k m + c k n - d n^2 + e m n)/(2 (a n^2 + b m^2 - c m n))
    ∧ y = (m sqrt((2 b k m - c k n + d n^2 - e m n)^2 - 4 (b k^2 + f n^2 - e k n) (a n^2 + b m^2 - c m n)) - 2 a k n^2 + c k m n + d m n^2 - e m^2 n)/(2 n (a n^2 + b m^2 - c m n))
    ∧ a n^2 + b m^2 - c m n!=0 ∧ n!=0
    x = (sqrt((2 b k m - c k n + d n^2 - e m n)^2 - 4 (b k^2 + f n^2 - e k n) (a n^2 + b m^2 - c m n)) - 2 b k m + c k n - d n^2 + e m n)/(2 (a n^2 + b m^2 - c m n))
    ∧ y = (-m sqrt((2 b k m - c k n + d n^2 - e m n)^2 - 4 (b k^2 + f n^2 - e k n) (a n^2 + b m^2 - c m n)) - 2 a k n^2 + c k m n + d m n^2 - e m^2 n)/(2 n (a n^2 + b m^2 - c m n))
    ∧ a n^2 + b m^2 - c m n!=0 ∧ n!=0
    */
}
function quadratic_quadratic_intersection(a, b, c, d, e, f, m, n, l, k, g, h)
{
    /*
    https://live.sympy.org/
    ax^2+by^2+cxy+dx+ey+f=0
    mx^2+ny^2+lxy+kx+gy+h=0

    x,y,a,b,c,d,e,f,n,m,l,k,g,h = symbols('x y a b c d e f n m l k g h', real=True)
    nonlinsolve([a*x**2+b*y**2+c*x*y+d*x+e*y+f, m*x**2+n*y**2+l*x*y+k*x+g*y+h], [x, y])
    */
}
function convex_hull(points)
{
    // https://en.wikipedia.org/wiki/Convex_hull
    // https://en.wikipedia.org/wiki/Convex_hull_algorithms
    // https://en.wikipedia.org/wiki/Graham_scan
    var pc = points.length;

    // at least 3 points must define a non-trivial convex hull
    if (3 > pc) return points;

    var p0 = points[0], i0 = 0;
    points.forEach(function(p, i) {
        if ((p.y < p0.y) || (is_almost_equal(p.y, p0.y) && (p.x < p0.x)))
        {
            p0 = p;
            i0 = i;
        }
    });
    points.splice(i0, 1);
    --pc;

    var ps = points
        .map(function(p, i) {
            return [polar_angle(p0, p), i];
        })
        .sort(sort_asc0)
        .map(function(a) {
            return points[a[1]];
        });

    var convexHull = [p0, ps[0], ps[1]], hullSize = 3, i;

    for (i=2; i<pc; ++i)
    {
        while (0 <= dir(ps[i], convexHull[hullSize-1], convexHull[hullSize-2]))
        {
            convexHull.pop();
            --hullSize;
        }
        convexHull.push(ps[i]);
        ++hullSize;
    }
    return convexHull;
}
function in_convex_hull(convexHull, p, strict)
{
    var hl = convexHull.length, i, p0, p1, xp;
    if (!hl) return false;

    for (i=0; i<hl; ++i)
    {
        p0 = convexHull[i];
        p1 = convexHull[(i+1) % hl];
        xp = dir(p1, p, p0);
        if ((strict && xp < 0) || (!strict && xp <= 0))  return false;
    }
    return true;
}

// ----------------------
var cnt = 0;
function uuid(ns)
{
    return Str(ns||'')+'_'+Str(++cnt)+'_'+Str(new Date().getTime())+'_'+Str(stdMath.round(1000*stdMath.random()));
}
function Num(x)
{
    return (+x) || 0;
}
function Tex(o)
{
    return is_function(o.toTex) ? o.toTex() : o.toString();
}
function Str(o)
{
    return String(o);
}
function is_numeric(x)
{
    return !isNaN(+x);
}
function is_string(x)
{
    return ('string' === typeof x) || ('[object String]' === toString.call(x));
}
function is_array(x)
{
    return ('[object Array]' === toString.call(x));
}
function is_object(x)
{
    return ('[object Object]' === toString.call(x)) && ('function' === typeof x.constructor) && ('Object' === x.constructor.name);
}
function is_function(x)
{
    return "function" === typeof x;
}
function merge(keys, a, b)
{
    if (keys)
    {
        keys.forEach(function(k) {
            if (HAS.call(b, k))
                a[k] = b[k];
        });
    }
    else
    {
        for (var k in b)
        {
            if (HAS.call(b, k))
                a[k] = b[k];
        }
    }
    return a;
}
function SVG(tag, atts, svg, g, ga)
{
    if (false === svg)
    {
        svg = '<'+tag+' '+Object.keys(atts).reduce(function(s, a) {
            return s + a+'="'+Str(atts[a])+'" ';
        }, '')+'/>';
        if (g)
        {
            svg = '<g '+Object.keys(ga||{}).reduce(function(s, a) {
                return s + a+'="'+Str(ga[a])+'" ';
            }, '')+'>'+svg+'</g>';
        }
    }
    else
    {
        if (!svg)
        {
            svg = document.createElementNS('http://www.w3.org/2000/svg', tag);
            if (g)
            {
                g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                g.appendChild(svg);
            }
        }
        else if (g)
        {
            g = svg;
            svg = g.firstChild;
        }
        Object.keys(atts).forEach(function(a) {
            svg.setAttribute(a, atts[a]);
        });
        if (g)
        {
            Object.keys(ga||{}).forEach(function(a) {
                g.setAttribute(a, ga[a]);
            });
        }
    }
    return svg;
}
function sort_asc(a, b)
{
    return a - b;
}
function sort_asc0(a, b)
{
    return a[0] - b[0];
}
function pad(x, n, c, post)
{
    var s = Str(x), l = s.length, p = '';
    if (l < n)
    {
        c = c || ' ';
        p = (new Array(n-l+1)).join(c);
        s = post ? s + p : p + s;
    }
    return s;
}
function debounce(func, wait, immediate)
{
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
function observeArray(array, typecaster, equals)
{
    if (is_function(array.onChange)) return array;

    var notify = function(changed) {
        array.$cb.forEach(function(cb) {cb(changed);});
    };

    var doNotifyItems = true;

    equals = equals || function(a, b) {return a === b;};

    var methodInterceptor = function() {
        var interceptor = function(method) {
            return function() {
                var args = arguments, result = null,
                    index = 0,
                    initialLength = array.length,
                    finalLength = 0;

                if (typecaster)
                {
                    if ('push' === method || 'unshift' === method)
                    {
                        args = Array.prototype.map.apply(args, typecaster);
                    }
                    if ('splice' === method && 2 < args.length)
                    {
                        args = Array.prototype.slice.call(args, 0, 2).concat(Array.prototype.slice.call(args, 2).map(typecaster));
                    }
                }

                if ('unshift' === method || 'splice' === method)
                {
                    // avoid superfluous notifications
                    doNotifyItems = false;
                }
                result = Array.prototype[method].apply(array, args);
                if ('unshift' === method || 'splice' === method)
                {
                    // restore notifications
                    doNotifyItems = true;
                }

                finalLength = array.length;
                if (('push' === method || 'unshift' === method || 'splice' === method) && (finalLength > initialLength))
                {
                    itemInterceptor(initialLength, finalLength);
                }

                if ('push' === method)
                {
                    notify({target:array, method:method, from:initialLength, to:finalLength});
                }
                else if ('unshift' === method)
                {
                    notify({target:array, method:method, from:0, to:finalLength-initialLength-1});
                }
                else if ('splice' === method && 2 < args.length)
                {
                    notify({target:array, method:method, from:args[0], to:args[0]+args.length-3});
                }
                else
                {
                    notify({target:array, method:method});
                }

                return result;
            };
        };
        ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(function(method) {
            array[method] = interceptor(method);
        });
    };

    var itemInterceptor = function(start, stop) {
        var interceptor = function(index) {
            var key = String(index), val = array[index];
            Object.defineProperty(array, key, {
                get() {
                    return val;
                },
                set(value) {
                    if (typecaster) value = typecaster(value);
                    var doNotify = !equals(val, value);
                    val = value;
                    if (doNotify && doNotifyItems)
                    {
                        notify({target:array, method:'set', from:index, to:index});
                    }
                },
                enumerable: true
            });
        };
        for (var index=start; index<stop; ++index)
        {
            interceptor(index);
        }
    };

    array.$cb = [];
    array.onChange = function onChange(cb, add) {
        var index;
        if (is_function(cb))
        {
            if (false === add)
            {
                index = array.$cb.indexOf(cb);
                if (-1 !== index) array.$cb.splice(index, 1);
            }
            else
            {
                index = array.$cb.indexOf(cb);
                if (-1 !== index) array.$cb.push(cb);
            }
        }
    };
    methodInterceptor();
    itemInterceptor(0, array.length);

    return array;
}
function unobserveArray(array)
{
    if (!is_function(array.onChange)) return array;

    delete array.$cb;
    delete array.onChange;

    ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(function(method) {
        array[method] = Array.prototype[method];
    });

    var values = array.slice();
    array.length = 0;
    array.push.apply(array, values);

    return array;
}
