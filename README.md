# Geometrize

![Geometrize](/geometrize.png)

Computational Geometry and Rendering library for JavaScript

**in progress**

Examples:

**Intersections**

![geometrize intersections](/intersections.png)

```javascript
const {Plane, Ellipse, Circle, Arc, Line} = Geometrize;
const plane = Plane(document.getElementById('container'), 300, 300);
const ellipse = Ellipse([40,40], 30, 10, -45);
const circle = Circle([30,30], 20);
const arc = Arc([100,100], [170,90], 30, 10, 30, 0, 1);
const line1 = Line([20,20], [60,60]).setStyle('stroke', 'blue');
const line2 = Line([50,2], [20,70]).setStyle('stroke', 'green');
const line3 = Line([60,160], [300,0]).setStyle('stroke', 'orange');
const line4 = Line([60,120], [300,-40]).setStyle('stroke', 'cyan');
let intersections = [];

plane.add(line1);
plane.add(line2);
plane.add(line3);
plane.add(line4);
plane.add(ellipse);
plane.add(circle);
plane.add(arc);

intersections = plane.getIntersections();
intersections.forEach(p => {
    plane.add(p.setStyle('stroke', 'red').setStyle('stroke-width', 2));
});
```

**Shape Tween** (in progress)

![geometrize circle to square tween](/shapetween.gif)

```javascript
const {Plane, Tween, Polygon, Circle} = Geometrize,
    r = 50, cx = 100, cy = 100;
const plane = Plane(document.getElementById('container'), 300, 300);
const circle = Circle([cx,cy], r);
const square = Polygon([
    [cx+r,cy],
    [cx+r,cy-r],
    [cx,cy-r],
    [cx-r,cy-r],
    [cx-r,cy],
    [cx-r,cy+r],
    [cx,cy+r],
    [cx+r,cy+r]
]);
const tween = Tween({
    keyframes: {
        "0%": {
            shape: circle,
            style: {
                stroke: 'cyan'
            },
            easing: 'ease-out'
        },
        "30%": {
            shape: square,
            transform: {
                rotate: [0, square.getCenter().x, square.getCenter().y]
            },
            style: {
                stroke: 'orange'
            },
            easing: 'ease-out-elastic'
        },
        "100%": {
            shape: square,
            transform: {
                rotate: [45, square.getCenter().x, square.getCenter().y]
            },
            style: {
                stroke: 'blue'
            }
        }
    },
    duration: 2000
});
plane.add(tween);
tween.start();
```
