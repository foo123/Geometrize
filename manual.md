
### Style

Represents the styling (eg stroke, fill, width) of a 2D or 3D object
```javascript
const style = Style({stroke:'red'});
style['stroke'] = 'green'; // change it
```




### Value

Represents a generic scalar value which can change dynamically
(not used directly)




### Matrix2D, 2D Homogeneous Transformation Matrix

Represents a homogeneous transformation matrix for 2D transforms

```javascript
const m = Matrix2D.translate(tx, ty).mul(Matrix2D.rotate(theta).mul(Matrix2D.scale(sx, sy)));
const invm = m.inv();
// p is a point, p2 is a transformed point
const p2 = m.transform(p);
```



### Object2D, Base Class

Represents a generic 2D object
(not used directly)




**Properties:**




* `id: String` unique ID for this object
* `name: String` class/type name of object, eg `"Object2D"`



* `matrix: Matrix2D` the transform matrix of the object (if it applies)



* `style: Style` the style applied to this object



**Methods:**




* `clone(): Object2D` get a copy of this object



* `transform(matrix2d: Matrix2D): Object2D` get a transformed copy of this object by matrix2d



* `setMatrix(matrix2D): self` set matrix for object



* `setStyle(style): self` set style for object
* `setStyle(prop, value): self` set style property/value for object



* `getBoundingBox(): Object{xmin,ymin,xmax,ymax}` get bounding box of object



* `getConvexHull(): Point2D[]` get points of convex hull enclosing object



* `getCenter(): Object{x,y}` get center of object



* `hasPoint(point): Bool` check if given point is part of the boundary of this object



* `hasInsidePoint(point, strict): Bool` check if given point is part of the interior of this object (where applicable)



* `intersects(other): Point2D[]|Bool` return array of intersection points with other 2d object or false



* `intersectsSelf(): Point2D[]|Bool` return array of intersection points of object with itself or false



* `toSVG(): String` render object as SVG string



* `toSVGPath(): String` render object as SVG path string



* `toCanvas(ctx): void` render object in canvas context



* `toTex(): String` get Tex representation of this object



* `toString(): String` get String representation of this object



### Point2D (subclass of Object2D)

Represents a point in 2D space

```javascript
const p = Point2D(x, y);
p.x += 10; // change it
p.y = 5; // change it
```



**Methods:**




* `eq(point: Point2D|Object{x,y}|[x,y]): Bool` determine if equals another point-like



* `add(other: Point2D): Point2D` add points coordinate-wise
* `add(other: Number): Point2D` add number to point coordinates



* `mul(other: Number): Point2D` multiply number to point coordinates



* `dot(other: Point2D): Number` dot product of points



* `cross(other: Point2D): Number` cross product of points



* `angle(other: Point2D): Number` angle between points



* `between(p1: Point2D, p1: Point2D): Bool` check if point is on line segment defined by points p1,p2



* `distanceToLine(p1: Point2D, p1: Point2D): Number` distance of point to line defined by points p1,p2



### Topos2D (subclass of Object2D)

Represents a geometric topos, ie a set of points
```javascript
const topos = Topos2D([p1, p2, p3, .., pn]);
```



**Properties:**




* `points: Point2D[]` the points that define this topos



### Curve2D (subclass of Topos2D)

Represents a generic curve in 2D space
(not used directly)




**Properties:**




* `length: Number` the length of the curve



* `area: Number` the area enclosed by the curve



**Methods:**




* `isConnected(): Bool` true if curve is a connected curve (eg a line)



* `isClosed(): Bool` true if curve is a closed curve (eg a circle)



* `isConvex(): Bool` true if curve is convex (eg a convex polygon)



* `getPointAt(t: Number): Point2D` get point on curve at position specified by parameter `t (0 <= t <= 1)`



* `curveUpTo(t: Number): Curve2D` get curve up to point specified by parameter `t (0 <= t <= 1)`



* `derivative(): Curve2D` get derivative of curve as curve



* `polylinePoints(): Object{x,y}[]` get points of polyline that approximates the curve



* `bezierPoints(t: Number = 1): Object{x,y}[]` get points of cubic bezier curves that approximate the curve (optionally up to point specified by parameter `t`)



### Bezier2D (subclass of Curve2D)

Represents a generic Bezier curve in 2D space
(not used directly)




### EllipticArc2D (subclass of Curve2D)

Represents a part of an arbitrary ellipse in 2D space
(not used directly)




### ParametricCurve (subclass of Curve2D)

Represents a generic parametric curve in 2D space
```javascript
// construct a spiral (0 <= t <= 1)
const spiral = ParametricCurve((t) => ({x: cx + t*r*Math.cos(t*6*Math.PI), y: cy + t*r*Math.sin(t*6*Math.PI)}));
```



### CompositeCurve (subclass of Curve2D)

Represents a container of multiple, not necessarily joined curves
```javascript
// construct a complex curve
const curve = CompositeCurve([Line(p1, p2), QBezier([p3, p4, p5]), Line(p6, p7)]);
```



**Properties:**




* `curves: Curve2D[]` array of curves that define this composite curve



### Line (equivalent to Linear Bezier, subclass of Bezier2D)

Represents a line segment between 2 points
```javascript
const line = Line(start, end);
line.start.x += 10; // change it
line.end.y = 20; // change it
```



**Methods:**




* `distanceToPoint(p: Point2D): Number` distance of point to this line segment



* `isParallelTo(l: Line): Bool` determine if line is parallel to line l
* `isParallelTo(p: Point2D, q: Point2D): Bool` determine if line is parallel to line defined by points p,q



