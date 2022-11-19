// Event Emitter interface
var EventEmitter = makeClass(null, {
    $dirty: false,
    isDirty: function(isDirty) {
        if (arguments.length)
        {
            this.$dirty = !!isDirty;
            return this;
        }
        else
        {
            return this.$dirty;
        }
    },
    $cb: null,
    $pb: null,
    dispose: function() {
        this.$cb = null;
        this.$pb = null;
    },
    onChange: function(cb, add) {
        var self = this, index;
        if ((false === add) && (is_function(cb) || is_string(cb)))
        {
            if (self.$cb)
            {
                index = is_string(cb) ? self.$cb.map(function(c){return Str(c.id);}).indexOf(cb); : self.$cb.indexOf(cb);
                if (-1 !== index) self.$cb.splice(index, 1);
            }
        }
        else if (is_function(cb))
        {
            if (!self.$cb)
            {
                self.$cb = [];
                self.$pb = function() {
                    self.$cb.forEach(function(cb) {cb(self);});
                };

            }
            index = self.$cb.indexOf(cb);
            if (-1 === index) self.$cb.push(cb);
        }
        return self;
    },
    triggerChange: function() {
        var self = this;
        if (self.$cb && self.$pb) self.$pb();
        return self;
    }
});
