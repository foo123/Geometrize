# Geometrize

![Geometrize](/geometrize.png)

Computational Geometry and Rendering library for JavaScript

**version: 0.9.5** (83 kB minified)

![geometrize animation](/geo.gif)

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

**Parse SVG to Geometrize Shapes**

![parse svg to geometrize shapes](/parse.png)

```html
<h4>Original SVG</h4>
<div id="svg"><svg width="100px" height="100px" viewBox="0 0 32 32" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"><defs><style>.cls-1,.cls-2,.cls-3{fill:none;}.cls-1,.cls-2{stroke:#231f20;stroke-linejoin:round;}.cls-1{stroke-linecap:round;}.cls-3{stroke:#000;stroke-miterlimit:10;}</style></defs><path class="cls-1" d="M26.54,16A13.2,13.2,0,0,1,21.71,26.5l-1.19-.95.41,1.51a9.09,9.09,0,0,1-9.85,0l.41-1.48-1.17.93A13.2,13.2,0,0,1,5.53,16,13.14,13.14,0,0,1,10.62,5.27l.88,1.21V4.71A9.17,9.17,0,0,1,16,3.49,9.06,9.06,0,0,1,20.5,4.67V6.48l.9-1.24A13.11,13.11,0,0,1,26.54,16Z"/><path class="cls-1" d="M11.5,4.5v2l-.88-1.2"/><line class="cls-1" x1="20.5" x2="20.5" y1="6.5" y2="4.5"/><ellipse class="cls-2" cx="11.5" cy="12.5" rx="3" ry="2"/><ellipse class="cls-2" cx="20.5" cy="12.5" rx="3" ry="2"/><polyline class="cls-2" points="15.48 16.17 14.49 19.5 17.49 19.5 16.51 16.19"/><path class="cls-3" d="M16,25.4h0c-2.49,0-4.5-1.61-4.5-3.6V21c0-.07.07-.13.17-.13L12,21a12.59,12.59,0,0,0,8.33-.11h0c.1,0,.17.06.17.13v.77C20.5,23.79,18.49,25.4,16,25.4Z"/></svg></div>

<h4>Parsed SVG</h4>
<div id="container"></div>

<script src="../build/Geometrize.js"></script>
<script src="../build/parseSVG.js"></script>
```

```javascript
const G = Geometrize;

const plane = G.Plane(document.getElementById('container'), 0, 0, 32, 32);

// parses both string and HTML node
parseSVG(document.getElementById('svg').innerHTML).map(function map(obj) {
switch (obj.type)
{
    case 'SVG':
        plane.x0 = obj.viewBox[0];
        plane.y0 = obj.viewBox[1];
        plane.x1 = obj.viewBox[2];
        plane.y1 = obj.viewBox[3];
        obj.nodes.map(map).forEach(function(obj) {
            if (obj) plane.add(obj);
        });
        return;

    case 'Line':
    case 'Polyline':
    case 'Polygon':
        return G[obj.type](obj.points).setStyle(obj.style);

    case 'Circle':
        return G.Circle(obj.params.center, obj.params.radius).setStyle(obj.style);

    case 'Ellipse':
        return G.Ellipse(obj.params.center, obj.params.radiusX, obj.params.radiusY, obj.params.angle).setStyle(obj.style);

    case 'Arc':
        return G.Arc(obj.params.start, obj.params.end, obj.params.radiusX, obj.params.radiusY, obj.params.angle, obj.params.largeArc, obj.params.sweep).setStyle(obj.style);

    case 'Quadratic':
        return G.QBezier(obj.points).setStyle(obj.style);

    case 'Cubic':
        return G.CBezier(obj.points).setStyle(obj.style);

    case 'Path':
        return G.CompositeCurve(obj.nodes.map(map)).setStyle(obj.style);
}
});
```

**Shape Tweens**

[![geometrize tween between multiple shapes](/shapetween.gif)](https://foo123.github.io/examples/shapetween/)

[See it](https://foo123.github.io/examples/shapetween/)

```javascript
const {Plane, Tween, Polygon, Circle, Ellipse, Arc} = Geometrize;
const r = 50, rx = 50, ry = 20, cx = 100, cy = 100, angle = -30;
const plane = Plane(document.getElementById('container'), 0, 0, 300, 300);
const ellipse = Ellipse([cx, cy], rx, ry, angle);
const arc = Arc(ellipse.getPointAt(0), ellipse.getPointAt(0.6), rx, ry, angle, 0, 0);
const circle = Circle([cx,cy], r);
const square = Polygon([
    [cx+r,cy+r],
    [cx+r,cy-r],
    [cx-r,cy-r],
    [cx-r,cy+r]
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
