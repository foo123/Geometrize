// ---- utilities -----
function is_almost_zero(x)
{
    return stdMath.abs(x) < Number.EPSILON;
}
function is_almost_equal(a, b)
{
    return is_almost_zero(a - b);
}
function deg(rad)
{
    return rad * 180 / PI;
}
function rad(deg)
{
    return deg * PI / 180;
}
function hypot(dx, dy)
{
    dx = stdMath.abs(dx);
    dy = stdMath.abs(dy)
    var r = 0;
    if (dy > dx)
    {
        r = dy/dx;
        return dx*stdMath.sqrt(1 + r*r);
    }
    else if (dx > dy)
    {
        r = dx/dy;
        return dy*stdMath.sqrt(1 + r*r);
    }
    return dx*sqrt2;
}
function dotp(x1, y1, x2, y2)
{
    return x1*x2 + y1*y2;
}
function crossp(x1, y1, x2, y2)
{
    return x1*y2 - y1*x2;
}
function angle(x1, y1, x2, y2)
{
    return stdMath.acos(dotp(x1 / hypot(x1, y1), y1, x2 / hypot(x2, y2), y2));
}
function sign(x)
{
    return 0 > x ? -1 : 1;
}
function dist(p1, p2)
{
    return hypot(p1.x - p2.x, p1.y - p2.y);
}
function dist2(p1, p2)
{
    var dx = p1.x - p2.x, dy = p1.y - p2.y;
    return dx*dx + dy*dy;
}
function polar_angle(p1, p2)
{
    var a = stdMath.atan2(p2.y - p1.y, p2.x - p1.x);
    return a < 0 ? a + TWO_PI : a;
}
function dir(p1, p2, p3)
{
    var dx1 = p1.x - p3.x, dx2 = p2.x - p3.x,
        dy1 = p1.y - p3.y, dy2 = p2.y - p3.y;
    return dx1*dy2 - dy1*dx2;
}
function p_eq(p1, p2)
{
    return is_almost_zero(p1.x - p2.x) && is_almost_zero(p1.y - p2.y);
}
function point_line_distance(p0, p1, p2)
{
    var x1 = p1.x, y1 = p1.y,
        x2 = p2.x, y2 = p2.y,
        x = p0.x, y = p0.y,
        dx = x2 - x1, dy = y2 - y1,
        d = hypot(dx, dy)
    ;
    if (is_almost_zero(d)) return hypot(x - x1, y - y1);
    return stdMath.abs(dx*(y1 - y) - dy*(x1 - x)) / d;
}
function point_line_segment_distance(p0, p1, p2)
{
    var x1 = p1.x, y1 = p1.y,
        x2 = p2.x, y2 = p2.y,
        x = p0.x, y = p0.y,
        t = 0, dx = x2 - x1, dy = y2 - y1,
        d = hypot(dx, dy)
    ;
    if (is_almost_zero(d)) return hypot(x - x1, y - y1);
    t = stdMath.max(0, stdMath.min(1, ((x - x1)*dx + (y - y1)*dy) / d));
    return hypot(x - x1 - t*dx, y - y1 - t*dy);
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
function lin_solve(a, b)
{
    return is_almost_zero(a) ? false : [-b / a];
}
function quad_solve(a, b, c)
{
    if (is_almost_zero(a)) return lin_solve(b, c);
    var D = b*b - 4*a*c;
    if (0 > D) return false;
    if (is_almost_zero(D)) return [-b / (2*a)];
    D = stdMath.sqrt(D);
    return [(-b-D) / (2*a), (-b+D) / (2*a)];
}
function line_line_intersection(a, b, c, k, l, m)
{
    /*
    https://live.sympy.org/
    ax+by+c=0
    kx+ly+m=0
    x,y={((b*m - c*l)/(a*l - b*k), -(a*m - c*k)/(a*l - b*k))}
    */
    var D = a*l - b*k;
    // zero, infinite or one point
    return is_almost_zero(D) ? false : {x:(b*m - c*l)/D, y:(c*k - a*m)/D};
}
function line_quadratic_intersection(m, n, k, a, b, c, d, e, f)
{
    /*
    https://live.sympy.org/
    mx+ny+k=0
    ax^2+by^2+cxy+dx+ey+f=0
    x,y,a,b,c,d,e,f,n,m,k = symbols('x y a b c d e f n m k', real=True)
    nonlinsolve([a*x**2+b*y**2+c*x*y+d*x+e*y+f, m*x+n*y+k], [x, y])
    x,y={(-(k + n*(-m*sqrt(-4*a*b*k**2 + 4*a*e*k*n - 4*a*f*n**2 + 4*b*d*k*m - 4*b*f*m**2 + c**2*k**2 - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d**2*n**2 - 2*d*e*m*n + e**2*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)) - (2*a*k*n - c*k*m - d*m*n + e*m**2)/(2*(a*n**2 + b*m**2 - c*m*n))))/m, -m*sqrt(-4*a*b*k**2 + 4*a*e*k*n - 4*a*f*n**2 + 4*b*d*k*m - 4*b*f*m**2 + c**2*k**2 - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d**2*n**2 - 2*d*e*m*n + e**2*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)) - (2*a*k*n - c*k*m - d*m*n + e*m**2)/(2*(a*n**2 + b*m**2 - c*m*n))), (-(k + n*(m*sqrt(-4*a*b*k**2 + 4*a*e*k*n - 4*a*f*n**2 + 4*b*d*k*m - 4*b*f*m**2 + c**2*k**2 - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d**2*n**2 - 2*d*e*m*n + e**2*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)) - (2*a*k*n - c*k*m - d*m*n + e*m**2)/(2*(a*n**2 + b*m**2 - c*m*n))))/m, m*sqrt(-4*a*b*k**2 + 4*a*e*k*n - 4*a*f*n**2 + 4*b*d*k*m - 4*b*f*m**2 + c**2*k**2 - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d**2*n**2 - 2*d*e*m*n + e**2*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)) - (2*a*k*n - c*k*m - d*m*n + e*m**2)/(2*(a*n**2 + b*m**2 - c*m*n)))}
    */
    var x, y, x1 = 0, y1 = 0, x2 = 0, y2 = 0, D = 0, R = 0, F = 0;
    if (is_almost_zero(m))
    {
        y = lin_solve(n, k);
        if (!y) return false;
        y1 = y[0];
        x = quad_solve(a, c*y1+d, b*y1*y1+e*y1+f);
        if (!x) return false;
        return 2 === x.length ? [{x:x[0],y:y1},{x:x[1],y:y1}] : [{x:x[0],y:y1}];
    }
    else
    {
        R = 2*(a*n*n + b*m*m - c*m*n);
        if (is_almost_zero(R)) return false;
        D = -4*a*b*k*k + 4*a*e*k*n - 4*a*f*n**2 + 4*b*d*k*m - 4*b*f*m*m + c*c*k*k - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d*d*n*n - 2*d*e*m*n + e*e*m*m;
        if (0 > D) return false;
        F = 2*a*k*n - c*k*m - d*m*n + e*m*m;
        if (is_almost_zero(D)) return [{x:-(k + n*(-F/R))/m, y:-F/R}];
        D = stdMath.sqrt(D);
        return [{x:-(k + n*((-m*D - F)/R))/m, y:(-m*D - F)/R},{x:-(k + n*((m*D - F)/R))/m, y:(m*D - F)/R}];
    }
}
function line_segments_intersection(p1, p2, p3, p4)
{
    var p = line_line_intersection(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        p4.y - p3.y, p3.x - p4.x, p4.x*p3.y - p3.x*p4.y
        );
    return p && point_between(p, p1, p2) && point_between(p, p3, p4) ? p : false;
}
function curve_lines_intersection(curve1_points, curve2_points)
{
    var i = [], j, k, p,
        n1 = curve1_points.length-1,
        n2 = curve2_points.length-1;
    for (j=0; j<n1; ++j)
    {
        for (k=0; k<n2; ++k)
        {
            p = line_segments_intersection(
                curve1_points[j], curve1_points[j+1],
                curve2_points[k], curve2_points[k+1]
            );
            if (p) i.push(p);
        }
    }
    return i.length ? i : false;
}
function point_on_curve(p, curve_points, get_point)
{
    get_point = get_point || identity;
    for (var i=0,n=curve_points.length-1; i<n; ++i)
    {
        if (point_between(p, get_point(curve_points[i]), get_point(curve_points[i+1])))
            return true;
    }
    return false;
}
function point_inside_curve(p, maxp, curve_points, get_point)
{
    get_point = get_point || identity;
    for (var p1,p2,i=0,intersects=0,n=curve_points.length-1; i<n; ++i)
    {
        p1 = get_point(curve_points[i]);
        p2 = get_point(curve_points[i+1]);
        if (point_between(p, p1, p2)) return 2;
        if (line_segments_intersection(p, maxp, p1, p2)) ++intersects;
    }
    return intersects & 1 ? 1 : 0;
}
function point_inside_rect(p, top, left, bottom, right)
{
    if (is_almost_equal(p.x, left) && p.y >= top && p.y <= bottom) return 2;
    if (is_almost_equal(p.x, right) && p.y >= top && p.y <= bottom) return 2;
    if (is_almost_equal(p.y, top) && p.x >= left && p.x <= right) return 2;
    if (is_almost_equal(p.y, bottom) && p.x >= left && p.x <= right) return 2;
    return p.x >= left && p.x <= right && p.y >= top && p.y <= bottom ? 1 : 0;
}
function point_inside_circle(p, center, radius)
{
    var dx = p.x - center.x,
        dy = p.y - center.y,
        d2 = dx*dx + dy*dy,
        r2 = radius*radius;
    if (is_almost_equal(d2, r2)) return 2;
    return d2 < r2 ? 1 : 0;
}
function point_inside_ellipse(p, center, radiusX, radiusY, sincos)
{
    var rX2 = radiusX*radiusX,
        rY2 = radiusY*radiusY,
        c = sincos[0],
        s = -sincos[1],
        dx0 = p.x - center.x,
        dy0 = p.y - center.y,
        dx = c*dx0 - s*dy0,
        dy = c*dy0 + s*dx0,
        d2 = dx*dx/rX2 + dy*dy/rY2
    ;
    if (is_almost_equal(d2, 1)) return 2;
    return d2 < 1 ? 1 : 0;
}
function line_circle_intersection(p1, p2, center, radius)
{
    var p = new Array(2), pi = 0, i, n,
        ir2 = 1/radius/radius,
        s = line_quadratic_intersection(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        ir2, ir2, 0, -2*center.x*ir2, -2*center.y*ir2, center.x*center.x*ir2+center.y*center.y*ir2-1
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (point_between(s[i], p1, p2))
            p[pi++] = s[i];
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_ellipse_intersection(p1, p2, center, radiusX, radiusY, angle, cossin)
{
    var p = new Array(2), pi = 0, i, n,
        x0 = center.x, y0 = center.y,
        a = radiusX, b = radiusY,
        cos_a = cossin[0], sin_a = cossin[1],
        A = a*a*sin_a*sin_a + b*b*cos_a*cos_a,
        C = a*a*cos_a*cos_a + b*b*sin_a*sin_a,
        B = 2*(b*b - a*a)*sin_a*cos_a,
        s = line_quadratic_intersection(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        A, C, B, -2*A*x0 - B*y0, -B*x0 - 2*C*y0, A*x0*x0 + B*x0*y0 + C*y0*y0 - a*a*b*b
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (point_between(s[i], p1, p2))
            p[pi++] = s[i];
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_bezier2_intersection(p1, p2, c)
{
    var p = new Array(2), pi = 0, i, n,
        M = p2.y - p1.y,
        N = p1.x - p2.x,
        K = p2.x*p1.y - p1.x*p2.y,
        A = c[0].y*c[0].y - 4*c[0].y*c[1].y + 2*c[0].y*c[2].y + 4*c[1].y*c[1].y - 4*c[1].y*c[2].y + c[2].y*c[2].y,
        B = c[0].x*c[0].x - 4*c[0].x*c[1].x + 2*c[0].x*c[2].x + 4*c[1].x*c[1].x - 4*c[1].x*c[2].x + c[2].x*c[2].x,
        C = -2*c[0].x*c[0].y + 4*c[0].x*c[1].y - 2*c[0].x*c[2].y + 4*c[1].x*c[0].y - 8*c[1].x*c[1].y + 4*c[1].x*c[2].y - 2*c[2].x*c[0].y + 4*c[2].x*c[1].y - 2*c[2].x*c[2].y,
        D = 2*c[0].x*c[0].y*c[2].y - 4*c[0].x*c[1].y*c[1].y + 4*c[0].x*c[1].y*c[2].y - 2*c[0].x*c[2].y*c[2].y + 4*c[1].x*c[0].y*c[1].y - 8*c[1].x*c[0].y*c[2].y + 4*c[1].x*c[1].y*c[2].y - 2*c[2].x*c[0].y*c[0].y + 4*c[2].x*c[0].y*c[1].y + 2*c[2].x*c[0].y*c[2].y - 4*c[2].x*c[1].y*c[1].y,
        E = -2*c[0].x*c[0].x*c[2].y + 4*c[0].x*c[1].x*c[1].y + 4*c[0].x*c[1].x*c[2].y + 2*c[0].x*c[2].x*c[0].y - 8*c[0].x*c[2].x*c[1].y + 2*c[0].x*c[2].x*c[2].y - 4*c[1].x*c[1].x*c[0].y - 4*c[1].x*c[1].x*c[2].y + 4*c[1].x*c[2].x*c[0].y + 4*c[1].x*c[2].x*c[1].y - 2*c[2].x*c[2].x*c[0].y,
        F = c[0].x*c[0].x*c[2].y*c[2].y - 4*c[0].x*c[1].x*c[1].y*c[2].y - 2*c[0].x*c[2].x*c[0].y*c[2].y + 4*c[0].x*c[2].x*c[1].y*c[1].y + 4*c[1].x*c[1].x*c[0].y*c[2].y - 4*c[1].x*c[2].x*c[0].y*c[1].y + c[2].x*c[2].x*c[0].y*c[0].y,
        s = line_quadratic_intersection(
        M, N, K,
        A, B, C, D, E, F
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (point_between(s[i], p1, p2))
            p[pi++] = s[i];
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_bezier3_intersection(p1, p2, c)
{
}
function circle_circle_intersection(c1, r1, c2, r2)
{
    if (r2 > r1)
    {
        var tmp = r1;
        r1 = r2;
        r2 = tmp;
        tmp = c1;
        c1 = c2;
        c2 = tmp;
    }
    var dx = c2.x - c1.x, dy = c2.y - c1.y, d = hypot(dx, dy);
    if (is_almost_zero(d) && is_almost_equal(r1, r2))
    {
        // same circles, they intersect at all points
        return false;
    }
    if (d > r1+r2 || d+r2 < r1)
    {
        // circle (c2,r2) is outside circle (c1,r1) and does not intersect
        // or
        // circle (c2,r2) is inside circle (c1,r1) and does not intersect
        return false;
    }
    // circles intersect at 1 or 2 points
    dx /= d; dy /= d;
    var a = (r1*r1 - r2*r2 + d*d) / (2 * d),
        px = c1.x + a*dx,
        py = c1.y + a*dy,
        h = stdMath.sqrt(r1*r1 - a*a)
    ;
    return is_almost_zero(h) ? [{x:px, y:py}] : [{x:px + h*dy, y:py - h*dx}, {x:px - h*dy, y:py + h*dx}];
}
function curve_ellipse_intersection(ellipse, curve_points)
{
}
function curve_length(curve_points)
{
    get_point = get_point || identity;
    for (var p1,p2,length=0,i=0,n=curve_points.length-1; i<n; ++i)
    {
        p1 = curve_points[i];
        p2 = curve_points[i+1];
        length += hypot(p1.x - p2.x, p1.y - p2.y);
    }
    return length;
}
function curve_area(curve_points)
{
    get_point = get_point || identity;
    for (var p1,p2,area=0,i=0,n=curve_points.length-1; i<n; ++i)
    {
        p1 = curve_points[i];
        p2 = curve_points[i+1];
        // shoelace formula
        area += crossp(p1.x, p1.y, p2.x, p2.y)/2;
    }
    return area;
}
function sample_curve(f, n, pixelSize, do_refine)
{
    if (null == n) n = 20;
    var i, t, h = 1/n, p, points = [];
    if (do_refine)
    {
        points.push(f(0));
        for (i=0,t=0; i<n; ++i,t+=h)
        {
            subdivide_curve(points, f, t, t+h, pixelSize);
        }
    }
    else
    {
        for (i=0,t=0; i<n; ++i,t+=h)
        {
            points.push(f(t));
        }
    }
    return points;
}
function subdivide_curve(points, f, l, r, pixelSize, pl, pr)
{
    var m = (l + r) / 2, left = pl || f(l), right = pr || f(r), middle = f(m);
    if (/*(0 >= depth) ||*/ (point_line_distance(middle, left, right) < pixelSize))
    {
        // no more refinement, return linear interpolation
        // simple line segment, include middle as well for better accuracy
        points.push(right);
    }
    else
    {
        // recursively subdivide to refine samples with high enough curvature
        subdivide_curve(f, l, m, pixelSize, left, middle);
        subdivide_curve(f, m, r, pixelSize, middle, right);
    }
    return points;
}
/*function bezier0(t, p)
{
    return p[0];
}*/
function bezier1(t, p)
{
    var b00 = p[0], b01 = p[1], i = 1-t;
    return {
        x: i*b00.x + t*b01.x,
        y: i*b00.y + t*b01.y
    };
}
function bezier2(t, p)
{
    return bezier1(t, [bezier1(t, [p[0], p[1]]), bezier1(t, [p[1], p[2]])]);
}
function bezier3(t, p)
{
    return bezier1(t, [bezier2(t, [p[0], p[1], p[2]]), bezier2(t, [p[1], p[2], p[3]])]);
}
function convex_hull(points)
{
    // https://en.wikipedia.org/wiki/Convex_hull
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
function is_convex(points)
{
    // https://stackoverflow.com/a/45372025/3591273
    var n = points.length;
    if (n < 3) return false;

    var old_x = points[n-2].x, old_y = points[n-2].y,
        new_x = points[n-1].x, new_y = points[n-1].y,
        old_direction = 0,
        new_direction = stdMath.atan2(new_y - old_y, new_x - old_x),
        angle_sum = 0, angle = 0, orientation = 0,
        newpoint = null
    ;
    for (ndx=0; ndx<n; ++ndx)
    {
        newpoint = points[ndx];
        old_x = new_x;
        old_y = new_y;
        old_direction = new_direction;
        new_x = newpoint.x;
        new_y = newpoint.y;
        new_direction = stdMath.atan2(new_y - old_y, new_x - old_x);
        angle = new_direction - old_direction;
        if (angle <= -PI)
        {
            angle += TWO_PI
        }
        else if (angle > PI)
        {
            angle -= TWO_PI
        }
        if (0 === ndx)
        {
            if (0 === angle) return false;
            orientation = 0 < angle ? 1 : -1;
        }
        else
        {
            if (orientation * angle <= 0) return false;
        }
        angle_sum += angle;
    }
    return 1 === stdMath.abs(stdMath.round(angle_sum / TWO_PI));
}
function ellipse_point(cx, cy, rx, ry, angle, theta, cs)
{
    var M = rx*stdMath.cos(theta), N = ry*stdMath.sin(theta);
    cs = cs || [stdMath.cos(angle), stdMath.sin(angle)];
    return {
        x: cx + cs[0]*M - cs[1]*N,
        y: cy + cs[1]*M + cs[0]*N
    };
}
function ellipse_center(x1, y1, x2, y2, fa, fs, rx, ry, angle, cs)
{
    cs = cs || [stdMath.cos(angle), stdMath.sin(angle)];

    // Step 1: simplify through translation/rotation
    var x =  cs[0]*(x1 - x2)/2 + cs[1]*(y1 - y2)/2,
        y = -cs[1]*(x1 - x2)/2 + cs[0]*(y1 - y2)/2,
        px = x*x, py = y^y, prx = rx*rx, pry = ry*ry,
        // correct out-of-range radii
        L = px/prx + py/pry;

    if (L > 1)
    {
        rx = stdMath.sqrt(L)*stdMath.abs(rx);
        ry = stdMath.sqrt(L)*stdMath.abs(ry);
    }
    else
    {
        rx = stdMath.abs(rx);
        ry = stdMath.abs(ry);
    }

    // Step 2 + 3: compute center
    var sign = fa === fs ? -1 : 1,
        M = stdMath.sqrt((prx*pry - prx*py - pry*px)/(prx*py + pry*px))*sign,
        _cx = M*(rx*y)/ry,
        _cy = M*(-ry*x)/rx,

        cx = cs[0]*_cx - cs[1]*_cy + (x1 + x2)/2,
        cy = cs[1]*_cx + cs[0]*_cy + (y1 + y2)/2
    ;

    // Step 4: compute θ and dθ
    var theta = vector_angle(1, 0, (x - _cx)/rx, (y - _cy)/ry);

    var _dTheta = deg(vector_angle(
        (x - _cx)/rx, (y - _cy)/ry,
        (-x - _cx)/rx, (-y - _cy)/ry
    )) % 360;

    if (fs === 0 && _dTheta > 0) _dTheta -= 360;
    if (fs === 1 && _dTheta < 0) _dTheta += 360;

    return [cx, cy, theta, rad(_dTheta)];
}
function vector_angle(ux, uy, vx, vy)
{
    var sign = ux*vy - uy*vx < 0 ? -1 : 1,
        ua = stdMath.sqrt(ux*ux + uy*uy),
        va = stdMath.sqrt(vx*vx + vy*vy),
        dot = ux*vx + uy*vy;
    return sign*stdMath.acos(dot/(ua*va));
}

// ----------------------
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
    var setAnyway = false;
    atts = atts || EMPTY_OBJ;
    if (false === svg)
    {
        svg = '<'+tag+' '+Object.keys(atts).reduce(function(s, a) {
            return s + a+'="'+Str(atts[a][0])+'" ';
        }, '')+'/>';
        if (g)
        {
            svg = '<g '+Object.keys(ga||EMPTY_OBJ).reduce(function(s, a) {
                return s + a+'="'+Str(ga[a][0])+'" ';
            }, '')+'>'+svg+'</g>';
        }
    }
    else
    {
        if (!svg)
        {
            setAnyway = true;
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
            svg = g.firstChild || g;
        }
        Object.keys(atts).forEach(function(a) {
            if (setAnyway || atts[a][1]) svg.setAttribute(a, atts[a][0]);
        });
        if (g && ga)
        {
            Object.keys(ga).forEach(function(a) {
                if (setAnyway || ga[a][1]) g.setAttribute(a, ga[a][0]);
            });
        }
    }
    return svg;
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

    equals = equals || equal;

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
            var key = Str(index), val = array[index];
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
function identity(x)
{
    return x;
}
function equal(a, b)
{
    return a === b;
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
var cnt = 0, Str = String;
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
