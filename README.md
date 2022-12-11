# Geometrize

![Geometrize](/geometrize.png)

Computational Geometry and Rendering library for JavaScript

**version: 0.9.0** (82 kB minified)

![geometrize animation](/geo.gif)

Examples:

**Bounding Boxes**

![geometrize bounding boxes](/boundingboxes.png)

**Convex Hulls**

![geometrize convex hulls](/convexhulls.png)

**Intersections**

![geometrize intersections](/intersections.png)

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

**Shape Tweens**

![geometrize tween between multiple shapes](/shapetween.gif)

```javascript
const {Plane, Tween, Polygon, Circle, Ellipse, Arc} = Geometrize;
const r = 50, rx = 50, ry = 20, cx = 100, cy = 100, angle = -30;
const plane = Plane(document.getElementById('container'), 0, 0, 300, 300);
const ellipse = Ellipse([cx, cy], rx, ry, angle);
const arc = Arc(ellipse.getPointAt(0), ellipse.getPointAt(0.6), rx, ry, angle, 0, 0);
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
            shape: arc,
            style: {
                stroke: 'cyan'
            },
            easing: 'ease-out'
        },
        "25%": {
            shape: ellipse,
            style: {
                stroke: 'orange'
            },
            easing: 'ease-out'
        },
        "50%": {
            shape: circle,
            style: {
                stroke: 'cyan'
            },
            easing: 'ease-out'
        },
        "75%": {
            shape: square,
            transform: {
                rotate: {
                    origin: {
                        x: square.getCenter().x,
                        y: square.getCenter().y
                    },
                    angle: 0
                }
            },
            style: {
                stroke: 'orange'
            },
            easing: 'ease-out-back'
        },
        "100%": {
            shape: square,
            transform: {
                rotate: {
                    origin: {
                        x: square.getCenter().x,
                        y: square.getCenter().y
                    },
                    angle: -45
                }
            },
            style: {
                stroke: 'blue'
            }
        }
    },
    duration: 4000,
    delay: 400
});
plane.add(tween);
tween.start();
```
