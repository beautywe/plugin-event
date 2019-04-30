
# 介绍

## Version
[![NPM Version](https://img.shields.io/npm/v/@beautywe/plugin-event.svg)](https://www.npmjs.com/package/@beautywe/plugin-event) [![NPM Downloads](https://img.shields.io/npm/dm/@beautywe/plugin-event.svg)](https://www.npmjs.com/package/@beautywe/plugin-event) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@beautywe/plugin-event.svg)

## Unit Test Coverage

```
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |    66.67 |    60.66 |      100 |    77.63 |                   |
 event.js |    66.67 |    60.66 |      100 |    77.63 |... 49,109,110,122 |
----------|----------|----------|----------|----------|-------------------|
```

## Feature
1. 发布/订阅

# 安装

```
$ npm i @beautywe/plugin-event
```

```javascript
import { BtApp } from '@beautywe/core';
import event from '@beautywe/plugin-event';

const app = new BtApp();
app.use(event());
```

# 使用

## 注册事件监听器

```javascript
app.event.on('hello', msg => console.log(msg));

app.event.trigger('hello', 'I am jc');
// 输出 I am jc

app.event.trigger('hello', 'I am david');
// 输出 I am david
```

## 注册一次性的事件监听器

```javascript
app.event.once('hello', msg => console.log(msg));

app.event.trigger('hello', 'I am jc');
// 输出 I am jc

app.event.trigger('hello', 'I am david');
// 啥都不会发生
```

## 注销与清除事件
```javascript
// 注销指定事件的所有监听器
app.event.off('event');

// 注销所有事件的所有监听器
app.event.off();
```

# 其他

## 宿主独立的事件队列

该插件的实现，会在宿主的 `theHost._event` 中存储事件队列。
这就意味着，多个宿主都引入 event 插件，它们的事件都是相互独立的。

```javascript
const page = new BtPage();
page.use(event());

const app = new BtApp();
app.use(event());

page.event.on('hello', msg => ...);

app.event.trigger('hello');
// 啥都不会发生
```

## 事件队列的销毁

根据 event 的实现原理，如果宿主实例被销毁了，事件队列同样会被销毁。

例如在 A 页面引入了 event，并且注册了很多事件，如果 A 页面被微信小程序环境销毁了，那么事件队列也会被销毁。