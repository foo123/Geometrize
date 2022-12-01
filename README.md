# Geometrize

![Geometrize](/geometrize.png)

Computational Geometry and Rendering library in JavaScript

**in progress**

Example:

```javascript
const plane = new Geometrize.Plane(document.getElementById('container'), 400, 400);

const ellipse = new Geometrize.Ellipse([40,40], 30, 10, -Math.PI/4);
const circle = new Geometrize.Circle([30,30], 20);

const line = new Geometrize.Line([20,20], [60,60]);
line.style['stroke'] = 'blue';

const line2 = new Geometrize.Line([50,2], [20,70]);
line2.style['stroke'] = 'green';

const i1 = line.intersects(ellipse),
    i2 = line2.intersects(ellipse),
    i3 = line.intersects(circle),
    i4 = line2.intersects(circle),
    i5 = ellipse.intersects(circle),
    i6 = line.intersects(line2);

let intersections = [].concat(i1 ? i1 : []).concat(i2 ? i2 : []).concat(i3 ? i3 : []).concat(i4 ? i4 : []).concat(i5 ? i5 : []).concat(i6 ? i6 : []);

plane.add(line);
plane.add(line2);
plane.add(ellipse);
plane.add(circle);
intersections.forEach(p => {
    p.style['stroke'] = 'red';
    p.style['stroke-width'] = 2;
    plane.add(p);
});
```
