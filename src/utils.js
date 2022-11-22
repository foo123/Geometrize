// ---- utilities -----
function is_almost_zero(x)
{
    return stdMath.abs(x) < Number.EPSILON;
}
function is_almost_equal(a, b)
{
    return is_almost_zero(a - b);
}
var sqrt2 = stdMath.sqrt(2);
function hypot(x1, y1, x2, y2)
{
    var dx = stdMath.abs(x1 - (x2||0)), dy = stdMath.abs(y1 - (y2||0)), r = 0;
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
function p_eq(p1, p2)
{
    return is_almost_zero(p1.x - p2.x) && is_almost_zero(p1.y - p2.y);
}
function dist2(p1, p2)
{
    var dx = p1.x - p2.x, dy = p1.y - p2.y;
    return dx*dx + dy*dy;
}
function dist(p1, p2)
{
    return hypot(p1.x, p1.y, p2.x, p2.y);
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
    var x1 = p1.x, y1 = p1.y,
        x2 = p2.x, y2 = p2.y,
        x = p0.x, y = p0.y,
        d = hypot(x1, y1, x2, y2)
    ;
    if (is_almost_zero(d)) return hypot(x, y, x1, y1);
    return stdMath.abs((x2 - x1)*(y1 - y) - (y2 - y1)*(x1 - x)) / d;
}
function point_line_segment_distance(p0, p1, p2)
{
    var x1 = p1.x, y1 = p1.y,
        x2 = p2.x, y2 = p2.y,
        x = p0.x, y = p0.y,
        d = hypot(x1, y1, x2, y2),
        dx = 0, dy = 0, t = 0
    ;
    if (is_almost_zero(d)) return hypot(x, y, x1, y1);
    dx = x2 - x1;
    dy = y2 - y1;
    t = stdMath.max(0, stdMath.min(1, ((x - x1)*dx + (y - y1)*dy) / d));
    return hypot(x, y, x1 + t*dx, y1 + t*dy);
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
    return is_almost_zero(det) ? false : {x:(b*m - c*l)/det, y:(c*k - a*m)/det};
}
function line_quadratic_intersection(m, n, k, a, b, c, d, e, f)
{
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
    ax^2+by^2+cxy+dx+ey+f=0
    mx^2+ny^2+lxy+kx+gy+h=0

    (a)x^2+(cy+d)x+(by^2+ey+f) = 0
    x = (-(cy+d) +/- sqrt((cy+d)^2-4(a)(by^2+ey+f)))/2(a)
    x = (-(cy+d) +/- sqrt((c^2y^2+d^2+2cdy)-4aby^2+4aey+4af)))/2(a)
    x = (-(cy+d) +/- sqrt((c^2-4ab)y^2+(4ae+2cd)y+(d^2+4af)))/2(a)

    (n)y^2+(lx+g)y+(mx^2+kx+h) = 0
    y = (-(lx+g) +/- sqrt((lx+g)^2-4(n)(mx^2+kx+h)))/2(n)

    print(nonlinsolve([a*x**4+b*x**3+c*x**2+d*x+e], [x]))
    {(Piecewise((-sqrt(-2*(-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**(1/3) - 2*c/(3*a) + b**2/(4*a**2))/2 - sqrt((2*d/a - b*c/a**2 + b**3/(4*a**3))/sqrt(-2*(-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**(1/3) - 2*c/(3*a) + b**2/(4*a**2)) + 2*(-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**(1/3) - 4*c/(3*a) + b**2/(2*a**2))/2 - b/(4*a), Eq(e/a - b*d/(4*a**2) + c**2/(12*a**2), 0)), (-sqrt(-2*(-e/a + b*d/(4*a**2) - c**2/(12*a**2))/(3*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3)) + 2*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3) - 2*c/(3*a) + b**2/(4*a**2))/2 - sqrt((2*d/a - b*c/a**2 + b**3/(4*a**3))/sqrt(-2*(-e/a + b*d/(4*a**2) - c**2/(12*a**2))/(3*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3)) + 2*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3) - 2*c/(3*a) + b**2/(4*a**2)) + 2*(-e/a + b*d/(4*a**2) - c**2/(12*a**2))/(3*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3)) - 2*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3) - 4*c/(3*a) + b**2/(2*a**2))/2 - b/(4*a), True)),), (Piecewise((-sqrt(-2*(-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**(1/3) - 2*c/(3*a) + b**2/(4*a**2))/2 + sqrt((2*d/a - b*c/a**2 + b**3/(4*a**3))/sqrt(-2*(-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**(1/3) - 2*c/(3*a) + b**2/(4*a**2)) + 2*(-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**(1/3) - 4*c/(3*a) + b**2/(2*a**2))/2 - b/(4*a), Eq(e/a - b*d/(4*a**2) + c**2/(12*a**2), 0)), (-sqrt(-2*(-e/a + b*d/(4*a**2) - c**2/(12*a**2))/(3*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3)) + 2*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3) - 2*c/(3*a) + b**2/(4*a**2))/2 + sqrt((2*d/a - b*c/a**2 + b**3/(4*a**3))/sqrt(-2*(-e/a + b*d/(4*a**2) - c**2/(12*a**2))/(3*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3)) + 2*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3) - 2*c/(3*a) + b**2/(4*a**2)) + 2*(-e/a + b*d/(4*a**2) - c**2/(12*a**2))/(3*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3)) - 2*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3) - 4*c/(3*a) + b**2/(2*a**2))/2 - b/(4*a), True)),), (Piecewise((sqrt(-2*(-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**(1/3) - 2*c/(3*a) + b**2/(4*a**2))/2 - sqrt(-(2*d/a - b*c/a**2 + b**3/(4*a**3))/sqrt(-2*(-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**(1/3) - 2*c/(3*a) + b**2/(4*a**2)) + 2*(-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**(1/3) - 4*c/(3*a) + b**2/(2*a**2))/2 - b/(4*a), Eq(e/a - b*d/(4*a**2) + c**2/(12*a**2), 0)), (sqrt(-2*(-e/a + b*d/(4*a**2) - c**2/(12*a**2))/(3*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3)) + 2*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3) - 2*c/(3*a) + b**2/(4*a**2))/2 - sqrt(-(2*d/a - b*c/a**2 + b**3/(4*a**3))/sqrt(-2*(-e/a + b*d/(4*a**2) - c**2/(12*a**2))/(3*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3)) + 2*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3) - 2*c/(3*a) + b**2/(4*a**2)) + 2*(-e/a + b*d/(4*a**2) - c**2/(12*a**2))/(3*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3)) - 2*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3) - 4*c/(3*a) + b**2/(2*a**2))/2 - b/(4*a), True)),), (Piecewise((sqrt(-2*(-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**(1/3) - 2*c/(3*a) + b**2/(4*a**2))/2 + sqrt(-(2*d/a - b*c/a**2 + b**3/(4*a**3))/sqrt(-2*(-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**(1/3) - 2*c/(3*a) + b**2/(4*a**2)) + 2*(-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**(1/3) - 4*c/(3*a) + b**2/(2*a**2))/2 - b/(4*a), Eq(e/a - b*d/(4*a**2) + c**2/(12*a**2), 0)), (sqrt(-2*(-e/a + b*d/(4*a**2) - c**2/(12*a**2))/(3*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3)) + 2*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3) - 2*c/(3*a) + b**2/(4*a**2))/2 + sqrt(-(2*d/a - b*c/a**2 + b**3/(4*a**3))/sqrt(-2*(-e/a + b*d/(4*a**2) - c**2/(12*a**2))/(3*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3)) + 2*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3) - 2*c/(3*a) + b**2/(4*a**2)) + 2*(-e/a + b*d/(4*a**2) - c**2/(12*a**2))/(3*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3)) - 2*((c/a - 3*b**2/(8*a**2))**3/216 - (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/6 + sqrt((-e/a + b*d/(4*a**2) - c**2/(12*a**2))**3/27 + (-(c/a - 3*b**2/(8*a**2))**3/108 + (c/a - 3*b**2/(8*a**2))*(e/a - b*d/(4*a**2) + b**2*c/(16*a**3) - 3*b**4/(256*a**4))/3 - (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/8)**2/4) + (d/a - b*c/(2*a**2) + b**3/(8*a**3))**2/16)**(1/3) - 4*c/(3*a) + b**2/(2*a**2))/2 - b/(4*a), True)),)}
    */
}
function line_segments_intersection(p1, p2, p3, p4)
{
    var p = line_line_intersection(
        p2.y - p1.y, p1.x - p2.x, p2.x*p1.y - p1.x*p2.y,
        p4.y - p3.y, p3.x - p4.x, p4.x*p3.y - p3.x*p4.y
        );
    return p && point_between(p, p1, p2) && point_between(p, p3, p4) ? p : false;
}
function curve_lines_intersection(curve1_points, curve2_points, get_point1, get_point2)
{
    get_point1 = get_point1 || identity;
    get_point2 = get_point2 || identity;
    var i = [], j, k, p,
        n1 = curve1_points.length-1,
        n2 = curve2_points.length-1;
    for (j=0; j<n1; ++j)
    {
        for (k=0; k<n2; ++k)
        {
            p = line_segments_intersection(
                get_point1(curve1_points[j]), get_point1(curve1_points[j+1]),
                get_point2(curve2_points[k]), get_point2(curve2_points[k+1])
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
    for (var p1,p2,i=0,intersects=0,n=curve_points.length; i<n; ++i)
    {
        p1 = get_point(curve_points[i]);
        p2 = get_point(curve_points[(i+1) % n]);
        //if (point_between(p, p1, p2)) return true;
        if (line_segments_intersection(p, maxp, p1, p2)) ++intersects;
    }
    return intersects & 1 ? true : false;
}
function curve_curve_intersection(other_curve, this_curve_points)
{
    var i, n = this_curve.length, cost, result = [];
    for (i=0; i<n; ++i)
    {
        p = this_curve_points[i][0];
        cost = other_curve(p);
        if (is_almost_zero(cost))
            result.push(p);
    }
    return result.length ? result : false;
}
function curve_length(curve_points, get_point)
{
    get_point = get_point || identity;
    for (var p1,p2,length=0,i=0,n=curve_points.length-1; i<n; ++i)
    {
            p1 = get_point(curve_points[i]);
            p2 = get_point(curve_points[i+1]);
            length += hypot(p1.x, p1.y, p2x, p2.y);
    }
    return length;
}
function curve_area(curve_points, get_point)
{
    get_point = get_point || identity;
    for (var p1,p2,area=0,i=0,n=curve_points.length; i<n; ++i)
    {
        // shoelace formula
        p1 = get_point(curve_points[i]);
        p2 = get_point(curve_points[(i+1) % n]);
        area += crossp(p1.x, p1.y, p2.x, p2.y) / 2;
    }
    return area;
}
function sample_curve(f, n, do_refine)
{
    if (null == n) n = 20;
    var tolerance = 0.01, depth = 20, i, t, h = 1/n, p, points = [];
    if (do_refine)
    {
        points.push([f(0), 0]);
        for (i=0,t=0; i<n; ++i,t+=h)
        {
            subdivide_curve(points, f, t, t+h, tolerance, depth);
        }
    }
    else
    {
        for (i=0,t=0; i<n; ++i,t+=h)
        {
            points.push([f(t), t]);
        }
    }
    return points;
}
function subdivide_curve(points, f, l, r, tolerance, depth, pl, pr)
{
    var m = (l + r) / 2, left = pl || f(l), right = pr || f(r), middle = f(m);
    if ((0 >= depth) || (point_line_distance(middle, left, right) <= tolerance))
    {
        // no more refinement, return linear interpolation
        // simple line segment, include middle as well for better accuracy
        points.push.apply(p_eq(left, middle) || p_eq(right, middle) ? [[right, r]] : [[middle, m], [right, r]]);
    }
    else
    {
        // recursively subdivide to refine samples with high enough curvature
        subdivide_curve(f, l, m, tolerance, depth-1, left, middle);
        subdivide_curve(f, m, r, tolerance, depth-1, middle, right);
    }
    return points;
}
function bezier0(t, p)
{
    return p[0];
}
function bezier1(t, p)
{
    var b00 = p[0],
        b01 = p[1],
        i = 1-t;
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
function SVG(tag, atts, svg, isDirty, g, ga)
{
    var setAnyway = false;
    atts = atts || EMPTYO;
    if (false === svg)
    {
        svg = '<'+tag+' '+Object.keys(atts).reduce(function(s, a) {
            return s + a+'="'+Str(atts[a])+'" ';
        }, '')+'/>';
        if (g)
        {
            svg = '<g '+Object.keys(ga||EMPTYO).reduce(function(s, a) {
                return s + a+'="'+Str(ga[a])+'" ';
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
        isDirty = isDirty || EMPTYO;
        Object.keys(atts).forEach(function(a) {
            if (setAnyway || isDirty[a]) svg.setAttribute(a, atts[a]);
        });
        if (g && ga)
        {
            Object.keys(ga).forEach(function(a) {
                if (setAnyway || isDirty[a]) g.setAttribute(a, ga[a]);
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
function identity(x)
{
    return x;
}
function item0(x)
{
    return x[0];
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
var cnt = 0, Str = String, EMPTYO = {};
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
