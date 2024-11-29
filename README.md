# Geometrize

![Geometrize](/geometrize.png)

Computational Geometry and Rendering library for JavaScript

**version: 1.0.1** (80 kB minified)


[API Reference](/manual.md)


Examples:

**Bounding Boxes**

![geometrize bounding boxes](/boundingboxes.png)

**Convex Hulls**

![geometrize convex hulls](/convexhulls.png)

**Intersections**

[![geometrize intersections](/intersections.png)](https://foo123.github.io/examples/geometrize/)

[See it](https://foo123.github.io/examples/geometrize/)

```javascript
const {Scene2D, CompositeCurve, ParametricCurve, Ellipse, Circle, Arc, QBezier, CBezier, Line, Polyline, Polygon, Rect, Matrix2D} = Geometrize;
const scene = Scene2D(document.getElementById('container'), 0, 0, 300, 300);
const spiral = ParametricCurve((t) => ({x:190 + t*50*Math.cos(t*6*Math.PI), y:80 + t*50*Math.sin(t*6*Math.PI)}));
const ellipse = Ellipse([40,40], 30, 10, -45);
const circle = Circle([30,30], 20);
const arc = Arc([100,100], [170,90], 30, 10, 30, 0, 1);
const qbezier = QBezier([[80,110], [120,40], [160,120]]);
const cbezier = CBezier([[40,80], [120,40], [140,200], [160,90]]);
const curve = CompositeCurve([
    Line([20,100], [40,100]),
    Arc([40,100], [40,80], 10, 10, 0, 0, 0),
    QBezier([[40,80],[20,100],[60,120]]),
    Line([60,120], [70,100])
]).transform(Matrix2D.translate(-20, 0));
const line1 = Line([20,20], [60,60]).setStyle('stroke', 'blue');
const line2 = Line([50,2], [20,70]).setStyle('stroke', 'green');
const line3 = Line([60,160], [300,0]).setStyle('stroke', 'orange');
const line4 = Line([60,120], [300,-40]).setStyle('stroke', 'cyan');

let intersections = [];

scene.add(spiral);
scene.add(ellipse);
scene.add(circle);
scene.add(arc);
scene.add(qbezier);
scene.add(cbezier);
scene.add(curve);
scene.add(line1);
scene.add(line2);
scene.add(line3);
scene.add(line4);

intersections = scene.getIntersections();
intersections.forEach(p => {
    scene.add(p.setStyle('stroke', 'red').setStyle('stroke-width', 2));
});
```

**see also:**

* [Abacus](https://github.com/foo123/Abacus) advanced Combinatorics and Algebraic Number Theory Symbolic Computation library for JavaScript, Python
* [TensorView](https://github.com/foo123/TensorView) view array data as multidimensional tensors of various shapes efficiently
* [Geometrize](https://github.com/foo123/Geometrize) Computational Geometry and Rendering Library for JavaScript
* [Plot.js](https://github.com/foo123/Plot.js) simple and small library which can plot graphs of functions and various simple charts and can render to Canvas, SVG and plain HTML
* [MOD3](https://github.com/foo123/MOD3) 3D Modifier Library in JavaScript
* [HAAR.js](https://github.com/foo123/HAAR.js) image feature detection based on Haar Cascades in JavaScript (Viola-Jones-Lienhart et al Algorithm)
* [HAARPHP](https://github.com/foo123/HAARPHP) image feature detection based on Haar Cascades in PHP (Viola-Jones-Lienhart et al Algorithm)
* [FILTER.js](https://github.com/foo123/FILTER.js) video and image processing and computer vision Library in pure JavaScript (browser and node)
* [Xpresion](https://github.com/foo123/Xpresion) a simple and flexible eXpression parser engine (with custom functions and variables support), based on [GrammarTemplate](https://github.com/foo123/GrammarTemplate), for PHP, JavaScript, Python
* [Regex Analyzer/Composer](https://github.com/foo123/RegexAnalyzer) Regular Expression Analyzer and Composer for PHP, JavaScript, Python
* [GrammarTemplate](https://github.com/foo123/GrammarTemplate) grammar-based templating for PHP, JavaScript, Python
* [codemirror-grammar](https://github.com/foo123/codemirror-grammar) transform a formal grammar in JSON format into a syntax-highlight parser for CodeMirror editor
* [ace-grammar](https://github.com/foo123/ace-grammar) transform a formal grammar in JSON format into a syntax-highlight parser for ACE editor
* [prism-grammar](https://github.com/foo123/prism-grammar) transform a formal grammar in JSON format into a syntax-highlighter for Prism code highlighter
* [highlightjs-grammar](https://github.com/foo123/highlightjs-grammar) transform a formal grammar in JSON format into a syntax-highlight mode for Highlight.js code highlighter
* [syntaxhighlighter-grammar](https://github.com/foo123/syntaxhighlighter-grammar) transform a formal grammar in JSON format to a highlight brush for SyntaxHighlighter code highlighter
* [SortingAlgorithms](https://github.com/foo123/SortingAlgorithms) implementations of Sorting Algorithms in JavaScript
* [PatternMatchingAlgorithms](https://github.com/foo123/PatternMatchingAlgorithms) implementations of Pattern Matching Algorithms in JavaScript
* [CanvasLite](https://github.com/foo123/CanvasLite) an html canvas implementation in pure JavaScript
* [Rasterizer](https://github.com/foo123/Rasterizer) stroke and fill lines, rectangles, curves and paths, without canvaσ
* [Gradient](https://github.com/foo123/Gradient) create linear, radial, conic and elliptic gradients and image patterns without canvas
* [css-color](https://github.com/foo123/css-color) simple class to parse and manipulate colors in various formats
