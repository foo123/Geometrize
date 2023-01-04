
### 2D Homogeneous Transformation Matrix

Represents a homogeneous transformation matrix for 2D transforms

```javascript
const m = Matrix.translate(tx, ty).mul(Matrix.rotate(theta).mul(Matrix.scale(sx, sy)));
// p is a point, p2 is a transformed point
const p2 = m.transform(p);
```



### 2D Point

Represents a point in 2D space

```javascript
const p = Point(x, y);
```



### 2D Topos

Represents a geometric topos, ie a set of points
```javascript
const topos = Topos([p1, p2, p3, .., pn]);
```



### 2D Generic Curve Base Class

Represents a generic curve in 2D space
(not used directly)




### 2D Generic Bezier Curve Base Class

Represents a generic bezier curve in 2D space
(not used directly)




### 2D Generic Parametric Curve

Represents a generic parametric curve in 2D space
```javascript
// construct a spiral (0 <= t <= 1)
const spiral = ParametricCurve((t) => ({x: cx + t*r*Math.cos(t*6*Math.PI), y: cy + t*r*Math.sin(t*6*Math.PI)}));
```



### 2D Generic Composite Curve

Represents a container of multiple, not necessarily joined curves
```javascript
// construct a complex curve
const curve = CompositeCurve([Line(p1, p2), QBezier([p3, p4, p5]), Line(p6, p7)]);
```



### 2D Line Segment (equivalent to Linear Bezier)

Represents a line segment between 2 points
```javascript
const line = Line(p1, p2);
```



### 2D Polyline

Represents an assembly of consecutive line segments between given points
```javascript
const polyline = Polyline([p1, p2, .., pn]);
```



### 2D Elliptical Arc

Represents an elliptic arc between start and end (points) having radiusX, radiusY and rotation angle and given largeArc and sweep flags
```javascript
const arc = Arc(start, end, radiusX, radiusY, angle, largeArc, sweep);
```



### 2D Quadratic Bezier

Represents a quadratic bezier curve defined by its control points
```javascript
const qbezier = QBezier([p1, p2, p3]);
```



### 2D Cubic Bezier

Represents a cubic bezier curve defined by its control points
```javascript
const cbezier = CBezier([p1, p2, p3, p4]);
```



### 2D Polygon

Represents a polygon (a closed polyline) defined by its vertices
```javascript
const polygon = Polygon([p1, p2, .., pn]);
```



### 2D Circle

Represents a circle of given center (point) and radius
```javascript
const circle = Circle(center, radius);
```



### 2D Ellipse

Represents an ellipse of given center (point), radiusX, radiusY and rotation angle
```javascript
const ellipse = Ellipse(center, radiusX, radiusY, angle);
```



### 2D generic Shape

container for 2D geometric objects, grouped together
(not implemented yet)




### 2D Plane

scene container for 2D geometric objects

```javascript
const plane = Plane(containerEl, viewBoxMinX, viewBoxMinY, viewBoxMaxX, viewBoxMaxY);
plane.add(Line([p1, p2]));
```
