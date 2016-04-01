title: JavaScript 的原型及原型链
date: 2013-10-22 22:29
tags:
 - 原型
 - JavaScript
categories: 
 - 前端技术
toc: true
description: 许多人对JavaScript的原型及原型链仍感到困惑，网上的文章又大多长篇大论，令读者不明觉厉。本人小学时语文拿过全校第一名，我将用最简洁明了的文字介绍JavaScript的原型及原型链。

---

许多人对JavaScript的原型及原型链仍感到困惑，网上的文章又大多长篇大论，令读者不明觉厉。本人小学时语文拿过全校第一名，我将用最简洁明了的文字介绍JavaScript的原型及原型链。

#### 什么是原型

每一个对象都有原型，使用 __proto__ 标记，原型是一个对象的引用或 null（ Object.prototype 的原型为 null ），允许对象使用其原型所引用的对象中的变量。

```js
var fun = function(){};

fun.prototype.a = 1;

var obj = new fun();

obj.a;  //1
```

#### 原型的来源

对象的原型来自其构造函数的原型属性（用 prototype 标记）的引用。注意原型与原型属性是两个概念。Function 为实例（ function ）定义了原型属性，其中包含一个构造函数（默认是 function 对象自己，用于构造 function 自己的实例），因此所有 function 都有原型属性。Function 将自己的的原型属性的引用作为 function 的原型。 new 一个 function ，function 的实例便有了原型，指向 function 的原型属性。


有码

```js
var fun = function(){
    this.a= 1;
}

fun.prototype.b = 2;

var obj = new fun();

obj.a; //1
obj.b; //2
```

有图

![](/assets/215445_09Zx_992034.png)

解释

上面的代码定义了 fun 这个函数，其构造函数是 Function()，所以 fun 的原型就是 Function 的原型属性。Function 还为 fun 定义了属于 fun 的原型属性，所以 fun 既有原型又有原型属性。我们又为 fun 的原型属性定义了变量 b，所以能通过 fun 的实例 obj 找到 b，而 obj 由 fun 构造，所以 obj 被赋予了变量 a，这属于 obj 自己。原型属性也是对象，仍然有原型，是其构造函数的原型属性的引用。

#### 操作原型

##### 获取原型

```js
obj.__proto__; (IE 不支持)
Object.getPrototypeOf(obj); (IE 8及以下不支持)
```

##### 访问原型的变量

除了以上两种获取原型方式，还可以直接obj.attr;（不用我多说了吧）

##### 修改原型的变量

无法通过 ``obj.__proto__.attr = *; 或 Object.getPrototypeOf(obj).attr = *;`` 来修改原型的变量值，即无法修改原型，属于js内部特性。
你只能通过修改对象的构造函数的原型属性（prototype）来使对象的原型发生改变。如 ``fun.prototype.attr = *;`` 这将反应在 obj 上。
假设对象的原型含有 attr 这个属性，当通过 obj.attr 这种方式访问原型的变量，默认可以在原型内搜寻到 attr 变量，如果企图使用 obj.attr = *; 修改原型，js的处理方式是新建一个属于 obj 的属性 attr ，原型不会被修改（注意，如果 attr 是一个对象的引用，则指向的对象将会被修改）。再次访问 attr ，并不会访问到原型的 attr 变量。

#### 原型的作用

继承，如

```js
var fun = function(){}

fun.prototype = String.prototype;

new fun().split //function split() {[native code]}
```

问题每个对象都有原型属性吗？

```js
{}.prototype; //undefined

fun.prototype; // [object Object]
```

函数有原型属性，而像{}、new fun()这样的非函数对象则没有原型属性（它们也不用去构造实例），但可以手动为其创建原型属性，虽然这没什么意义。
总而言之，原型属性是其上级或者手动赋予的（fun.prototype = {}），不一定存在。作用是为函数的实例提供构造方法及继承变量。而原型是其构造函数的原型属性，供对象使用。

#### 原型链

通过自己的原型并向上寻找直到 ``Object.prototype.__proto__;`` 这条链就是原型链。 

#### 题外话

关于Function 与 Object 的关系，我暂时没有去深究，但看以下代码

```js
Function.prototype.constructor == Function //true

Function.constructor == Function //true

Object.constructor == Function //true

Object.getPrototypeOf(Object) == Object.getPrototypeOf(Function) //true

Object.prototype == Function.prototype //false
```

从代码看 Object 与 Function 都由相同的 constructor 创建 ，原型相同，但分配的原型属性则不一样。Object 由 Function 构造而来，Function 的原型属性的构造函数即自身，这可以理解，但 Function 的构造函数也是自身？这种语言的内部机制似乎没必要研究，但我们要知道如何通过原型达到继承的目的。

如有不妥，请大侠指正。


 

 

 
