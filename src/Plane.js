// Plane
// scene container for 2D geometric objects
var Plane = makeClass(null, {
    constructor: function Plane(dom, width, height) {
        var self = this, svg = null, objects = null, isChanged = false,
            onArrayChange, disposeObjects;
        
        if (!(self instanceof Plane)) return new Plane(dom, width, height);
        width = stdMath.abs(Num(width));
        height = stdMath.abs(Num(height));
        onArrayChange = function onArrayChange(changed) {
            isChanged = true;
        };
        disposeObjects = function disposeObjects(objs, remove) {
            unobserveArray(objs);
            if (remove)
            {
                objs.forEach(function(obj) {
                    svg.removeChild(document.getElementById(obj.id));
                });
            }
        };
        Object.defineProperty(self, 'width', {
            get() {
                return width;
            },
            set(w) {
                w = stdMath.abs(Num(w));
                if (width !== w) isChanged = true;
                width = w;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'height', {
            get() {
                return height;
            },
            set(h) {
                h = stdMath.abs(Num(h));
                if (height !== h) isChanged = true;
                height = h;
            },
            enumerable: true
        });
        Object.defineProperty(self, 'objects', {
            get() {
                return objects;
            },
            set(objects) {
                if (_objects !== objects)
                {
                    if (is_array(_objects))
                    {
                        disposeObjects(_objects, true)
                    }

                    if (is_array(objects))
                    {
                        _objects = observeArray(objects);
                        _objects.onChange(onArrayChange);
                        isChanged = true;
                    }
                    else if (null == objects)
                    {
                        _objects = null;
                    }
                }
            },
            enumerable: true
        });
        self.dispose = function() {
        };
        self.toSVG = function(svg) {
            var self = this;
            return SVG('svg', {
                'xmlns': ['http://www.w3.org/2000/svg', false],
                'viewBox': ['0 0 '+Str(self.width)+' '+Str(self.height)+'', false]
            }, arguments.length ? svg : false);
        };
    },
    dispose: null
});