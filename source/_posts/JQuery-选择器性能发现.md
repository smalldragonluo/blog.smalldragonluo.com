title: jQuery 选择器性能发现
date: 2015-03-09 16:43
tags:
 - JavaScript
 - jQuery
 - 选择器
 - 性能
categories: 
 - 前端技术
description: 我做过假设，jQuery的find方法比传入整个选择器慢（上下文差距在一层以内），做出这种假设的原因是querySelectorAll等原生方法会比js实现快。今天发现并不是这样。经测试，在chrome中，此段代码产生如下结果：

---

我做过假设，jQuery的find方法比传入整个选择器慢（上下文差距在一层以内），做出这种假设的原因是querySelectorAll等原生方法会比js实现快。今天发现并不是这样。经测试，在chrome中，此段代码产生如下结果：

```js
var mv = $('#container');

console.time('a');

for(var i = 0; i < 5000; i ++) {
    $('#container a');
}

console.timeEnd('t');
console.time('t');

for(var i = 0; i < 5000; i ++) {
    mv.find('a');
}

console.timeEnd('t');
```

```
a: 302.646ms
a: 131.653ms 
```
