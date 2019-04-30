import { BtApp } from '@beautywe/core';
import test from 'ava';
import event from '../src/event';

function newAppUseingPlugin(){
    const app = new BtApp();
    const plugin = event();
    app.use(plugin);
    app.onLaunch();
    return { app, plugin };
}

test('use BtApp', (t) => {
    const { app, plugin } = newAppUseingPlugin();
    t.is(app._btPlugin.plugins[0].name, plugin.name);
    t.truthy(app.event);
});

test.cb('event.once and event.trigger', (t) => {
    const { app } = newAppUseingPlugin();
    const params = 'abcdefg';

    app.event.once('hello', (_params) => {
        t.is(_params, params);
        t.end();
    });

    app.event.trigger('hello', params);
});

test.cb('event.on', (t) => {
    const { app } = newAppUseingPlugin();
    const params = 'abcdefg';
    let counter = 0;

    app.event.on('hello', (_params) => {
        counter += 1;
        t.is(_params, params);
        if (counter >= 2) t.end();
    });

    app.event.trigger('hello', params);
    app.event.trigger('hello', params);
});

test('event.off', (t) => {
    const { app } = newAppUseingPlugin();
    const eventName = 'hello';

    app.event.on(eventName, () => {});
    t.truthy(app._events[eventName]);

    app.event.off(eventName);
    t.falsy(app._events[eventName]);
});