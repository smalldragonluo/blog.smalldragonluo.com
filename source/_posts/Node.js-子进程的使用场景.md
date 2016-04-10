title: Node.js 子进程的使用场景
tags:
  - JavaScript
  - Node.js
categories:
  - 前端技术
toc: true
date: 2016-03-13 16:19:12
description: child_process 模块为 Node.js 提供了产生子进程的能力，本文将对其中的几种方案分别进行使用场景的讨论。
------------
### 简介
child_process 模块为 Node.js 提供了产生子进程的能力，本文将对其中的几种方案分别进行使用场景的讨论。

### 方案
#### spawn()
**spawn()** 作为最核心的方法，提供了丰富的配置，足以应对各种场景。child_process 产生子进程的能力来源于 spawn 方法，其它方法都是基于此方法的不同实现。我们先说这个方法。

**child_process.spawn(command[, args][, options])**

* **command** &lt;String&gt; 命令
* **args** &lt;Array&gt; 字符串参数
* **options** &lt;Object&gt; 配置项
 
其中，**command** 指的是可执行文件的路径，如果可执行文件处于环境变量 **&#36;PATH** 指向的目录中，则目录可以省略(执行 `echo $PATH` 查看目录)。 **options** 中以下几个参数需要注意:

 * **cwd &lt;String&gt;** 工作目录, 虽然你可以通过 `process.chdir()` 改变工作目录，但仍然建议使用此参数指定，当你提供的服务需要在多个目录切换时，并发访问会造成不可预料的结果。
 * **stdio &lt;Array&gt; | &lt;String&gt;** 指定标准输入输出与错误，其值主要有 `'pipe'`、 `'ipc'`、`object <Stream>`、`fd <Number>`、`'inherit'`、`'ignore'`。
   * 当值为 `'pipe'`，子进程的的 IO 将会以管道的方式传输(示例稍后给出)，否则，子进程的 IO Stream 为 `null`。
   * 当值为 `'ipc'`，子进程与父进程之间会创建一条 IPC 管道，你可以通过 `send()` 方法与监听 `'message'` 事件进行消息与 fd 的传输。
   * 当值为实现了 **Stream** 接口的对象，子进程 IO 将会与之相对应，例如传递 process.stdin。同样的，传递 File Descriptor 也会被映射为 **Stream** 对象。例如，使用 `fs.open()` 获取一个文件描述符，或者传递 0、1、2，这分别是当前进程的 stdin，stdout，stderr 的文件描述符。
  * 当值为 `'inherit'`，子进程会直接使用当前进程的 IO。例如将子进程的消息打印到父进程中，或者复用父进程的输入流。
 **ignore** 会将子进程的 IO 指向 `/dev/null`。

例如，下载一个文件：

```js
var fs = require('fs');
var childProcess = require('child_process');

var cp = childProcess.spawn('/usr/bin/curl', ['https://img.alicdn.com/任意内容/TB1uq2BIFXXXXbFXpXXXXXXXXXX_!!0-item_pic.jpg']);

cp.stdout.pipe(fs.createWriteStream('/Users/username/Downloads/test.jpg'));
```

##### 子进程独立
当你希望父进程执行结束退出后，子进程仍可以保持运行，你需要使用到 `process.unref()` 方法。
正常情况下，父进程需要等待子进程执行结束后才能退出，使用 `process.unref()` 方法会把子进程从父进程的 event loop 中剔除，达到独立运行的效果。
但这并不是完全的进程独立，如果父进程未执行结束，键入 **command + C** 会将子进程一并结束。因为 **command + C** 会对整个进程组发送 **SIGINT** 信号，子进程也会捕获这个信号。如需避免这种情况，可以在 **options** 中配置 **detached** 为 `true`。子进程会运行在独立的进程组与 session 中，成为 leader。从而屏蔽了 **SIGINT** 信号。
如果子进程使用了父进程的 IO，调用 `unref()` 方法会结束子进程，无法达到独立运行的效果。

例如

```js
var childProcess = require('child_process');

var cp = childProcess.spawn('/Users/smalldragonluo/somewhere/node/bin/node', ['./index.js'], {
  stdio: 'ignore',
  detached: true
});

cp.unref();
```

