title: JavaScript 的垃圾回收与内存泄露
date: 2014-06-16 23:33
tags:
 - 垃圾回收
 - 内存泄露
 - JavaScript
categories: 
 - 前端技术
 - JavaScript
toc: true
description: JavaScript采用垃圾自动回收机制，运行时环境会自动清理不再使用的内存，因此javascript无需像C++等语言一样手动释放无用内存。

---
#### GC 方式
JavaScript采用垃圾自动回收机制，运行时环境会自动清理不再使用的内存，因此javascript无需像C++等语言一样手动释放无用内存。
在这之前先说一下垃圾回收的两种方式：引用计数与标记清除。
##### 引用计数
引用计数方式会为每个已分配内存单元设置计数器，当计数器减少到0的时候就意味着该单元无法再被引用，将会被清除。
有一个问题是，当存在循环引用时，内存单元的计数器将永远不为0，内存的释放会比较复杂（需要使用到弱引用）。

```js
obj.val = obj2;
obj2.val = obj;
```
##### 标记清除
标记清除方式维护一条链表，当变量进入scope时被加入这条链表，移出scope时被从链表剔除。当gc被激活时，首先为每个变量打上一个标记，然后清除存在于那条链表的变量的标记以及变量引用的成员的标记。最后，不再使用到的变量仍旧被gc标记着，将被释放，包括循环引用。
如果一段不再使用的内存未得到回收，将导致内存泄露， 它将一直占据着内存而无法被利用，可能造成系统运行缓慢，浏览器崩溃等问题。
关于浏览器的javascript实现使用哪种回收机制，众说纷纭，感觉贵圈好乱。
我google了一下，http://www.ibm.com/developerworks/web/library/wa-memleak/?S_TACT=105AGX52&S_CMP=cn-a-wa 提到IE以及火狐都使用引用计数的机制回收DOM对象， http://blogs.msdn.com/b/ericlippert/archive/2003/09/17/53038.aspx 说JScript采用 nongenerational mark-and-sweep garbage collector（一种标记清除），还有资料提到现代浏览器都使用标记清除回收javascript垃圾。总结为，浏览器回收JavaScript内存采用标记清除，使用引用计数回收宿主对象(如Dom、Bom、ActiveX Object)。
根据我在IE上做的测试，javascript对象间的循环引用不会引发内存泄露。

```js
setInterval(function(){
  for(var i = 0; i < 100000; i++){
    var obj = {}, obj2 = {};
    obj.val = obj2;
    obj2.val = obj;
  }
}, 10);
```

#### 内存泄露

内存使用呈周期性变化，一直稳定，看来不用担心javascript对象的循环引用问题。
既然Dom采用引用计数回收内存，那是否存在内存泄露问题？

```js
var nodeHold = [],
    interval = setInterval(function(){
      for(var i = 0, length = 1000; i < length; i++){
        var node = document.createElement("div"),
        obj = {};
        node.val = obj;
        obj.val = node;
        document.body.appendChild(node);
        document.body.removeChild(node);
      }
}, 500);
```

在IE7与IE8上，内存直线上升。
与 http://blogs.msdn.com/b/ericlippert/archive/2003/09/17/53038.aspx 所称一致，原因是javascript的垃圾回收管不了Dom对象，且Dom使用引用计数回收方式，导致循环引用无法回收。前提是Dom必须先加到文档树再删除（我猜测是为真正的Dom对象分配内存，而这不属于javascript）。
要注意的是，IE9+并不存在循环引用导致Dom内存泄露问题，可能是微软做了优化，或者Dom的回收方式已经改变。
