
### Style class

Represents the styling (eg stroke, fill, width) of a 2D or 3D object
```javascript
const style = Style({stroke:'red'});
style['stroke'] = 'green'; // change it
```




### Value class

Represents a generic scalar value which can change dynamically
(not used directly)




### Matrix2D 2D Homogeneous Transformation Matrix

Represents a homogeneous transformation matrix for 2D transforms

```javascript
const m = Matrix2D.translate(tx, ty).mul(Matrix2D.rotate(theta).mul(Matrix2D.scale(sx, sy)));
const invm = m.inv();
// p is a point, p2 is a transformed point
const p2 = m.transform(p);
```



### Object2D Base Class

Represents a generic 2D object
(not used directly)




**Properties:**




* `id: String` unique ID for this object



* `style: Style` the style applied to this object



**Methods:**




* `clone(): Object2D` get a copy of this object



* `transform(matrix2d): Object2D` get a transformed copy of this object by matrix2d



* `getBoundingBox(): Object{xmin,ymin,xmax,ymax}` get bounding box of object



* `getConvexHull(): Point2D[]` get points of convex hull enclosing object



* `getCenter(): Object{x,y}` get center of object



* `hasPoint(point): Bool` check if given point is part of the boundary this object



* `hasInsidePoint(point, strict): Bool` check if given point is part of the interior of this object (where applicable)



* `intersects(other): Point2D[]|Bool` return array of intersection points with other 2d object or false



* `intersects(other): Point2D[]|Bool` return array of intersection points of object with itself or false



* `toTex(): String` get Tex representation of this object



* `toString(): String` get String representation of this object



### Point2D 2D Point (subclass of Object2D)

Represents a point in 2D space

```javascript
const p = Point2D(x, y);
p.x += 10; // change it
p.y = 5; // change it
```



### Topos2D 2D Geometric Topos (subclass of Object2D)

Represents a geometric topos, ie a set of points
```javascript
const topos = Topos2D([p1, p2, p3, .., pn]);
```



**Properties:**




* `points: Point2D[]` the points that define this topos



### Curve2D 2D Generic Curve Base Class (subclass of Topos2D)

Represents a generic curve in 2D space
(not used directly)




**Properties:**




* `matrix: Matrix2D` the transform matrix of the curve



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



### Bezier2D 2D Generic Bezier Curve Base Class (subclass of Curve2D)

Represents a generic bezier curve in 2D space
(not used directly)




### EllipticArc2D 2D Generic Elliptic Arc Base Class (subclass of Curve2D)

Represents a part of an arbitrary ellipse in 2D space
(not used directly)




### ParametricCurve 2D Generic Parametric Curve (subclass of Curve2D)

Represents a generic parametric curve in 2D space
```javascript
// construct a spiral (0 <= t <= 1)
const spiral = ParametricCurve((t) => ({x: cx + t*r*Math.cos(t*6*Math.PI), y: cy + t*r*Math.sin(t*6*Math.PI)}));
```



### CompositeCurve 2D Generic Composite Curve (subclass of Curve2D)

Represents a container of multiple, not necessarily joined curves
```javascript
// construct a complex curve
const curve = CompositeCurve([Line(p1, p2), QBezier([p3, p4, p5]), Line(p6, p7)]);
```



**Properties:**




* `curves: Curve2D[]` array of curves that define this composite curve



### Line 2D Line Segment (equivalent to Linear Bezier, subclass of Bezier2D)

Represents a line segment between 2 points
```javascript
const line = Line(start, end);
line.start.x += 10; // change it
line.end.y = 20; // change it
```



### Polyline 2D Polyline (subclass of Curve2D)

Represents an assembly of consecutive line segments between given points
```javascript
const polyline = Polyline([p1, p2, .., pn]);
polyline.points[0].x += 10; // change it
polyline.points[2].x = 20; // change it
```



### 2D Elliptical Arc (subclass of EllipticArc2D)

Represents an elliptic arc between start and end (points) having radiusX, radiusY and rotation angle and given largeArc and sweep flags
```javascript
const arc = Arc(start, end, radiusX, radiusY, angle, largeArc, sweep);
arc.start.x += 10; // change it
arc.radiusX = 12; // change it
arc.largeArc = false; // change it
```



### QBezier 2D Quadratic Bezier (subclass of Bezier2D)

Represents a quadratic bezier curve defined by its control points
```javascript
const qbezier = QBezier([p1, p2, p3]);
qbezier.points[0].x += 10; // change it
qbezier.points[1].x = 20; // change it
```



### CBezier 2D Cubic Bezier (subclass of Bezier2D)

Represents a cubic bezier curve defined by its control points
```javascript
const cbezier = CBezier([p1, p2, p3, p4]);
cbezier.points[0].x += 10; // change it
cbezier.points[2].x = 20; // change it
```



### Polygon 2D Polygon (subclass of Curve2D)

Represents a polygon (a closed polyline) defined by its vertices
```javascript
const polygon = Polygon([p1, p2, .., pn]);
polygon.vertices[0].x += 10; // change it
polygon.vertices[2].x = 20; // change it
```



### 2D Circle (subclass of EllipticArc2D)

Represents a circle of given center (point) and radius
```javascript
const circle = Circle(center, radius);
circle.center.x += 10; // change it
circle.radius = 12; // change it
```



### 2D Ellipse (subclass of EllipticArc2D)

Represents an ellipse of given center (point), radiusX, radiusY and rotation angle
```javascript
const ellipse = Ellipse(center, radiusX, radiusY, angle);
ellipse.center.x += 10; // change it
ellipse.radiusX = 12; // change it
```



### Shape2D 2D generic Shape

container for 2D geometric objects, grouped together
(not implemented yet)




### 2D Scene

scene container for 2D geometric objects

```javascript
const scene = Scene2D(containerEl, viewBoxMinX, viewBoxMinY, viewBoxMaxX, viewBoxMaxY);
const line = Line([p1, p2]);
scene.add(line); // add object
scene.remove(line); // remove object
scene.x0 = 20; // change viewport
scene.x1 = 100; // change viewport
scene.y0 = 10; // change viewport
scene.y1 = 200; // change viewport
```