* `isPerpendicularTo(l: Line): Bool` determine if line is perpendicular to line l
* `isPerpendicularTo(p: Point2D, q: Point2D): Bool` determine if line is perpendicular to line defined by points p,q



### QBezier (subclass of Bezier2D)

Represents a quadratic Bezier curve defined by its control points
```javascript
const qbezier = QBezier([p1, p2, p3]);
qbezier.points[0].x += 10; // change it
qbezier.points[1].x = 20; // change it
```



### CBezier (subclass of Bezier2D)

Represents a cubic Bezier curve defined by its control points
```javascript
const cbezier = CBezier([p1, p2, p3, p4]);
cbezier.points[0].x += 10; // change it
cbezier.points[2].x = 20; // change it
```



### Polyline (subclass of Curve2D)

Represents an assembly of consecutive line segments between given points
```javascript
const polyline = Polyline([p1, p2, .., pn]);
polyline.points[0].x += 10; // change it
polyline.points[2].x = 20; // change it
```



### Polygon (subclass of Curve2D)

Represents a polygon (a closed polyline) defined by its vertices
```javascript
const polygon = Polygon([p1, p2, .., pn]);
polygon.vertices[0].x += 10; // change it
polygon.vertices[2].x = 20; // change it
```



### Arc (subclass of EllipticArc2D)

Represents an elliptic arc between start and end (points) having radiusX, radiusY and rotation angle and given largeArc and sweep flags
```javascript
const arc = Arc(start, end, radiusX, radiusY, angle, largeArc, sweep);
arc.start.x += 10; // change it
arc.radiusX = 12; // change it
arc.largeArc = false; // change it
```



### Circle (subclass of EllipticArc2D)

Represents a circle of given center (point) and radius
```javascript
const circle = Circle(center, radius);
circle.center.x += 10; // change it
circle.radius = 12; // change it
```



### Ellipse (subclass of EllipticArc2D)

Represents an ellipse of given center (point), radiusX, radiusY and rotation angle
```javascript
const ellipse = Ellipse(center, radiusX, radiusY, angle);
ellipse.center.x += 10; // change it
ellipse.radiusX = 12; // change it
```



### Shape2D (subclass of Object2D)

container for 2D geometric objects, grouped together
```javascript
// construct a complex shape
const shape = Shape2D([Line(p1, p2), Line(p6, p7), Shape2D([Line(p3, p4), Line(p5, p6)])]);
```



**Properties:**




* `objects: Object2D[]` array of objects that are part of this shape



### Scene2D

scene container for 2D geometric objects

```javascript
const scene = Scene2D(containerEl, viewBoxMinX, viewBoxMinY, viewBoxMaxX, viewBoxMaxY);
scene.x0 = 20; // change viewport
scene.x1 = 100; // change viewport
scene.y0 = 10; // change viewport
scene.y1 = 200; // change viewport
const line = Line([p1, p2]);
scene.add(line); // add object
scene.remove(line); // remove object
scene.getIntersections(); // return array of points of intersection of all objects in the scene
scene.toSVG(); // render and return scene as SVG string
scene.toCanvas(); // render and return scene as Canvas
scene.toIMG(); // render and return scene as base64 encoded PNG image
```



### Utilities




### Geometry

Geometry utilities:



* `linearBezierCurve(t: Number, points: Object{x,y}[]): Object{x,y}` get point on linear Bezier curve at `t, 0 <= t <= 1` given its control points



* `quadraticBezierCurve(t: Number, points: Object{x,y}[]): Object{x,y}` get point on quadratic Bezier curve at `t, 0 <= t <= 1` given its control points



* `cubicBezierCurve(t: Number, points: Object{x,y}[]): Object{x,y}` get point on cubic Bezier curve at `t, 0 <= t <= 1` given its control points



* `ellipticArcCurve(t: Number, cx: Number=0, cy: Number=0, rx: Number=1, ry: Number=rx, angle: Number=0): Object{x,y}` get point on elliptic arc curve at `t, 0 <= t <= 1` given its center, radii and angle of rotation



* `computeConvexHull(points: Object{x,y}[]): Point2D[]` compute convex hull of points



### Math

Math utilities:



* `deg(x)` radians to degrees



* `rad(x)` degrees to radians



* `hypot(x, y)` hypotenuse



* `solveLinear(a, b)` solve linear equation
`ax+b=0`



* `solveQuadratic(a, b, c)` solve quadratic equation
`ax^2+bx+c=0`



* `solveCubic(a, b, c, d)` solve cubic equation
`ax^3+bx^2+cx+d=0`



* `solveQuartic(a, b, c, d, e)` solve quartic equation
`ax^4+bx^3+cx^2+dx+e=0`



* `solveLinearLinear(a, b, c, d, e, f)` solve system of 2 linear equations in 2 unknowns
`ax+by+c=0`
`dx+ey+f=0`



* `solveLinearQuadratic(n, m, k, a, b, c, d, e, f)` solve system of a linear and a quadratic equation in 2 unknowns
`nx+my+k=0`
`ax^2+by^2+cxy+dx+ey+f=0`



* `solveQuadraticQuadratic(a1, b1, c1, d1, e1, f1, a2, b2, c2, d2, e2, f2)` solve system of 2 quadratic equations in 2 unknowns
`a1x^2+b1y^2+c1xy+d1x+e1y+f1=0`
`a2x^2+b2y^2+c2xy+d2x+e2y+f2=0`
