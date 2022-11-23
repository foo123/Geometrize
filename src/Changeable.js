// Changeable mixin
var Changeable = makeClass(null, {
    $changed: false,
    $cb: null,
    dispose: function() {
        this.$cb = null;
    },
    isChanged: function(isChanged) {
        if (arguments.length)
        {
            this.$changed = !!isChanged;
            return this;
        }
        else
        {
            return this.$changed;
        }
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
            if (!self.$cb) self.$cb = [];
            index = self.$cb.indexOf(cb);
            if (-1 === index) self.$cb.push(cb);
        }
        return self;
    },
    triggerChange: function() {
        var self = this;
        if (self.$cb) self.$cb.forEach(function(cb) {cb(self);});
        return self;
    }
});
