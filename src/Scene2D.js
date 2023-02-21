/**[DOC_MD]
 * ### Scene2D
 *
 * scene container for 2D geometric objects
 *
 * ```javascript
 * const scene = Scene2D(containerEl, viewBoxMinX, viewBoxMinY, viewBoxMaxX, viewBoxMaxY);
 * scene.x0 = 20; // change viewport
 * scene.x1 = 100; // change viewport
 * scene.y0 = 10; // change viewport
 * scene.y1 = 200; // change viewport
 * const line = Line([p1, p2]);
 * scene.add(line); // add object
 * scene.remove(line); // remove object
 * scene.getIntersections(); // return array of points of intersection of all objects in the scene
 * scene.toSVG(); // render and return scene as SVG string
 * scene.toCanvas(); // render and return scene as Canvas
 * scene.toIMG(); // render and return scene as base64 encoded PNG image
 * ```
[/DOC_MD]**/
var Scene2D = makeClass(null, {
    constructor: function Scene2D(dom, x0, y0, x1, y1) {
        var self = this,
            svg = null,
            svgEl = null,
            objects = null,
            intersections = null,
            isChanged = true,
            renderSVG, renderCanvas, raf;

        if (!(self instanceof Scene2D)) return new Scene2D(dom, x0, y0, x1, y1);

        x0 = Num(x0);
        y0 = Num(y0);
        x1 = Num(x1);
        y1 = Num(y1);
        objects = [];
        svgEl = {};

        def(self, 'x0', {
            get: function() {
                return x0;
            },
            set: function(v) {
                v = Num(v);
                if (x0 !== v) isChanged = true;
                x0 = v;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'x1', {
            get: function() {
                return x1;
            },
            set: function(v) {
                v = Num(v);
                if (x1 !== v) isChanged = true;
                x1 = v;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'y0', {
            get: function() {
                return y0;
            },
            set: function(v) {
                v = Num(v);
                if (y0 !== v) isChanged = true;
                y0 = v;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'y1', {
            get: function() {
                return y1;
            },
            set: function(v) {
                v = Num(v);
                if (y1 !== v) isChanged = true;
                y1 = v;
            },
            enumerable: true,
            configurable: false
        });
        self.add = function(o) {
            if (o instanceof Object2D)
            {
                if (!HAS.call(svgEl, o.id))
                {
                    svgEl[o.id] = null;
                    objects.push(o);
                    isChanged = true;
                }
            }
            return self;
        };
        self.remove = function(o) {
            var el, index = objects.indexOf(o);
            if (-1 !== index)
            {
                el = svgEl[o.id];
                if (isBrowser && el && el.parentNode) el.parentNode.removeChild(el);
                delete svgEl[o.id];
                objects.splice(index, 1);
                isChanged = true;
            }
            return self;
        };
        self.getIntersections = function() {
            if (!objects || !objects.length) return [];
            if (isChanged || !intersections)
            {
                intersections = [];
                for (var k,i,j=0,n=objects.length; j<n; ++j)
                {
                    i = objects[j].intersectsSelf();
                    if (i) intersections.push.apply(intersections, i);
                    for (k=j+1; k<n; ++k)
                    {
                        i = objects[j].intersects(objects[k]);
                        if (i) intersections.push.apply(intersections, i);
                    }
                }
            }
            return intersections ? intersections.map(function(p) {
                return p.clone();
            }) : [];
        };
        self.dispose = function() {
            if (isBrowser && svg && svg.parentNode) svg.parentNode.removeChild(svg);
            if (isBrowser) window.cancelAnimationFrame(raf);
            svg = null;
            svgEl = null;
            objects = null;
            return self;
        };
        self.toSVG = function() {
            return SVG('svg', {
            'xmlns': ['http://www.w3.org/2000/svg', true],
            'viewBox': [Str(x0)+' '+Str(y0)+' '+Str(x1)+' '+Str(y1), true]
            }, false, objects.map(function(o){return o instanceof Object2D ? o.toSVG() : '';}).join(''));
        };
        self.toCanvas = function(canvas) {
            return isBrowser ? renderCanvas(canvas || document.createElement('canvas')) : canvas;
        };
        self.toIMG = function() {
            return isBrowser ? self.toCanvas(document.createElement('canvas')).toDataURL('image/png') : '';
        };

        renderSVG = function renderSVG() {
            if (!objects) return;
            if (!svg)
            {
                svg = SVG('svg', {
                'xmlns': ['http://www.w3.org/2000/svg', false],
                'style': ['position:absolute;top:0;left:0;width:100%;height:100%', false],
                'viewBox': [Str(x0)+' '+Str(y0)+' '+Str(x1)+' '+Str(y1), isChanged]
                }, null);
                dom.appendChild(svg);
            }
            else if (isChanged)
            {
                SVG('svg', {
                'viewBox': [Str(x0)+' '+Str(y0)+' '+Str(x1)+' '+Str(y1), isChanged]
                }, svg);
            }
            objects.forEach(function(o) {
                if (o instanceof Object2D)
                {
                    var el = svgEl[o.id];
                    if (null === el)
                    {
                        svgEl[o.id] = el = o.toSVG(null);
                        if (el) svg.appendChild(el);
                    }
                    else if (el && o.isChanged())
                    {
                        o.toSVG(el);
                    }
                    o.isChanged(false);
                }
            });
            isChanged = false;
            raf = window.requestAnimationFrame(renderSVG);
        };
        renderCanvas = function renderCanvas(canvas) {
            if (objects && canvas)
            {
                var w = stdMath.abs(x1 - x0), h = stdMath.abs(y1 - y0);
                canvas.style.width = Str(w)+'px';
                canvas.style.height = Str(h)+'px';
                canvas.width = w;
                canvas.height = h;
                var ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, w, h);
                ctx.translate(-x0, -y0);
                objects.forEach(function(o) {
                    if (o instanceof Object2D)
                    {
                        o.toCanvas(ctx);
                    }
                });
            }
            return canvas;
        };
        if (isBrowser) raf = window.requestAnimationFrame(renderSVG);
    },
    dispose: null,
    add: null,
    remove: null,
    getIntersections: null,
    toSVG: null,
    toCanvas: null,
    toIMG: null
});
Geometrize.Scene2D = Scene2D;
