title: Process-Killer，an Alfred Workflow
date: 2015-11-29 20:39
tags:
 - Alfred
categories: 
 - 前端技术
 - 实用工具
description: 
---

[Alfred](https://www.alfredapp.com/) 是一个 Mac 上的效率工具，官网对其的定义是：
> Alfred is an award-winning app for Mac OS X which boosts your efficiency with hotkeys and keywords. Search your Mac and the web effortlessly, and control your Mac using customised actions with the Powerpack.
> Alfred 是一个 Mac 上的获奖应用，可以通过快捷键和关键字提高你的效率，除此之外，还可以高效地搜索本地和网络，通过 Powerpack 自定义动作控制你的电脑。

#### 什么是 Process-Killer？

回到正题，Process-Killer 是一个我编写的 Alfred 插件（其准确的定义应该是 **customised actions**），功能是根据你输入的进程名称或者 PID 或者端口号结束对应进程。

例如

![](https://camo.githubusercontent.com/a2e1ceee9d2199adcca3a9f3118da1682d8cc4a7/68747470733a2f2f696d672e616c6963646e2e636f6d2f7470732f5442314b5545414b465858585861735870585858585858585858582d3538342d3232332e6a7067)

如你所见，输入关键字 kill，会进入匹配模式，你可以输入进程名称，PID 或者 -i 端口号，列表会显输出对应的进程，选中并确定，一个进程就将殒命，消失于宇宙的浩瀚之中（我决定以后给他加上一声惨叫，当然这是开玩笑的）。
你可能注意到，每个 item 的下方会显示此进程运行的参数，这对于运行多个相同的命令来说是很有帮助的。例如你打开了多个 Node.js 进程，通过这个插件可以很方便地进行区分。

#### Install

如何安装呢？

1. 首先查看 [Process-Killer](https://github.com/smalldragonluo/process-killer) 仓库，下载 **Process Killer.alfredworkflow** 文件
2. 打开 Alfred 面板，点设置，进入 Workflow，将 **Process Killer.alfredworkflow** 拖入左侧列表，至此，安装完成，就是这么轻松，就是这么简单。

#### 工作原理

这个插件使用了 Node.js 作为开发语言，具体工作流程打开 Alfred 面板可以看到：

![](/assets/C6671052-55E6-4EEA-A5EE-FCD9C8D93E17.png)

看到这里你肯定会惊讶：『这个图标真他妈好看』。真不好意思，这是我画的，你可以在其他产品中使用这枚图标，这是免费的。

##### 内容过滤

插件的入口是一个 Script Filter，顾名思义，是一个脚本过滤器，用于生成可以显示在面板的内容，出此之外还有 keyword，File Filter 等。

首先，Script Filter 通过 shell 调用了 Node.js 服务
   
```
/usr/local/bin/node <<-'CODE'
require("./processFilter")("{query}");
CODE
```
其中，``query`` 是面板传递的参数，这一步的目地是要通过 Node.js 生成可供面板显示的内容数据，输出格式为 XML，这里我使用了 [xtpl](http://npm.taobao.org/package/xtpl) 来输出，XML 格式大家看代码就知道意思了。
我还是提一下吧，我并不是为了凑字数。一个简单的 XML 格式是这样的：

```xml
<?xml version="1.0"?>
<items>
  {{#each(items)}}
  <item uid="{{name}}" arg="{{pid}}" valid="yes">
    <title>{{name}}</title>
    <subtitle>{{args}}</subtitle>
    <icon {{#if(isApp)}}type="fileicon"{{/if}}>{{icon}}</icon>
  </item>
  {{/each}}
</items>
```

其中，uid 是用来标记 item 的唯一属性，选择次数越多，会越将其靠前显示；arg 是传递到下一步的参数；valid 代表可以选定，你可以输出一个不可选定的 item 用来提示用户信息。
``type="fileicon"`` 说明这是一个应用，可以直接使用 APP 的图标，value 为 APP 路径。

如何抽出进程的 command 与 args 是个问题，因为 shell 输出的字段以空格分割，而 command 本身也包含空格，因此我使用 child_process 执行了两次 ps 命令，分别取出 command 与 args，并将 args 做为 map 通过 PID 查询。  

##### 执行动作

Run Script 步骤会接受某个 item 的参数 arg，这个 item 是面板选定的元素。接下来执行另一段代码：
   
```
/usr/local/bin/node <<-'CODE'
require("./action")("{query}");
CODE
```
   
这段代码会根据 PID，对此进程发送信号 **TERM(termination signal)**，5 秒后发送信号 **KILL(non-ignorable kill)**。

#### 后记

其实，我并不用太多 Alfred 的功能，大部分自带的 Spotlight 也能做，唯一使用的就只有 Workflows 了，这对开发来说还是比较方便的，希望这个插件可以帮助到你~

#### 参考链接

[ps(1) Mac OS X Manual Page](https://developer.apple.com/library/prerelease/mac/documentation/Darwin/Reference/ManPages/man1/ps.1.html)
[Alfred Workflows for Advanced Users](http://computers.tutsplus.com/tutorials/alfred-workflows-for-advanced-users--mac-60963)
