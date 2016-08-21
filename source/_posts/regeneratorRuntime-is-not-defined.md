title: regeneratorRuntime is not defined
tags:
  - JavaScript
  - Babel
  - Gulp
categories:
  - 前端技术
toc: true
date: 2016-01-25 22:09:02
description: 最近在开发团队自动化工具：一个基于 Node.js 的本地 SDK，和一个配套 web UI。其实本来想一个 jQuery 解决问题，同事说，用 React，大家都用这个，都说好。我说，那咱们还等什么？
---
#### 起因

最近在开发团队自动化工具：一个基于 Node.js 的本地 SDK，和一个配套 web UI。其实本来想一个 jQuery 解决问题，同事说，用 React，大家都用这个，都说好。我说，那咱们还等什么？
就这样最终选择了 React.js，然后理所当然地加上了 React Router，Redux，Webpack，ES6。为了和前端保持一致，服务端也跟着使用了 ES6，这是事件的起因。
 
在 OS X 上整个开发过程比较顺利，但由于外包同学需要使用 windows，所以我需要做兼容测试。当某一天我把 SDK 放到 windows 上运行的时候卧槽它居然！！你猜怎么着？？

居然跑不起来。跑起来我也就不用写了。

根据 stack 信息，一开始以为是 Babel 的问题，最后经过仔细排查，发现是 SDK 依赖的宿主环境，而这个环境我没办法修改，因此我只能另寻出路。

没法使用 babel/register，那就只能将 ES6 编译成 ES5，然后 polyfill 一下。

我使用的 Babel 版本为 5.8.3，默认提供转换所有已经支持的最新 ES 特性，6.x 需要手动安装需要使用的特性或使用预置集（preset）。目前提供有 6 个预置集，分别是

 * es2015
 * stage-0
 * stage-1
 * stage-2
 * stage-3
 * react

我选择了 es2015，包含丰富的插件，支持包括 arrow function，Generator function，以及 Node 4.x 目前并不支持的 Module import。

#### 经过

使用官方指定的 gulp-babel 编译后提示

```bash
ReferenceError: regeneratorRuntime is not defined.
```

我思索良久，仍不解心头之惑 —— 为什么，为什么他们要把一个变量定义的这么长？

凭着我的聪明才智，我翻看 build 之后的文件，发现每个头部都添加了 `'use strict;'`，难道，这就是祸乱的根源？

通过 Google 之，发现这个 [issue](https://phabricator.babeljs.io/T6676) 里有人遇到同样的问题。由于 es2015 已经自带了 transform-regenerator，所以我猜测由于严格模式导致 `regeneratorRuntime` 这个全局变量声明失败，我于是注释掉了

```bash
node_modules/babel-preset-es2015/node_modules/babel-plugin-transform-es2015-modules-commonjs/lib/index.js
```

第 130 行的 

```js
inherits: require("babel-plugin-transform-strict-mode")
```

运行成功！

也可以在需要使用 generator 的代码中引入 `babel-polyfill`，但这在 Babel 5 中是不必要的，不够整洁。

如果你不想转换 generator 函数，可以注释掉 `babel-plugin-transform-regenerator`。
