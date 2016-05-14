title: Node.js 子进程调试
tags:
  - JavaScript
  - Node.js
  - 调试
categories:
  - 前端技术
toc: true
date: 2016-05-14 22:22:31
description: 随着经济的发展，国内生产总值的不断提高，我们渐渐会发现，人类正处于一个尴尬的时代，工作占据了人们大部分的时间。由于宇宙中熵的总数不断增加，这个世界会不断变坏，这是不可逆的，我唯一能做的，是让这个过程再慢一些，这是为什么我决定写这篇文章。
-----------------------------------------------------------------------------------------------------------------------------------

#### 调试子进程的问题
随着经济的发展，国内生产总值的不断提高，我们渐渐会发现，人类正处于一个尴尬的时代，工作占据了人们大部分的时间。由于宇宙中熵的总数不断增加，这个世界会不断变坏，这是不可逆的，我唯一能做的，是让这个过程再慢一些，这是为什么我决定写这篇文章。

妇孺皆知，调试 Node.js 子进程是一个头疼的问题。举例来讲，当我们要调试插件 A，首先想到的是 console.log，这十分低效，许多人在月黑风高的晚上，调试代码到很晚。轻则威胁身体健康，带来颈椎病，肩周炎，重则妻离子散，家破人亡。

为什么会出现这样的情况？我们首先看一下插件 A 的启动方式：

```bash
# 插件 A 启动 Shell
/usr/local/bin/def -> ../lib/node_modules/@ali/def/bin/def
```

![](https://img.alicdn.com/tfs/TB1AqRYJVXXXXb5XXXXXXXXXXXX-580-123.png)

追踪到代码，我们可以看到启动一个插件的入口是这里

![](https://img.alicdn.com/tfs/TB1M4V0JVXXXXalXXXXXXXXXXXX-470-163.png)

这里通过 spawn 一个子进程，eval 类似 ``node --harmony -e require('/Users/smalldragonluo/.def/node_modules/def-cli/').run(); /usr/local/bin/def light tms`` 的代码启动插件。

#### 如何调试程序

家喻户晓，当我们要调试 Node.js 代码时，需要在启动时传入 **--debug[-brk]=端口号** 参数，这告诉程序进入待调试模式，或者在调试器连接前进入 suspend 状态。

然后，执行 ``node debug`` 进入调试器，例如：

```bash
# 通过 URI
node debug 127.0.0.1:5858
# 通过进程 Id
node debug -p 2929
```

然后你就开启了代码的调试之旅，命令列表见[这里](https://nodejs.org/dist/latest-v4.x/docs/api/debugger.html#debugger_breakpoints)。当你兴奋地把玩一阵之后，你意识到自己被玩弄了，这仍然十分不便，谁用谁知道，还不如用 console.log。既然如此，你可以改用 [node-inspector](https://github.com/node-inspector/node-inspector)，这是一个图形化调试工具，方便程度大大增加。首先发送 SIGUSR1 信号通知正在运行的 Node.js 进程进入调试模式，然后访问调试地址即可开始调试，体验尚可。

#### 更好的子进程调试方式

你已经知道，以上的方式与 WebStorm 的调试器相比，大概是自行车和玛莎拉蒂的区别。插件 A 的启动入口在 shell，因此不能享受到 WebStorm 的调试体验，那么，我们是否就无计可施了呢？

打开 WebStorm 的调试器配置面板

![](https://img.alicdn.com/tfs/TB10S0QJVXXXXamXpXXXXXXXXXX-724-180.png)

首先指定工作目录，也就是你执行 def 命令的目录，其次建立一个启动脚本，内容很简单，只有一行代码

```js
require('/usr/local/lib/node_modules/@ali/def/index.js').cli();
```

修改 `/usr/local/lib/node_modules/@ali/def/index.js` 中的

```js
args = ['--harmony', '-e', 'require(\'' + myDef1 + '\').run();']
```
为

```js
args = ['--debug-brk=' + Math.floor(Math.random()*(1<<16)), '--harmony', '-e', 'require(\'' + myDef1 + '\').run();']
```
至此，你可以使用 IDE 调试代码，世界开始变美好，天更蓝了，水更清了，树上的鸟儿也更大只了。

#### 远程调试

远程调试极大地方便了我们的生活，增添了许多乐趣。我们首先 ssh 到目标机器，启动对应进程的调试服务

![](https://img.alicdn.com/tfs/TB155NUJVXXXXa8XpXXXXXXXXXX-765-137.png)

可以看到 5858 端口已经启动，我么只需要将调试器连接到远程服务器即可。由于 Node.js 在 loopback 接口上监听端口，所以我们需要做端口映射

```bash
ssh -L port1:<remotehost1>:port2 username@remotehost2
```
验证通过后，端口映射成功，现在本机 127.0.0.1 的 port1 端口被 ssh 映射为 remotehost2 的 remotehost1 的 port2 端口。紧接着我们配置 WebStorm 的调试器，添加 Node.js Remote Debug，设置 host 为 127.0.0.1，port 为 port1，保存后开始调试，可以看到远程主机上的代码已经可以看到，双击打开代码，即可添加断点了。

![](https://img.alicdn.com/tfs/TB1MKJ7JVXXXXXcXXXXXXXXXXXX-466-352.png)

#### 参考链接

* [https://nodejs.org/dist/latest-v4.x/docs/api/debugger.html#debugger_breakpoints](https://nodejs.org/dist/latest-v4.x/docs/api/debugger.html#debugger_breakpoints)
* [https://www.jetbrains.com/help/webstorm/2016.1/running-and-debugging-node-js.html#remote_debugging](https://www.jetbrains.com/help/webstorm/2016.1/running-and-debugging-node-js.html#remote_debugging)