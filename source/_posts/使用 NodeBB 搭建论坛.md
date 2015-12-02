title: 使用 NodeBB 搭建论坛
date: 2015-11-20 22:00:50
tags:
 - 论坛
 - NodeBB
 - Node.js
 - CentOS
 - Redis
 - Nginx
categories: 前端技术
toc: true
description: NodeBB 是一个基于 Node.js 的开源论坛，Metro UI 十分精美，它有以下特点：按照类目，标签，最新等进行帖子分类...

---

### NodeBB

[NodeBB](https://docs.nodebb.org/en/latest/) 是一个基于 Node.js 的开源论坛，Metro UI 十分精美，它有以下特点：

 - 按照类目，标签，最新等进行帖子分类
 - MarkDown 支持
 - 支持 WebSocket 实时推送消息
 - 强大的后台管理
 - 多样的皮肤
 - 哈哈，我就不凑字数了

虽然不如 [Discuz](http://www.discuz.net/forum.php) 功能强大，例如，没有验证码，但对于我来说已经够用了。

### ShowCase

请访问 **[www.smalldragonluo.com](//www.smalldragonluo.com)**

### Install

我的 ECS 是放在阿里云，系统为 CentOS 6.5，NodeBB 的安装方式见 [Installation by OS » CentOS 6/7](https://docs.nodebb.org/en/latest/installing/os/centos.html)

简单来说：

 - 首先需要安装 [Node.js](https://nodejs.org)，将编译好的 Node.js 放到环境变量即可
 - 然后是 [Redis](http://redis.io/)，我使用的源码安装，你也可以切换成 [MongoDB](https://www.mongodb.org/)，这也是被支持的
 - 哈哈，我就不凑字数了，你还是按照官方教程来吧... [Installation by OS » CentOS 6/7](https://docs.nodebb.org/en/latest/installing/os/centos.html)
 
请注意查看 NodeBB 的文档，Git 克隆下来后，先改下 NodeBB/install 里面的配置，例如修改页尾，论坛分类等等，你也可以安装后在管理界面修改

注意在安装 NodeBB 时可能会遇到这个错误：

```bash
$ error This version of node/NAN/v8 requires a C++11 compiler
```

原因是目前 CentOS 6.5 的云主机 C++ 编译器版本普遍较低，如你遇到安装时编译 mmmagic 模块报错，请升级 g++ 至 4.8 版本，包含 C++ 11。参考 [CentOS g++ 4.8 install](http://superuser.com/questions/381160/how-to-install-gcc-4-7-x-4-8-x-on-centos)

### 建议

- 请修改 Redis 密码以防止外部攻击，或者限制 IP 访问
- 增加 Nginx，主要是为了提高静态资源性能，防止 DDos 攻击，负载均衡（就是要这么认真）
- SFTP 我推荐一个 Mac 的软件：[Cyberduck](https://cyberduck.io/)

### 吐槽

NodeBB 通过 node_modules 的方式提供插件，造成静态资源耦合太紧。

