
// ---- utilities -----
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
    return is_almost_equal(p1.x, p2.x) && is_almost_equal(p1.y, p2.y);
}
function point_line_distance(p0, p1, p2)
{
    var x1 = p1.x, y1 = p1.y,
        x2 = p2.x, y2 = p2.y,
        x = p0.x, y = p0.y,
        dx = x2 - x1, dy = y2 - y1,
        d = hypot(dx, dy)
    ;
    if (is_strictly_equal(d, 0)) return hypot(x - x1, y - y1);
    return abs(dx*(y1 - y) - dy*(x1 - x)) / d;
}
function point_line_segment_distance(p0, p1, p2)
{
    var x1 = p1.x, y1 = p1.y,
        x2 = p2.x, y2 = p2.y,
        x = p0.x, y = p0.y,
        t = 0, dx = x2 - x1, dy = y2 - y1,
        d = hypot(dx, dy)
    ;
    if (is_strictly_equal(d, 0)) return hypot(x - x1, y - y1);
    t = stdMath.max(0, stdMath.min(1, ((x - x1)*dx + (y - y1)*dy) / d));
    return hypot(x - x1 - t*dx, y - y1 - t*dy);
}
function point_on_line_segment(p, p1, p2)
{
    var t = 0,
        dxp = p.x - p1.x,
        dx = p2.x - p1.x,
        dyp = p.y - p1.y,
        dy = p2.y - p1.y
    ;
    if (is_almost_equal(dyp*dx, dy*dxp))
    {
        // colinear and inside line segment of p1-p2
        t = is_strictly_equal(dx, 0) ? dyp/dy : dxp/dx;
        return (t >= 0) && (t <= 1);
    }
    return false;
}
function point_on_arc(p, center, radiusX, radiusY, cs, theta, dtheta)
{
    var x0 = p.x - center.x,
        y0 = p.y - center.y,
        x = cs[0]*x0 + cs[1]*y0,
        y = -cs[1]*x0 + cs[0]*y0,
        t = stdMath.atan2(y/radiusY, x/radiusX);
    if (t < 0) t += TWO_PI;
    t = (t - theta)/dtheta;
    return (t >= 0) && (t <= 1);
}
function point_on_qbezier(p, c)
{
    //x = t^{2} \left(x_{1} - 2 x_{2} + x_{3}\right) + t \left(- 2 x_{1} + 2 x_{2}\right) + x_{1}
    var tx, ty;
    tx = solve_quadratic(c[0].x - 2*c[1].x + c[2].x, -2*c[0].x + 2*c[1].x, c[0].x - p.x);
    if (!tx) return false;
    if (1 < tx.length && (0 > tx[1] || 1 < tx[1])) tx.pop();
    if (tx.length && (0 > tx[0] || 1 < tx[0])) tx.shift();
    if (!tx.length) return false;
    ty = solve_quadratic(c[0].y - 2*c[1].y + c[2].y, -2*c[0].y + 2*c[1].y, c[0].y - p.y);
    if (!ty) return false;
    if (1 < ty.length && (0 > ty[1] || 1 < ty[1])) ty.pop();
    if (ty.length && (0 > ty[0] || 1 < ty[0])) ty.shift();
    if (!ty.length) return false;
    if (1 < tx.length && 1 < ty.length)
    {
        return (is_almost_equal(tx[0], ty[0]) && is_almost_equal(tx[1], ty[1])) || (is_almost_equal(tx[0], ty[1]) && is_almost_equal(tx[1], ty[0]));
    }
    else if (1 < tx.length && 1 === ty.length)
    {
        return is_almost_equal(tx[0], ty[0]) || is_almost_equal(tx[1], ty[0]);
    }
    else if (1 < ty.length && 1 === tx.length)
    {
        return is_almost_equal(ty[0], tx[0]) || is_almost_equal(ty[1], tx[0]);
    }
    return is_almost_equal(tx[0], ty[0]);
}
function point_on_cbezier(p, c)
{
    // x = t^{3} \left(- x_{1} + 3 x_{2} - 3 x_{3} + x_{4}\right) + t^{2} \cdot \left(3 x_{1} - 6 x_{2} + 3 x_{3}\right) + t \left(- 3 x_{1} + 3 x_{2}\right) + x_{1}
    var tx, ty;
    tx = solve_cubic(-c[0].x + 3*c[1].x - 3*c[2].x + c[3].x, 3*c[0].x - 6*c[1].x + 3*c[2].x, -3*c[0].x + 3*c[1].x, c[0].x - p.x);
    if (!tx) return false;
    if (2 < tx.length && (0 > tx[2] || 1 < tx[2])) tx.pop();
    if (1 < tx.length && (0 > tx[1] || 1 < tx[1])) tx.splice(1, 1);
    if (tx.length && (0 > tx[0] || 1 < tx[0])) tx.shift();
    if (!tx.length) return false;
    ty = solve_cubic(-c[0].y + 3*c[1].y - 3*c[2].y + c[3].y, 3*c[0].y - 6*c[1].y + 3*c[2].y, -3*c[0].y + 3*c[1].y, c[0].y - p.y);
    if (!ty) return false;
    if (2 < ty.length && (0 > ty[2] || 1 < ty[2])) ty.pop();
    if (1 < ty.length && (0 > ty[1] || 1 < ty[1])) ty.splice(1, 1);
    if (ty.length && (0 > ty[0] || 1 < ty[0])) ty.shift();
    if (!ty.length) return false;
    if (2 < tx.length && 2 < ty.length)
    {
        return (
            is_almost_equal(tx[0], ty[0]) && (
            (is_almost_equal(tx[1], ty[1]) && is_almost_equal(tx[2], ty[2])) ||
            (is_almost_equal(tx[1], ty[2]) && is_almost_equal(tx[2], ty[1]))
            )
        ) || (
            is_almost_equal(tx[1], ty[1]) &&
            is_almost_equal(tx[0], ty[2]) &&
            is_almost_equal(tx[2], ty[0])
        ) || (
            is_almost_equal(tx[2], ty[2]) &&
            is_almost_equal(tx[0], ty[1]) &&
            is_almost_equal(tx[1], ty[0])
        ) || (
            is_almost_equal(tx[0], ty[1]) &&
            is_almost_equal(tx[1], ty[2]) &&
            is_almost_equal(tx[2], ty[0])
        ) || (
            is_almost_equal(tx[0], ty[2]) &&
            is_almost_equal(tx[1], ty[0]) &&
            is_almost_equal(tx[2], ty[1])
        );
    }
    else if (2 < tx.length && 1 < ty.length)
    {
        return (
            is_almost_equal(tx[0], ty[0]) && (
            is_almost_equal(tx[1], ty[1]) ||
            is_almost_equal(tx[2], ty[1])
            )
        ) || (
            is_almost_equal(tx[1], ty[1]) && (
            is_almost_equal(tx[0], ty[0]) ||
            is_almost_equal(tx[2], ty[0])
            )
        ) || (
            is_almost_equal(tx[2], ty[0]) && (
            is_almost_equal(tx[1], ty[1]) ||
            is_almost_equal(tx[0], ty[1])
            )
        ) || (
            is_almost_equal(tx[1], ty[0]) && (
            is_almost_equal(tx[2], ty[1]) ||
            is_almost_equal(tx[0], ty[1])
            )
        );
    }
    else if (1 < tx.length && 2 < ty.length)
    {
        return (
            is_almost_equal(ty[0], tx[0]) && (
            is_almost_equal(ty[1], tx[1]) ||
            is_almost_equal(ty[2], tx[1])
            )
        ) || (
            is_almost_equal(ty[1], tx[1]) && (
            is_almost_equal(ty[0], tx[0]) ||
            is_almost_equal(ty[2], tx[0])
            )
        ) || (
            is_almost_equal(ty[2], tx[0]) && (
            is_almost_equal(ty[1], tx[1]) ||
            is_almost_equal(ty[0], tx[1])
            )
        ) || (
            is_almost_equal(ty[1], tx[0]) && (
            is_almost_equal(ty[2], tx[1]) ||
            is_almost_equal(ty[0], tx[1])
            )
        );
    }
    else if (2 < tx.length && 1 === ty.length)
    {
        return is_almost_equal(tx[0], ty[0]) || is_almost_equal(tx[1], ty[0]) || is_almost_equal(tx[2], ty[0]);
    }
    else if (2 < ty.length && 1 === tx.length)
    {
        return is_almost_equal(ty[0], tx[0]) || is_almost_equal(ty[1], tx[0]) || is_almost_equal(ty[2], tx[0]);
    }
    else if (1 < tx.length && 1 === ty.length)
    {
        return is_almost_equal(tx[0], ty[0]) || is_almost_equal(tx[1], ty[0]);
    }
    else if (1 < ty.length && 1 === tx.length)
    {
        return is_almost_equal(ty[0], tx[0]) || is_almost_equal(ty[1], tx[0]);
    }
    return is_almost_equal(tx[0], ty[0]);
}
function point_inside_rect(p, xmin, ymin, xmax, ymax)
{
    if (is_almost_equal(p.x, xmin) && p.y >= ymin && p.y <= ymax) return 2;
    if (is_almost_equal(p.x, xmax) && p.y >= ymin && p.y <= ymax) return 2;
    if (is_almost_equal(p.y, ymin) && p.x >= xmin && p.x <= xmax) return 2;
    if (is_almost_equal(p.y, ymax) && p.x >= xmin && p.x <= xmax) return 2;
    return p.x >= xmin && p.x <= xmax && p.y >= ymin && p.y <= ymax ? 1 : 0;
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
function point_inside_ellipse(p, center, radiusX, radiusY, cs)
{
    var rX2 = radiusX*radiusX,
        rY2 = radiusY*radiusY,
        cos = cs[0], sin = cs[1],
        dx0 = p.x - center.x,
        dy0 = p.y - center.y,
        dx = cos*dx0 - sin*dy0,
        dy = cos*dy0 + sin*dx0,
        d2 = dx*dx/rX2 + dy*dy/rY2
    ;
    if (is_almost_equal(d2, 1)) return 2;
    return d2 < 1 ? 1 : 0;
}
function point_on_polyline(p, polyline_points)
{
    for (var i=0,n=polyline_points.length-1; i<n; ++i)
    {
        if (point_on_line_segment(p, polyline_points[i], polyline_points[i+1]))
            return true;
    }
    return false;
}
function point_inside_polyline(p, maxp, polyline_points)
{
    for (var p1,p2,i=0,intersects=0,n=polyline_points.length-1; i<n; ++i)
    {
        p1 = polyline_points[i];
        p2 = polyline_points[i+1];
        if (point_on_line_segment(p, p1, p2)) return 2;
        if (line_segments_intersection(p, maxp, p1, p2)) ++intersects;
    }
    return intersects & 1 ? 1 : 0;
}
function line_segments_intersection(p1, p2, p3, p4)
{
    var p = solve_linear_linear_system(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        p4.y - p3.y, p3.x - p4.x, p4.x*p3.y - p3.x*p4.y
        );
    return p && point_on_line_segment(p, p1, p2) && point_on_line_segment(p, p3, p4) ? p : false;
}
function line_circle_intersection(p1, p2, abcdef)
{
    if (3 < arguments.length) abcdef = circle2quadratic(abcdef, arguments[3]);
    var p = new Array(2), pi = 0, i, n,
        s = solve_linear_quadratic_system(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        abcdef[0], abcdef[1], abcdef[2], abcdef[3], abcdef[4], abcdef[5]
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (point_on_line_segment(s[i], p1, p2))
            p[pi++] = s[i];
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_ellipse_intersection(p1, p2, abcdef)
{
    if (5 < arguments.length) abcdef = ellipse2quadratic(abcdef, arguments[3], arguments[4], arguments[5]);
    var p = new Array(2), pi = 0, i, n,
        s = solve_linear_quadratic_system(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        abcdef[0], abcdef[1], abcdef[2], abcdef[3], abcdef[4], abcdef[5]
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (point_on_line_segment(s[i], p1, p2))
            p[pi++] = s[i];
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_arc_intersection(p1, p2, abcdef, c, rX, rY, cs, t, d)
{
    if (null == abcdef) abcdef = ellipse2quadratic(c, rX, rY, cs);
    var p = new Array(2), pi = 0, i, n,
        x, y, x0, y0, t,
        s = solve_linear_quadratic_system(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        abcdef[0], abcdef[1], abcdef[2], abcdef[3], abcdef[4], abcdef[5]
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (point_on_line_segment(s[i], p1, p2) && point_on_arc(s[i], c, rX, rY, cs, t, d))
        {
            p[pi++] = s[i];
        }
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_qbezier_intersection(p1, p2, abcdef, c)
{
    if (null == abcdef) abcdef = qbezier2quadratic(c);
    var p = new Array(2), pi = 0, i, n,
        s = solve_linear_quadratic_system(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        abcdef[0], abcdef[1], abcdef[2], abcdef[3], abcdef[4], abcdef[5]
        );
    if (!s) return false;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (point_on_line_segment(s[i], p1, p2) && point_on_qbezier(s[i], c))
            p[pi++] = s[i];
    }
    p.length = pi;
    return p.length ? p : false;
}
function line_cbezier_intersection(p1, p2, coeff, c)
{
    if (null == coeff) coeff = cbezier2cubic(c);
    var p = new Array(3), pi = 0, i, n,
        A = p2.y - p1.y,
        B = p1.x - p2.x,
        C = p1.x*(p1.y - p2.y) + p1.y*(p2.x - p1.x),
        s = solve_cubic(
            A*coeff[0].x + B*coeff[0].y,
            A*coeff[1].x + B*coeff[1].y,
            A*coeff[2].x + B*coeff[2].y,
            A*coeff[3].x + B*coeff[3].y + C
        ), pt;
    for (i=0,n=s.length; i<n; ++i)
    {
        if (0 > s[i] || 1 < s[i]) continue;
        pt = bezier3(s[i], c);
        if (point_on_line_segment(pt, p1, p2)/* && point_on_cbezier(pt, c)*/)
            p[pi++] = pt;
    }
    p.length = pi;
    return p.length ? p : false;
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
    if (is_almost_equal(d, 0) && is_almost_equal(r1, r2))
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
        h = sqrt(r1*r1 - a*a)
    ;
    return is_strictly_equal(h, 0) ? [{x:px, y:py}] : [{x:px + h*dy, y:py - h*dx}, {x:px - h*dy, y:py + h*dx}];
}
function polyline_line_intersection(polyline_points, p1, p2)
{
    var i = [], j, p, n = polyline_points.length-1;
    for (j=0; j<n; ++j)
    {
        p = line_segments_intersection(
            polyline_points[j], polyline_points[j+1],
            p1, p2
        );
        if (p) i.push(p);
    }
    return i.length ? i : false;
}
function polyline_circle_intersection(polyline_points, center, radius)
{
    var i = [], j, k, p, n = polyline_points.length-1,
        abcdef = circle2quadratic(center, radius);
    for (j=0; j<n; ++j)
    {
        p = line_circle_intersection(polyline_points[j], polyline_points[j+1], abcdef);
        if (p) i.push.apply(i, p);
    }
    return i.length ? i : false;
}
function polyline_ellipse_intersection(polyline_points, center, radiusX, radiusY, cs)
{
    var i = [], j, k, p, n = polyline_points.length-1,
        abcdef = ellipse2quadratic(center, radiusX, radiusY, cs);
    for (j=0; j<n; ++j)
    {
        p = line_ellipse_intersection(polyline_points[j], polyline_points[j+1], abcdef);
        if (p) i.push.apply(i, p);
    }
    return i.length ? i : false;
}
function polyline_arc_intersection(polyline_points, center, radiusX, radiusY, cs, theta, dtheta)
{
    var i = [], j, k, p, n = polyline_points.length-1,
        abcdef = ellipse2quadratic(center, radiusX, radiusY, cs);
    for (j=0; j<n; ++j)
    {
        p = line_arc_intersection(polyline_points[j], polyline_points[j+1], abcdef, center, radiusX, radiusY, cs, theta, dtheta);
        if (p) i.push.apply(i, p);
    }
    return i.length ? i : false;
}
function polyline_qbezier_intersection(polyline_points, control_points)
{
    var i = [], j, k, p, n = polyline_points.length-1,
        abcdef = qbezier2quadratic(control_points);
    for (j=0; j<n; ++j)
    {
        p = line_qbezier_intersection(polyline_points[j], polyline_points[j+1], abcdef, control_points);
        if (p) i.push.apply(i, p);
    }
    return i.length ? i : false;
}
function polyline_cbezier_intersection(polyline_points, control_points)
{
    var i = [], j, k, p, n = polyline_points.length-1,
        coeff = cbezier2cubic(control_points);
    for (j=0; j<n; ++j)
    {
        p = line_cbezier_intersection(polyline_points[j], polyline_points[j+1], coeff, control_points);
        if (p) i.push.apply(i, p);
    }
    return i.length ? i : false;
}
function polyline_polyline_intersection(polyline1_points, polyline2_points)
{
    var i = [], j, k, p,
        n1 = polyline1_points.length-1,
        n2 = polyline2_points.length-1;
    for (j=0; j<n1; ++j)
    {
        for (k=0; k<n2; ++k)
        {
            p = line_segments_intersection(
                polyline1_points[j], polyline1_points[j+1],
                polyline2_points[k], polyline2_points[k+1]
            );
            if (p) i.push(p);
        }
    }
    return i.length ? i : false;
}
function polyline_length(polyline_points)
{
    for (var p1,p2,length=0,i=0,n=polyline_points.length-1; i<n; ++i)
    {
        p1 = polyline_points[i];
        p2 = polyline_points[i+1];
        length += hypot(p1.x - p2.x, p1.y - p2.y);
    }
    return length;
}
function polyline_area(polyline_points)
{
    for (var p1,p2,area=0,i=0,n=polyline_points.length-1; i<n; ++i)
    {
        p1 = polyline_points[i];
        p2 = polyline_points[i+1];
        // shoelace formula
        area += crossp(p1.x, p1.y, p2.x, p2.y)/2;
    }
    return area;
}
function convex_hull(points)
{
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
    if (!hl || 3 > hl) return false;

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
    if ( 3 > n) return false;

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
    return 1 === abs(stdMath.round(angle_sum / TWO_PI));
}
function solve_linear(a, b)
{
    return is_strictly_equal(a, 0) ? false : [-b/a];
}
function solve_quadratic(a, b, c)
{
    if (is_strictly_equal(a, 0)) return solve_linear(b, c);
    var D = b*b - 4*a*c, DS = 0;
    if (is_almost_equal(D, 0)) return [-b/(2*a)];
    if (0 > D) return false;
    DS = sqrt(D);
    return [(-b-DS)/(2*a), (-b+DS)/(2*a)];
}
function solve_cubic(a, b, c, d)
{
    if (is_strictly_equal(a, 0)) return solve_quadratic(b, c, d);
    var A = b/a, B = c/a, C = d/a,
        Q = (3*B - A*A)/9, QS = 0,
        R = (9*A*B - 27*C - 2*pow(A, 3))/54,
        D = pow(Q, 3) + pow(R, 2), DS = 0,
        S = 0, T = 0, Im = 0, th = 0
    ;
    if (D >= 0)
    {
        // complex or duplicate roots
        DS = sqrt(D);
        S = sign(R + DS)*pow(abs(R + DS), 1/3);
        T = sign(R - DS)*pow(abs(R - DS), 1/3);
        Im = abs(sqrt3*(S - T)/2); // imaginary part
        return is_almost_equal(Im, 0) ? [
        -A/3 + (S + T),
        -A/3 - (S + T)/2
        ] : [
        -A/3 + (S + T)
        ];
    }
    else
    {
        // distinct real roots
        th = stdMath.acos(R/sqrt(-pow(Q, 3)));
        QS = 2*sqrt(-Q);
        return [
        QS*stdMath.cos(th/3) - A/3,
        QS*stdMath.cos((th + TWO_PI)/3) - A/3,
        QS*stdMath.cos((th + 2*TWO_PI)/3) - A/3
        ];
    }
}
function solve_linear_linear_system(a, b, c, k, l, m)
{
    /*
    https://live.sympy.org/
    ax+by+c=0
    kx+ly+m=0
    x,y={((b*m - c*l)/(a*l - b*k), -(a*m - c*k)/(a*l - b*k))}
    */
    var D = a*l - b*k;
    // zero, infinite or one point
    return is_strictly_equal(D, 0) ? false : {x:(b*m - c*l)/D, y:(c*k - a*m)/D};
}
function solve_linear_quadratic_system(m, n, k, a, b, c, d, e, f)
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
    if (is_strictly_equal(m, 0))
    {
        y = solve_linear(n, k);
        if (!y) return false;
        y1 = y[0];
        x = solve_quadratic(a, c*y1+d, b*y1*y1+e*y1+f);
        if (!x) return false;
        return 2 === x.length ? [{x:x[0],y:y1},{x:x[1],y:y1}] : [{x:x[0],y:y1}];
    }
    else
    {
        R = 2*(a*n*n + b*m*m - c*m*n);
        if (is_strictly_equal(R, 0)) return false;
        D = -4*a*b*k*k + 4*a*e*k*n - 4*a*f*n*n + 4*b*d*k*m - 4*b*f*m*m + c*c*k*k - 2*c*d*k*n - 2*c*e*k*m + 4*c*f*m*n + d*d*n*n - 2*d*e*m*n + e*e*m*m;
        if (0 > D) return false;
        F = 2*a*k*n - c*k*m - d*m*n + e*m*m;
        if (is_strictly_equal(D, 0)) return [{x:-(k + n*(-F/R))/m, y:-F/R}];
        D = sqrt(D);
        return [{x:-(k + n*((-m*D - F)/R))/m, y:(-m*D - F)/R},{x:-(k + n*((m*D - F)/R))/m, y:(m*D - F)/R}];
    }
}
function line2linear(p1, p2)
{
    return [p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y];
}
function circle2quadratic(center, radius)
{
    var x0 = center.x, y0 = center.y;
    return [1, 1, 0, -2*x0, -2*y0, x0*x0 + y0*y0 - radius*radius];
}
function ellipse2quadratic(center, radiusX, radiusY, cs)
{
    //cs = cs || [stdMath.cos(angle), stdMath.sin(angle)];
    var x0 = center.x, y0 = center.y,
        a = radiusX, b = radiusY,
        cos_a = cs[0], sin_a = cs[1],
        A = a*a*sin_a*sin_a + b*b*cos_a*cos_a,
        C = a*a*cos_a*cos_a + b*b*sin_a*sin_a,
        B = 2*(b*b - a*a)*sin_a*cos_a;
    return [A, C, B, -2*A*x0 - B*y0, -B*x0 - 2*C*y0, A*x0*x0 + B*x0*y0 + C*y0*y0 - a*a*b*b];
}
function qbezier2quadratic(c)
{
    var A = c[0].y*c[0].y - 4*c[0].y*c[1].y + 2*c[0].y*c[2].y + 4*c[1].y*c[1].y - 4*c[1].y*c[2].y + c[2].y*c[2].y,
    B = c[0].x*c[0].x - 4*c[0].x*c[1].x + 2*c[0].x*c[2].x + 4*c[1].x*c[1].x - 4*c[1].x*c[2].x + c[2].x*c[2].x,
    C = -2*c[0].x*c[0].y + 4*c[0].x*c[1].y - 2*c[0].x*c[2].y + 4*c[1].x*c[0].y - 8*c[1].x*c[1].y + 4*c[1].x*c[2].y - 2*c[2].x*c[0].y + 4*c[2].x*c[1].y - 2*c[2].x*c[2].y,
    D = 2*c[0].x*c[0].y*c[2].y - 4*c[0].x*c[1].y*c[1].y + 4*c[0].x*c[1].y*c[2].y - 2*c[0].x*c[2].y*c[2].y + 4*c[1].x*c[0].y*c[1].y - 8*c[1].x*c[0].y*c[2].y + 4*c[1].x*c[1].y*c[2].y - 2*c[2].x*c[0].y*c[0].y + 4*c[2].x*c[0].y*c[1].y + 2*c[2].x*c[0].y*c[2].y - 4*c[2].x*c[1].y*c[1].y,
    E = -2*c[0].x*c[0].x*c[2].y + 4*c[0].x*c[1].x*c[1].y + 4*c[0].x*c[1].x*c[2].y + 2*c[0].x*c[2].x*c[0].y - 8*c[0].x*c[2].x*c[1].y + 2*c[0].x*c[2].x*c[2].y - 4*c[1].x*c[1].x*c[0].y - 4*c[1].x*c[1].x*c[2].y + 4*c[1].x*c[2].x*c[0].y + 4*c[1].x*c[2].x*c[1].y - 2*c[2].x*c[2].x*c[0].y,
    F = c[0].x*c[0].x*c[2].y*c[2].y - 4*c[0].x*c[1].x*c[1].y*c[2].y - 2*c[0].x*c[2].x*c[0].y*c[2].y + 4*c[0].x*c[2].x*c[1].y*c[1].y + 4*c[1].x*c[1].x*c[0].y*c[2].y - 4*c[1].x*c[2].x*c[0].y*c[1].y + c[2].x*c[2].x*c[0].y*c[0].y;
    return [A, B, C, D, E, F];
}
function cbezier2cubic(c)
{
    return [
        {
        x: -c[0].x + 3*c[1].x - 3*c[2].x + c[3].x,
        y: -c[0].y + 3*c[1].y - 3*c[2].y + c[3].y
        },
        {
        x: 3*c[0].x - 6*c[1].x + 3*c[2].x,
        y: 3*c[0].y - 6*c[1].y + 3*c[2].y
        },
        {
        x: -3*c[0].x + 3*c[1].x,
        y: -3*c[0].y + 3*c[1].y
        },
        {
        x: c[0].x,
        y: c[0].y
        }
    ];
}
function sample_curve(f, n, pixelSize, do_refine)
{
    if (null == n) n = NUM_POINTS;
    if (null == pixelSize) pixelSize = PIXEL_SIZE;
    var i, points = [];
    if (do_refine)
    {
        points.push(f(0));
        for (i=0; i<n; ++i)
        {
            subdivide_curve(points, f, 0 === i ? 0 : i/n, n === i+1 ? 1 : (i+1)/n, pixelSize);
        }
    }
    else
    {
        for (i=0; i<=n; ++i)
        {
            points.push(f(0 === i ? 0 : (n === i ? 1 : i/n)));
        }
    }
    return points;
}
function subdivide_curve(points, f, l, r, pixelSize, pl, pr)
{
    if ((l >= r) || is_almost_equal(l, r)) return;
    var m = (l + r) / 2, left = pl || f(l), right = pr || f(r), middle = f(m);
    if (point_line_distance(middle, left, right) <= pixelSize)
    {
        // no more refinement
        // return linear interpolation between left and right
        points.push(right);
    }
    else
    {
        // recursively subdivide to refine samples with high enough curvature
        subdivide_curve(points, f, l, m, pixelSize, left, middle);
        subdivide_curve(points, f, m, r, pixelSize, middle, right);
    }
}
function interpolate(x0, x1, t)
{
    // 0 <= t <= 1
    var t0 = (t||0), t1 = 1 - t0;
    return t1*x0 + t0*x1;
}
function bezier(c)
{
    // 1D bezier interpolation curve
    var order = c.length - 1,
        c0 = c[0] || 0,
        c1 = (0 < order ? c[1] : c0) || 0,
        c2 = (1 < order ? c[2] : c1) || 0,
        c3 = (2 < order ? c[3] : c2) || 0
    ;
    // 0 <= t <= 1
    return (function(c0, c1, c2, c3) {
        return 3 <= order ? function(t) {
            // only up to cubic
           var t0 = t, t1 = 1 - t, t0t0 = t0*t0, t1t1 = t1*t1;
           return t1*t1t1*c0 + 3*t1t1*t0*c1 + 3*t1*t0t0*c2 + t0t0*t0*c3;
        } : (2 === order ? function(t) {
            // quadratic
           var t0 = t, t1 = 1 - t;
           return t1*t1*c0 + 2*t1*t0*c1 + t0*t0*c2;
        } : (1 === order ? function(t) {
            // linear
            return (1 - t)*c0 + t*c1;
        } : function(t) {
            // point
            return c0;
        }));
    })(c0, c1, c2, c3);
}
/*function bezier0(t, p)
{
    // 0 <= t <= 1
    return p[0];
}*/
function bezier1(t, p)
{
    // 0 <= t <= 1
    var t0 = t, t1 = 1 - t;
    return {
        x: t1*p[0].x + t0*p[1].x,
        y: t1*p[0].y + t0*p[1].y
    };
}
function bezier2(t, p)
{
    // 0 <= t <= 1
    //return bezier1(t, [bezier1(t, [p[0], p[1]]), bezier1(t, [p[1], p[2]])]);
   var t0 = t, t1 = 1 - t, t11 = t1*t1, t10 = 2*t1*t0, t00 = t0*t0;
   return {
       x: t11*p[0].x + t10*p[1].x + t00*p[2].x,
       y: t11*p[0].y + t10*p[1].y + t00*p[2].y
   };
}
function bezier3(t, p)
{
    // 0 <= t <= 1
    //return bezier1(t, [bezier2(t, [p[0], p[1], p[2]]), bezier2(t, [p[1], p[2], p[3]])]);
    var t0 = t, t1 = 1 - t,
        t0t0 = t0*t0, t1t1 = t1*t1,
        t111 = t1*t1t1, t000 = t0t0*t0,
        t110 = 3*t1t1*t0, t100 = 3*t1*t0t0;
   return {
       x: t111*p[0].x + t110*p[1].x + t100*p[2].x + t000*p[3].x,
       y: t111*p[0].y + t110*p[1].y + t100*p[2].y + t000*p[3].y
   };
}
function arc(t, cx, cy, rx, ry, cos, sin)
{
    // t is angle in radians around arc
    if (null == cos)
    {
        cos = 1;
        sin = 0;
    }
    if (null == ry) ry = rx;
    var x = rx*stdMath.cos(t), y = ry*stdMath.sin(t);
    return {
        x: cx + cos*x - sin*y,
        y: cy + sin*x + cos*y
    };
}
function toarc(x, y, cx, cy, rx, ry, cos, sin)
{
    // x, y is point on unit circle arc
    if (null == cos)
    {
        cos = 1;
        sin = 0;
    }
    if (null == ry) ry = rx;
    x *= rx;
    y *= ry;
    return {
        x: cx + cos*x - sin*y,
        y: cy + sin*x + cos*y
    };
}
function arc2bezier(theta, dtheta, cx, cy, rx, ry, cos, sin, reverse)
{
    if (null == cos)
    {
        cos = 1;
        sin = 0;
    }
    if (null == ry) ry = rx;
    var f = is_almost_equal(2*abs(dtheta), PI)
        ? sign(dtheta)*0.551915024494/*0.55228*/
        : stdMath.tan(dtheta/4)*4/3,
        x1 = stdMath.cos(theta),
        y1 = stdMath.sin(theta),
        x2 = stdMath.cos(theta + dtheta),
        y2 = stdMath.sin(theta + dtheta)
    ;
    return reverse ? [
    toarc(x2, y2, cx, cy, rx, ry, cos, sin),
    toarc(x2 + y2*f, y2 - x2*f, cx, cy, rx, ry, cos, sin),
    toarc(x1 - y1*f, y1 + x1*f, cx, cy, rx, ry, cos, sin),
    toarc(x1, y1, cx, cy, rx, ry, cos, sin)
    ] : [
    toarc(x1, y1, cx, cy, rx, ry, cos, sin),
    toarc(x1 - y1*f, y1 + x1*f, cx, cy, rx, ry, cos, sin),
    toarc(x2 + y2*f, y2 - x2*f, cx, cy, rx, ry, cos, sin),
    toarc(x2, y2, cx, cy, rx, ry, cos, sin)
    ];
}
function arc2ellipse(x1, y1, x2, y2, fa, fs, rx, ry, cs)
{
    // Step 1: simplify through translation/rotation
    var cos = cs[0], sin = cs[1],
        x =  cos*(x1 - x2)/2 + sin*(y1 - y2)/2,
        y = -sin*(x1 - x2)/2 + cos*(y1 - y2)/2,
        px = x*x, py = y*y, prx = rx*rx, pry = ry*ry,
        L = px/prx + py/pry;

    // correct out-of-range radii
    L = sqrt(L);
    rx *= L;
    ry *= L;
    prx = rx*rx;
    pry = ry*ry;

    // Step 2 + 3: compute center
    var M = sqrt(abs((prx*pry - prx*py - pry*px)/(prx*py + pry*px)))*(fa === fs ? -1 : 1),
        _cx = M*rx*y/ry,
        _cy = -M*ry*x/rx,

        cx = cos*_cx - sin*_cy + (x1 + x2)/2,
        cy = sin*_cx + cos*_cy + (y1 + y2)/2
    ;

    // Step 4: compute θ and dθ
    var theta = vector_angle(1, 0, (x - _cx)/rx, (y - _cy)/ry),
        dtheta = deg(vector_angle(
            (x - _cx)/rx, (y - _cy)/ry,
            (-x - _cx)/rx, (-y - _cy)/ry
        )) % 360;

    if (!fs && dtheta > 0) dtheta -= 360;
    if (fs && dtheta < 0) dtheta += 360;

    return [{x:cx, y:cy}, theta, rad(dtheta), rx, ry];
}
function ellipse2arc(cx, cy, rx, ry, cs, theta, dtheta)
{
    return {
        p0: arc(theta, cx, cy, rx, ry, cs[0], cs[1]),
        p1: arc(theta + dtheta, cx, cy, rx, ry, cs[0], cs[1]),
        fa: abs(deg(dtheta)) > 180, //fa
        fs: abs(deg(dtheta)) > 0 //fs
    };
}
function align_curve(points)
{
    return {Tx:-points[0].x, Ty:-points[0].y, R:-stdMath.atan2(points[points.length-1].y - points[0].y, points[points.length-1].x - points[0].x)};
}
function is_strictly_equal(a, b)
{
    return abs(a - b) < Number.EPSILON;
}
function is_almost_equal(a, b, eps)
{
    if (null == eps) eps = EPS;
    return abs(a - b) < eps;
}
function clamp(x, xmin, xmax)
{
    return stdMath.max(stdMath.min(x, xmax), xmin);
}
function sign(x)
{
    return 0 > x ? -1 : 1;
}
function signed(x, add)
{
    return 0 > x ? Str(x) : ((false === add ? '' : '+') + Str(x));
}
function deg(rad)
{
    return rad * 180 / PI;
}
function rad(deg)
{
    return deg * PI / 180;
}
// stdMath.hypot produces wrong results
var hypot = /*stdMath.hypot ? function hypot(dx, dy) {
    return stdMath.hypot(dx, dy);
} :*/ function hypot(dx, dy) {
    dx = abs(dx);
    dy = abs(dy)
    var r = 0;
    if (0 === dx)
    {
        return dy;
    }
    else if (0 === dy)
    {
        return dx;
    }
    else if (dx < dy)
    {
        r = dy/dx;
        return dx*sqrt(1 + r*r);
    }
    else if (dx > dy)
    {
        r = dx/dy;
        return dy*sqrt(1 + r*r);
    }
    return dx*sqrt2;
};
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
    var n1 = hypot(x1, y1), n2 = hypot(x2, y2);
    return is_strictly_equal(n1, 0) || is_strictly_equal(n2, 0) ? 0 : stdMath.acos(clamp(dotp(x1, y1, x2, y2)/n1/n2, -1, 1));
}
function vector_angle(ux, uy, vx, vy)
{
    return sign(ux*vy - uy*vx)*angle(ux, uy, vx, vy);
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
function SVG(tag, atts, svg, childNodes)
{
    var setAnyway = false;
    atts = atts || EMPTY_OBJ;
    if (!isBrowser || false === svg)
    {
        svg = '<'+tag+' '+Object.keys(atts).reduce(function(s, a) {
            return s + a+'="'+Str(atts[a][0])+'" ';
        }, '')+(childNodes ? ('>'+Str(childNodes)+'</'+tag+'>') : '/>');
    }
    else
    {
        if (!svg)
        {
            setAnyway = true;
            svg = document.createElementNS('http://www.w3.org/2000/svg', tag);
            if (childNodes)
            {
                for (var i=0,n=childNodes.length; i<n; ++i)
                {
                    svg.appendChild(childNodes[i]);
                }
            }
        }
        Object.keys(atts).forEach(function(a) {
            if (setAnyway || atts[a][1]) svg.setAttribute(a, atts[a][0]);
        });
    }
    return svg;
}
/*function debounce(func, wait, immediate)
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
}*/
function observeArray(array, onAdd, onDel, equals)
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
                    index = 0, deleted = null,
                    initialLength = array.length,
                    finalLength = 0;

                if (onAdd)
                {
                    if ('push' === method || 'unshift' === method)
                    {
                        args = Array.prototype.map.apply(args, onAdd);
                    }
                    if ('splice' === method && 2 < args.length)
                    {
                        args = Array.prototype.slice.call(args, 0, 2).concat(Array.prototype.slice.call(args, 2).map(onAdd));
                    }
                }

                if ('shift' === method || 'unshift' === method || 'splice' === method)
                {
                    // avoid superfluous notifications
                    doNotifyItems = false;
                }
                result = Array.prototype[method].apply(array, args);
                if ('splice' === method && result.length)
                {
                    deleted = result;
                }
                else if (0 < initialLength && 'pop' === method || 'shift' === method)
                {
                    deleted = [result];
                }
                if (deleted && onDel)
                {
                    deleted.forEach(onDel);
                }
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
                    notify({target:array, method:method, added:{from:initialLength, to:finalLength}});
                }
                else if ('unshift' === method)
                {
                    notify({target:array, method:method, added:{from:0, to:finalLength-initialLength-1}});
                }
                else if ('splice' === method && 2 < args.length)
                {
                    notify({target:array, method:method, added:{from:args[0], to:args[0]+args.length-3}, deleted:deleted});
                }
                else
                {
                    notify({target:array, method:method, deleted:deleted});
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
            def(array, key, {
                get: function() {
                    return val;
                },
                set: function(value) {
                    if (onAdd) value = onAdd(value);
                    var doNotify = !equals(val, value);
                    if (onDel) onDel(val);
                    val = value;
                    if (doNotify && doNotifyItems)
                    {
                        notify({target:array, method:'set', added:{from:index, to:index}});
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
    if (onAdd && array.length)
    {
        for (var i=0,n=array.length; i<n; ++i)
        {
            array[i] = onAdd(array[i]);
        }
    }
    methodInterceptor();
    itemInterceptor(0, array.length);

    return array;
}
function unobserveArray(array, onDel)
{
    if (!is_function(array.onChange)) return array;

    delete array.$cb;
    delete array.onChange;

    ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(function(method) {
        array[method] = Array.prototype[method];
    });

    var values = onDel ? array.map(onDel) : array.slice();
    array.length = 0;
    array.push.apply(array, values);

    return array;
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
function x(p)
{
    return p.x;
}
function y(p)
{
    return p.y;
}
var TRIM_RE = /^\s+|\s+$/gm;
var trim = String.prototype.trim ? function trim(s) {
    return s.trim()
} : function trim() {
    return s.replace(TRIM_RE, '');
};
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

Geometrize.Math.deg = deg;
Geometrize.Math.rad = rad;
Geometrize.Math.hypot = hypot;
Geometrize.Math.solveLinear = solve_linear;
Geometrize.Math.solveQuadratic = solve_quadratic;
Geometrize.Math.solveCubic = solve_cubic;
Geometrize.Math.solveLinearLinear = solve_linear_linear_system;
Geometrize.Math.solveLinearQuadratic = solve_linear_quadratic_system;
Geometrize.Geometry.linearBezierCurve = bezier1;
Geometrize.Geometry.quadraticBezierCurve = bezier2;
Geometrize.Geometry.cubicBezierCurve = bezier3;
Geometrize.Geometry.ellipticArcCurve = arc;
Geometrize.Geometry.computeConvexHull = function(points) {
    return convex_hull(points).map(Point);
};
Geometrize.Geometry.alignCurve = function(curve) {
    var T = align_curve(curve.points);
    return Matrix.rotate(T.R).mul(Matrix.translate(T.Tx, T.Ty));
};


