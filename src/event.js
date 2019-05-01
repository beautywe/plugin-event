import pkgInfo from '../package.json';

const eventSplitter = /\s+/;

const eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
        for (const key in name) {
            obj[action](...[key, name[key]].concat(rest));
        }
        return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
        const names = name.split(eventSplitter);
        for (let i = 0, l = names.length; i < l; i++) {
            obj[action](...[names[i]].concat(rest));
        }
        return false;
    }

    return true;
};

const triggerEvents = function(events, args) {
    let ev,
        i = -1,
        l = events.length,
        a1 = args[0],
        a2 = args[1],
        a3 = args[2];
    switch (args.length) {
        case 0:
            while (++i < l)(ev = events[i]).callback.call(ev.ctx);
            return;
        case 1:
            while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1);
            return;
        case 2:
            while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1, a2);
            return;
        case 3:
            while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
            return;
        default:
            while (++i < l)(ev = events[i]).callback.apply(ev.ctx, args);
    }
};

const _once = function(func) {
    let ran = false,
        memo;
    return function() {
        if (ran) return memo;
        ran = true;
        memo = func.apply(this, arguments);
        func = null;
        return memo;
    };
};

const Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on(name, callback, context) {
        if (!eventsApi(this.event, 'on', name, [callback, context]) || !callback) return this;
        this._events || (this._events = {});
        const events = this._events[name] || (this._events[name] = []);
        events.push({
            callback,
            context,
            ctx: context || this,
        });
        return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once(name, callback, context) {
        if (!eventsApi(this.event, 'once', name, [callback, context]) || !callback) return this;
        const self = this;
        var once = _once(function() {
            self.event.off(name, once);
            callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.event.on(name, once, context);
    },

    // Remove one or many callbacks.
    // If `context` is null, removes all callbacks with that function.
    // If `callback` is null, removes all callbacks for the event.
    // If `name` is null, removes all bound callbacks for all events.
    off(name, callback, context) {
        let retain,
            ev,
            events,
            names,
            i,
            l,
            j,
            k;
        if (!this._events || !eventsApi(this.event, 'off', name, [callback, context])) return this;
        if (!name && !callback && !context) {
            this._events = {};
            return this;
        }
        names = name ? [name] : Object.keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
            name = names[i];
            // eslint-disable-next-line no-cond-assign
            if (events = this._events[name]) {
                this._events[name] = retain = [];
                if (callback || context) {
                    for (j = 0, k = events.length; j < k; j++) {
                        ev = events[j];
                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                            (context && context !== ev.context)) {
                            retain.push(ev);
                        }
                    }
                }
                if (!retain.length) delete this._events[name];
            }
        }

        return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger(name) {
        if (!this._events) return this;
        const args = [].slice.call(arguments, 1);
        if (!eventsApi(this, 'trigger', name, args)) return this;
        const events = this._events[name];
        const allEvents = this._events.all;
        if (events) triggerEvents(events, args);
        if (allEvents) triggerEvents(allEvents, arguments);
        return this;
    },
};

module.exports = function event(){
    return {
        name: 'event',
        npmName: pkgInfo.name,
        version: pkgInfo.version,
        customMethod: Events,
    };
};