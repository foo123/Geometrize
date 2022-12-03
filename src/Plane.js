// Plane
// scene container for 2D geometric objects
var Plane = makeClass(null, {
    constructor: function Plane(dom, width, height) {
        var self = this,
            svg = null,
            canvas = null,
            svgEl = null,
            objects = null,
            intersections = null,
            isChanged = true,
            renderSVG, renderCanvas, raf;

        if (!(self instanceof Plane)) return new Plane(dom, width, height);

        width = stdMath.abs(Num(width));
        height = stdMath.abs(Num(height));
        objects = [];
        svgEl = {};

        def(self, 'width', {
            get: function() {
                return width;
            },
            set: function(w) {
                w = stdMath.abs(Num(w));
                if (width !== w) isChanged = true;
                width = w;
            },
            enumerable: true,
            configurable: false
        });
        def(self, 'height', {
            get: function() {
                return height;
            },
            set: function(h) {
                h = stdMath.abs(Num(h));
                if (height !== h) isChanged = true;
                height = h;
            },
            enumerable: true,
            configurable: false
        });
        self.add = function(o) {
            if (o instanceof Primitive)
            {
                if (!HAS.call(svgEl, o.id))
                {
                    svgEl[o.id] = undef;
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
            if (isBrowser && canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
            if (isBrowser && svg && svg.parentNode) svg.parentNode.removeChild(svg);
            if (isBrowser) window.cancelAnimationFrame(raf);
            canvas = null;
            svg = null;
            svgEl = null;
            objects = null;
            return self;
        };
        self.toSVG = function() {
            return SVG('svg', {
            'xmlns': ['http://www.w3.org/2000/svg', true],
            'viewBox': ['0 0 '+Str(width)+' '+Str(height)+'', true]
            }, false, objects.map(function(o){return o instanceof Primitive ? o.toSVG() : '';}).join(''));
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
                'style': ['position:absolute;width:100%;height:100%', false],
                'viewBox': ['0 0 '+Str(width)+' '+Str(height)+'', isChanged]
                }, null);
                dom.appendChild(svg);
            }
            else if (isChanged)
            {
                SVG('svg', {
                'viewBox': ['0 0 '+Str(width)+' '+Str(height)+'', isChanged]
                }, svg);
            }
            objects.forEach(function(o) {
                if (o instanceof Primitive)
                {
                    var el = svgEl[o.id];
                    if (undef === el)
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
                canvas.style.width = Str(width)+'px';
                canvas.style.height = Str(height)+'px';
                canvas.setAttribute('width', Str(width)+'px');
                canvas.setAttribute('height', Str(height)+'px');
                var ctx = canvas.getContext('2d');
                ctx.fillStyle = 'transparent';
                ctx.fillRect(0, 0, width, height);
                objects.forEach(function(o) {
                    if (o instanceof Primitive)
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
Geometrize.Plane = Plane;
