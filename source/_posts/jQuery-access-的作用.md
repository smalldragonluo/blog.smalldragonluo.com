title: jQuery.access 的作用
date: 2015-01-08 16:54
tags:
 - JQuery
categories: 
 - 前端技术
 - JavaScript
toc: true
description: jQuery.access 为 attr， prop， css， html等方法提供通用的键值设置 / 读取方法

---

jQuery.access为attr， prop， css， html等方法提供通用的键值设置 / 读取方法

```js
// 用于设置和获取集合的值的多用途方法
// 当value/s为function时，可以被选择地执行
access: function(elems, fn, key, value, chainable, emptyGet, pass) {
  var exec,
    bulk = key == null,
    i = 0,
    length = elems.length;

  // 如果key是属性集合，分多次为elements设置所有属性
  if (key && typeof key === "object") {
    for (i in key) {
      jQuery.access(elems, fn, i, key[i], 1, emptyGet, value);
    }
    chainable = 1; //此次调用为非get属性

    // 如果是单个属性，且value不为空（此次调用为非get属性）
  } else if (value !== undefined) {
    //value是否为可执行函数（如果是，则设置value为将element传入function执行后的返回值，否则为固定值）
    exec = pass === undefined && jQuery.isFunction(value);

    //如果未指定key，则具体的key依赖fn
    if (bulk) {
      // 如果需要设置的value依赖function执行后的返回值，则包装fn，将其上下文变为单个element，在#1处处理
      if (exec) {
        exec = fn;
        fn = function(elem, key, value) {
          return exec.call(jQuery(elem), value);
        };

        // 否则，fn上下文设为全部elements（jquery对象），在此处处理
      } else {
        fn.call(elems, value);
        fn = null;
      }
    }

    // 如果还未处理 #1
    if (fn) {
      for (; i < length; i++) {
        fn(elems[i], key, exec ? value.call(elems[i], i, fn(elems[i], key)) : value, pass);
      }
    }

    chainable = 1; //此次调用为非get属性
  }

  return chainable ?
    elems :

    // 为get调用，返回get值或指定空值
    bulk ?
    fn.call(elems) :
    length ? fn(elems[0], key) : emptyGet;
}
```
