title: JavaScript 模拟 Java 类继承
date: 2014-06-17 11:39
tags:
 - 继承
 - JavaScript
categories: 
 - 前端技术
description: javascript采用原型继承的方式继承一个类（javascript没有类这个概念，暂时这么称呼吧），但一些使用过Java的程序员可能习惯使用经典的类继承，但javascript原生并不支持这种方式，因此需要手动实现。我是通过定义一个定义类的函数实现的，由于javascript没有访问修饰符，因此如果需要使用到private成员，请使用闭包。

---

javascript采用原型继承的方式继承一个类（javascript没有类这个概念，暂时这么称呼吧），但一些使用过Java的程序员可能习惯使用经典的类继承，但javascript原生并不支持这种方式，因此需要手动实现。我是通过定义一个定义类的函数实现的，由于javascript没有访问修饰符，因此如果需要使用到private成员，请使用闭包。

```js
/*将一个对象的自有属性复制到另一个对象的方法*/
function merge(from, to){
  for(var i in from){
    if(from.hasOwnProperty(i)){
      to[i] = from[i];
    }
  }
}

/*用于定义一个类
 *参数：构造函数，继承的父类， 属性， 静态属性， 是否为单例模式
 */
function defineClass(constructor, parent, properties, statics, isSingleton){

  /*使用代理函数，这样父类采用this.xx定义的引用类型将每个实例独有*/
  var oldConstructor = constructor;
  
  /*如果为单例模式，保存实例，并在以后的调用中返回此实例*/
  if(isSingleton){
    var instance;
    constructor = function(){
      if(instance) return instance;
        parent.apply(this, arguments);
        oldConstructor.apply(this, arguments);
        instance = this;
      }
    } else {
      constructor = function(){
      parent.apply(this, arguments);
      oldConstructor.apply(this, arguments);
    }
  }

  /*设置原型属性，这意味着传入的构造函数的原型属性将被覆盖
   *重要：parent内部需要检测参数合理合法性
   */
  constructor.prototype = new parent();
  /*将自有属性复制到原型中
   *将静态属性复制到构造函数中，这意味着将不会继承parent的静态属性
   */
  merge(properties, constructor.prototype);
  merge(statics, constructor);
  
  /*将构造函数更改为当前构造函数
   *将parent的引用保留
   */
  constructor.prototype.constructor = constructor;
  constructor.prototype.parent = parent;
  return constructor;
}
```

注意，不能用此方法继承如Array等内置对象，如果你想通过定义一个类扩展Array的功能，那么在调用Array的某些方法时会出现问题，比如concat返回的数组直接包含两个对象，而不是包含两个对象中的元素。原因是虽然子类的原型链包含Array.prototype，但毕竟不是由Array直接构造，在调用某些方法时可能不会按照原始的方式执行。
