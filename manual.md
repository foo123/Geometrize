
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



### Style class

Represents the styling (eg stroke, fill, width) of a 2D object




### Object2D Base Class

Represents a generic 2D object
(not used directly)




### Point 2D Point (subclass of Object2D)

Represents a point in 2D space

```javascript
const p = Point(x, y);
```



### Topos 2D Geometric Topos (subclass of Object2D)

Represents a geometric topos, ie a set of points
```javascript
const topos = Topos([p1, p2, p3, .., pn]);
```



### Curve2D 2D Generic Curve Base Class (subclass of Topos)

Represents a generic curve in 2D space
(not used directly)




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




### 2D Plane

scene container for 2D geometric objects

```javascript
const plane = Plane(containerEl, viewBoxMinX, viewBoxMinY, viewBoxMaxX, viewBoxMaxY);
plane.add(Line([p1, p2]));
```