#### exec()
这个方法会产生一个 shell，和 spawn 不同的是，它关注的是执行的结果，而不是过程中的 IO 通信。因此它提供了一个默认最大值为 200 KB 的缓冲区。

**child_process.exec(command[, options][, callback])**

命令的参数与 shell 类似，使用空格分隔。这并不是一个十分安全的操作，如果使用不当，你可能会迎来一个新的人生低谷。可以想到的例子是

```js
/**
 * 安全地删除一个文件
 * @param dir 
 */
 function rmFileSafely(dir){
   exec('rm -rvf ' + dir);
 }
```

如果传入 `'/usr /lib/nvidia-current/xorg/xorg'`，这就酿成了一出惨剧。你可以改用通过 **Array** 传递参数的方案，例如 `execFile()`（后面会提到）。

很多人看到这段代码肯定会情难自控地放到自己电脑上跑一遍，出于人道主义，也为了避免不必要的纠纷，我不建议你这么做。

如果你曾经遇到 `Error: stdout maxBuffer exceeded.` 这个错误，说明当前场景并不适合使用 exec 方法。增加 maxBuffer 只是缓兵之计。

因为此方法产生了一个 shell，所以你可以使用 [I/O redirection](http://www.tldp.org/LDP/abs/html/io-redirection.html)，[file globbing](http://www.tldp.org/LDP/abs/html/globbingref.html) 等特性。

#### execFile()
此方法与 exec 类似，但并不会产生一个 shell，性能上稍好。

**child_process.execFile(file[, args][, options][, callback])**

命令参数以数组的方式传递，这更加安全。

#### fork()
此方法的特点是可以直接传递模块路径，并且可以使用 **execPath** 指定 Node.js 的可执行文件地址，你可以很方便的切换 Node.js 版本。

**child_process.fork(modulePath[, args][, options])**

除此之外，设置 **silent** 为 `true` 可以使子进程不使用父进程的 IO，世界瞬间清净了，掉根针都听得见。
使用 `fork()` 方法会创建 IPC chanel，这是进程间通信的条件。Cluster 模块就使用此方法创建工作进程。
当然，你会发现，不只是 `fork()` 方法才能够指定 Node.js 的执行路径，但相比 `spawn()`, `fork()` 可能会带来更低的因创建进程带来的性能消耗。

### 小结
那么，应该如何选择这几种方案呢？我们已经知道，子进程 powered by spawn，其它的方法只是不同的实现。
当你仅仅希望得到一条命令的执行结果，并且能够预料到结果规模时，你应该使用 `exec()`，就是那么轻松，就是那么简单。
如果场景与 `exec()` 类似, 并且命令参数由用户指定，那么 `execFile()` 是个不错的选择。这带来了更少的安全问题，类似 XSS 这种头疼的概念将一去不复返，性能也会更优秀。
如果你希望自由切换 Node.js 版本, 并且希望执行的是一个存在的模块，并拥有与进程通信的能力，那你还在等什么？赶紧用 `fork()` 吧。
如果你仍然无法得到满足，那你只能选择 `spawn（）` 了。

### More

* 除了上述几个方法外，还有对应的同步版本，如 `spawnSync()`、`execSync()`、`execFileSync()`，这里就不再讨论。同步版本提供了更佳的编程体验，敲击键盘如丝般顺滑，让人欲仙欲死。如果你没有 IO 阻塞的顾虑，推荐使用同步版本。
* 如果你开启了大量的子进程，机器可能会变得十分缓慢，这种现象是正常的，一般宕机都会有这种前兆。每个子进程的创建都会消耗大约 15 MB 的内存空间（tested on my OSX x64），因此，请慎重使用子进程。
* 跨平台需要注意的地方，这里并没有提到，例如 `spawn()` 方法在 windows 平台需要指定可执行文件为 `'cmd'` 等。

### 参考

[https://nodejs.org/api/child_process.html](https://nodejs.org/api/child_process.html)
[https://www.win.tue.nl/~aeb/linux/lk/lk-10.html](https://www.win.tue.nl/~aeb/linux/lk/lk-10.html)
