
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



* `transform(matrix): Object2D` get a transformed copy of this object by matrix



* `getBoundingBox(): Object` get bounding box {xmin,ymin,xmax,ymax} of object



* `getConvexHull(): Point2D[]` get points of convex hull enclosing object



* `getCenter(): Object` get center {x,y} of object



* `toTex(): String` get Tex representation of this object



* `toString(): String` get String representation of this object



### Point2D 2D Point (subclass of Object2D)

Represents a point in 2D space

```javascript
const p = Point2D(x, y);
p.x = x+10; // change it
```



### Topos2D 2D Geometric Topos (subclass of Object2D)

Represents a geometric topos, ie a set of points
```javascript
const topos = Topos2D([p1, p2, p3, .., pn]);
```



**Properties:**




* `points: Point2D[]` the points that define this topos



**Methods:**




* `hasPoint(point): Bool` check if given point belongs to this topos



* `hasInsidePoint(point, strict): Bool` check if given point belongs to the interior of this topos (where applicable)



* `intersects(other): Point2D{}` return array of intersection points with other 2d object



### Curve2D 2D Generic Curve Base Class (subclass of Topos2D)

Represents a generic curve in 2D space
(not used directly)




**Properties:**




* `matrix: Matrix2D` the transform matrix of the curve



* `length: Number` the length of the curve



* `area: Number` the area enclosed by the curve



**Methods:**




* `isConnected(): Bool` True if curve is a connected curve (eg a line)



* `isClosed(): Bool` true if curve is a closed curve (eg a circle)



* `isConvex(): Bool` true if curve is convex (eg a concex polygon)



* `getPointAt(t): Point2D` get point on curve at position specified by paramater `t` (0 <= t <= 1)



* `curveUpTo(t): Curve2D` get curve up to point specified by paramater `t` (0 <= t <= 1)



* `derivative(): Curve2D` get derivative of curve as curve



* `polylinePoints(): Object{x,y}[]` get polyline points that approximates the curve



* `bezierPoints(t): Object{x,y}[]` get cubic bezier points that approximates the curve (optionally up to point specified by parameter t)



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
const line = Line(p1, p2);
```



### Polyline 2D Polyline (subclass of Curve2D)

Represents an assembly of consecutive line segments between given points
```javascript
const polyline = Polyline([p1, p2, .., pn]);
```



### 2D Elliptical Arc (subclass of EllipticArc2D)

Represents an elliptic arc between start and end (points) having radiusX, radiusY and rotation angle and given largeArc and sweep flags
```javascript
const arc = Arc(start, end, radiusX, radiusY, angle, largeArc, sweep);
```



### QBezier 2D Quadratic Bezier (subclass of Bezier2D)

Represents a quadratic bezier curve defined by its control points
```javascript
const qbezier = QBezier([p1, p2, p3]);
```



### CBezier 2D Cubic Bezier (subclass of Bezier2D)

Represents a cubic bezier curve defined by its control points
```javascript
const cbezier = CBezier([p1, p2, p3, p4]);
```



### Polygon 2D Polygon (subclass of Curve2D)

Represents a polygon (a closed polyline) defined by its vertices
```javascript
const polygon = Polygon([p1, p2, .., pn]);
```



### 2D Circle (subclass of EllipticArc2D)

Represents a circle of given center (point) and radius
```javascript
const circle = Circle(center, radius);
```



### 2D Ellipse (subclass of EllipticArc2D)

Represents an ellipse of given center (point), radiusX, radiusY and rotation angle
```javascript
const ellipse = Ellipse(center, radiusX, radiusY, angle);
```



### Shape2D 2D generic Shape

container for 2D geometric objects, grouped together
(not implemented yet)




### 2D Scene

scene container for 2D geometric objects

```javascript
const scene = Scene2D(containerEl, viewBoxMinX, viewBoxMinY, viewBoxMaxX, viewBoxMaxY);
scene.add(Line([p1, p2]));
```
