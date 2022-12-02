// Plane
// scene container for 2D geometric objects
var Plane = makeClass(null, {
    constructor: function Plane(dom, width, height) {
        var self = this,
            svg = null,
            svgEl = null,
            objects = null,
            isChanged = true,
            render, raf;

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
                if (isBrowser && el) el.parentNode.removeChild(el);
                delete svgEl[o.id];
                objects.splice(index, 1);
                isChanged = true;
            }
            return self;
        };
        self.dispose = function() {
            if (isBrowser && svg && svg.parentNode) svg.parentNode.removeChild(svg);
            if (isBrowser) cancelAnimationFrame(raf);
            svg = null;
            svgEl = null;
            objects = null;
            return self;
        };
        self.toSVG = function() {
        };
        render = function render() {
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
            raf = requestAnimationFrame(render);
        };
        if (isBrowser) raf = requestAnimationFrame(render);
    },
    dispose: null,
    add: null,
    remove: null,
    toSVG: null
});