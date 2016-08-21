title: 安卓 UC 内核 WebView 调试
date: 2015-09-24 15:57:40
tags:
 - UC
 - WebView
 - 移动端调试
categories: 
 - 前端技术
 - 调试
toc: true
description: 个人的调试方式有这么几种： 1. Chrome Emulator 2. 手机端浏览器调试 3. 手机端 Chrome + Inspector 调试（或者其他工具） 4. 手淘 + Inspector 调试

---

### 不同的调试方式

个人的调试方式有这么几种：

1. Chrome Emulator
2. 手机端浏览器调试
3. 手机端 Chrome + Inspector 调试（或者其他工具）
4. 客户端 + Inspector 调试

由于目前的 Chrome Emulator 渲染方式和手机端各浏览器并不是十分一致，因此这种方式适用于前期快速开发原型，在此之后，再转到真机或虚拟机浏览器调试。

此时此刻你很希望像 PC 那样可以使用 Debugger，高版本的 Chrome 提供了 Inspector ( 桌面端访问 chrome://inspect )，将设备与电脑通过 USB 线连接，并打开移动端 Chrome，可以看到如下所示内容：

![chrome inspect界面](https://img.alicdn.com/tps/TB1lW2jJFXXXXbYXFXXXXXXXXXX-663-335.jpg)

点击 inspect 即可进行调试

### 移动端 WebView 调试

当你要查看在客户端的真实情况，异常捕获，或者你需要使用 JSBridge，以及其他能力（例如拉出登陆框、分享等），一个真实的环境会为开发带来很多便利。

参考 UC 浏览器的调试：

1. 安装 ADB ( 安卓调试桥 )
2. 安装 APP 开发者版
3. 访问 UC 内置的 Debug 服务器

安装 ADB 是为了连接电脑与设备，使用其提供的端口映射功能（将本地端口映射到移动端本地端口），开发者版手淘内部会启动一个调试服务器（当启动WebView），端口为 9998，你可以访问此服务器来调试。

那么走一遍流程

##### 1. 安装 ADB

ADB 包含到 Android SDK 里，所以我们先安装 Android SDK，你可以使用 HomeBrew 快速安装 `$ brew install android-sdk`，或者开启人工智能模式 [Android SDK](http://developer.android.com/sdk/installing/index.html?pkg=tools)

> 我不确定 ADB 是否需要 JDK（严格来说只有开发阶段才会用到 JDK，如果需要也应该是 JRE 才对），我已经安装了 Java，如果不是拿刀架在我脖子上，我是肯定不会卸载了测试下的，遇到问题的同学可以点这个 [Java](https://www.java.com/)

我使用的 brew 安装，安装完遇到的第一个问题就是 执行 `adb` 找不到 Platform-tools，原因是 SDK 并未包含 Platform-tools 包，此时你需要 `$ open /usr/local/opt/android-sdk` 找到 tools 目录下的 android，执行它，会弹出 SDK 管理器，并安装 Platform-tools。

如果遇到 log 提示 "Failed to fetch URL https://..." 是因为 https 不可用（why?），此时点击工具栏 preferences，勾选 "Force https://... sources to be fetched using http://..." 即可。

这时执行 `$ adb devices`，应该可以看到有设备连接了，如果没有，执行

```
$ adb kill-server
$ adb start-server
```
并重新连接 USB

##### 2. 安装开发者版 APP

略

##### 3. 开始 Debug

手机打开任意页面，连接设备后，执行 `$ adb forward tcp:端口号 tcp:9998` 这时访问 127.0.0.1:端口号，会被代理到移动端 127.0.0.1:9998，这时就可以愉快的 Debug 了。

![debug界面](https://img.alicdn.com/tps/TB16.fEJFXXXXbFXXXXXXXXXXXX-858-243.jpg)

你也可以无线 Debug，移动端连接 WIFI，并连接设备，执行 `adb shell ifconfig wlan0` 获得设备 IP， 这时可以断开 USB，开始无线调试（你可以权衡下是否需要这么做）。

### Troubleshooting

1. **浏览器一直 pending**

   - 解决方法：彻底清理 APP 后台，重启应用（内置调试服务挂掉了）
   
2. **移动端一直打开页面失败**

   - 试试清理应用缓存，还不行就清理数据（只试了几百次就找到了解决办法）

### 最佳实践

将移动端代理设为localhost:电脑代理端口，并开启 chrome inspect，打开端口映射(port forwarding)，这与 adb 的映射正好反向，是将客户端的本地端口映射到 PC，这时可以使用 PC 的系统代理（你也可以手动输入IP）
