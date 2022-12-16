# Geometrize

![Geometrize](/geometrize.png)

Computational Geometry and Rendering library for JavaScript

**version: 0.9.8** (69 kB minified)

Examples:

**Bounding Boxes**

![geometrize bounding boxes](/boundingboxes.png)

**Convex Hulls**

![geometrize convex hulls](/convexhulls.png)

**Intersections**

[![geometrize intersections](/intersections.png)](https://foo123.github.io/examples/geometrize/)

[See it](https://foo123.github.io/examples/geometrize/)

```javascript
const {Plane, Ellipse, Circle, Arc, QBezier, CBezier, Line, Point} = Geometrize;
const plane = Plane(document.getElementById('container'), 0, 0, 300, 300);
const ellipse = Ellipse([40,40], 30, 10, -45);
const circle = Circle([30,30], 20);
const arc = Arc([100,100], [170,90], 30, 10, 30, 0, 1);
const qbezier = QBezier([[80,110], [120,40], [160,120]]);
const cbezier = CBezier([[40,80], [120,40], [140,200], [160,90]]);
const line1 = Line([20,20], [60,60]).setStyle('stroke', 'blue');
const line2 = Line([50,2], [20,70]).setStyle('stroke', 'green');
const line3 = Line([60,160], [300,0]).setStyle('stroke', 'orange');
const line4 = Line([60,120], [300,-40]).setStyle('stroke', 'cyan');
let intersections = [];

plane.add(ellipse);
plane.add(circle);
plane.add(arc);
plane.add(qbezier);
plane.add(cbezier);
plane.add(line1);
plane.add(line2);
plane.add(line3);
plane.add(line4);

intersections = plane.getIntersections();
intersections.forEach(p => {
    plane.add(p.setStyle('stroke', 'red').setStyle('stroke-width', 2));
});
```
