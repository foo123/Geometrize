// generic scalar Value class
var Value = makeClass(EventEmitter, {
    constructor: function Value(v) {
        var self = this;
        if (v instanceof Value) return v;
        if (!(self instanceof Value)) return new Value(v);

        v = Num(v);
        self.dispose = function() {
            v = null;
            self.$super.dispose.call(self);
        };
        self.clone = function() {
            return new Value(v);
        };
        self.val = function(newv) {
            if (arguments.length)
            {
                newv = newv instanceof Value ? newv.val() : Num(newv);
                var isDirty = !is_almost_equal(v, newv);
                v = newv;
                if (isDirty && !self.isDirty())
                {
                    self.isDirty(true);
                    self.triggerChange();
                }
                return self;
            }
            else
            {
                return v;
            }
        };
        self.valueOf = function() {
            return v.valueOf();
        };
        self.toString = function() {
            return Str(v);
        };
        self.isDirty(true);
    },
    dispose: null,
    clone: null,
    val: null,
    valueOf: null,
    toString: null
});