title: JavaScript 实现动画插件
date: 2014-07-22 17:34
tags:
 - 缓动函数
 - 动画
 - JavaScript
categories: 
 - 前端技术
toc: true
description: 在这之前，大家应该了解了缓动函数（Easing Functions）的概念：动画的每一帧需要计算一次元素样式，如果样式改变则需要重绘屏幕。细一点讲，当我们每调用一次计时器函数，需要通过向缓动函数传入一些动画上下文变量，从而获取到元素的某个样式在当前帧合理的值。

---

#### 缓动函数的概念

在这之前，大家应该了解了缓动函数（Easing Functions）的概念：

动画的每一帧需要计算一次元素样式，如果样式改变则需要重绘屏幕。细一点讲，当我们每调用一次计时器函数，需要通过向缓动函数传入一些动画上下文变量，从而获取到元素的某个样式在当前帧合理的值。

我所了解的缓动函数实现方式有两种，一种是tbcd方式（Robert Penner's Easing Functons）

```js
function(t,b,c,d){
  return c*t/d + b;
}
```

t: timestamp 以毫秒（ms）为单位，指从第一帧到当前帧所经历的时间
b: beginning position，变量初始值
c: change 变量改变量（即在整个动画过程中，变量将从 b 变到 b + c）
d: duration 动画时间

另一种是 mootools 的单参数方式，由于我没了解过，这里就不说了，这里主要说一下第一种方式。

整个动画模块为Animation，其接受多个参数（元素， 动画样式， 持续时间[， 缓动函数名][， 回调函数]），是一个构造函数，调用方式为：

```js
var animation = new Animation(test, {width: {value: "500px"}, 500, "sin", function(){
  console.log("complete");
});

animation.stop();
```

其中，每个样式属性可单独指定持续时间与缓动函数名，但回调函数必须等到所有动画结束才调用。

#### Animaion 模块

Animaion 模块定义如下：

```js
var Animation = function() {

  var debug = false, //如果debug，遇到异常将抛出
    unit = {}, //样式存取函数，详见下方each函数
    fx = { //缓动函数
      linear: function(currentTime, initialDistance, totalDistance, duration) { //自带一个线性缓动函数
        return initialDistance + (currentTime / duration * totalDistance);
      }
    },
    getTime = function() { //获取当前时间（ms或更精确）
      return performance.now && performance.now() || new Date().getTime();
    },
    executorCanceler = window.cancelAnimationFrame, //取消帧函数
    executor = window.requestAnimationFrame //帧执行函数
    || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || function() {
      var callbacks = [];
      ! function frame() {
        var oldTime = getTime(),
          tmp = callbacks,
          callbacks = [];

        for (var i = 0, length = tmp.length; i < length; i++) {
          tmp[i].callback(oldTime);
        }

        var currentTime = getTime(),
          delayTime = Math.max(16.66 - currentTime + oldTime, 0);

        setTimeout(frame, delayTime);
      }();

      executorCanceler = function(id) {
        for (var i = 0, length = callbacks.length; i < length; i++) {
          if (callbacks[i].id === id) callbacks.splice(i, 1);
        }
      }

      return function(callback) {
        var context = {
          callback: callback,
          id: Math.random()
        };
        callbacks.push(context);
        return context.id;
      }
    }(),
    /*
     * 为每个属性运行此函数，类似于启动一个线程（虽然不是真正的线程）
     */
    animate = function(element, attribute, distances, duration, timingFunction, completeCallback) {
      var oldTime = getTime(),
        animationPassedTime = 0,
        executorReference = executor(function anonymous(currentTimeStamp) {
          animationPassedTime = currentTimeStamp - oldTime;

          var computedValues = []; //computedValues为缓动函数计算值，可能返回数值或者数组（按动画属性不同，比如rgb）

          if (animationPassedTime >= duration) {
            if (distances.length > 1) {
              for (var j = 0, length = distances.length; j < length; j++) {
                computedValues.push(distances[j][0] + distances[j][1]);
              }
            } else {
              computedValues = distances[0][0] + distances[0][1];
            }

            stop();
          } else {
            if (distances.length > 1) {
              for (var i = 0, length = distances.length; i < length; i++) {
                computedValues.push(fx[timingFunction](animationPassedTime, distances[i][0], distances[i][1], duration));
              }
            } else {
              computedValues = fx[timingFunction](animationPassedTime, distances[0][0], distances[0][1], duration);
            }

            animationPassedTime = getTime() - oldTime;
            executorReference = executor(anonymous);
          }
          unit[attribute].setter(element, computedValues);
        }, Math.random()),
        completed = false,
        stop = function() {
          executorCanceler(executorReference);
          completeCallback(); //执行回调函数
        };

      return {
        stop: stop
      }
    },
    /*
     * Animation 引用的函数，此函数返回一个包含所有动画属性的控制对象（如停止操作），因此可以采取函数调用或者new的方式创建一个动画对象
     */
    init = function(element, animationVars, duration, timingFunction, callback) {

      var animateQueue = {},
        animationCount = 0,
        animationCompletedCount = 0,
        completeCallback = function() {
          return function() { //每个animate完成后调用此函数，当计数器满调用callback
            animationCompletedCount++;

            if (animationCount === animationCompletedCount) {
              typeof timingFunction === "function" ? timingFunction() : callback && callback();
            }
          }
        }();

      if (!element.nodeType) {
        if (debug)
          throw "an htmlElement is required";
        return;
      }

      for (var attribute in animationVars) {
        if (!(attribute in unit)) {
          if (debug) {
            throw "no attribute handler";
          }

          return;
        }

        try {
          var initialDistance = unit[attribute].getter(element),
            finalDistance = unit[attribute].getter(animationVars[attribute].value || animationVars[attribute]),
            distances = [];

          if (typeof initialDistance === "number") {
            distances.push([initialDistance, finalDistance - initialDistance]);
          } else {
            for (var i = 0, length = initialDistance.length; i < length; i++) {
              distances.push([initialDistance[i], finalDistance[i] - initialDistance[i]]);
            }
          }
          /*
           * 可以为每个属性指定缓动函数与时间
           */
          animateQueue[attribute] = animate(element, attribute, distances, animationVars[attribute].duration || duration, animationVars[attribute].timingFunction || (typeof timingFunction === "string" ? timingFunction : false) || "linear", completeCallback);
        } catch (e) {
          if (debug) {
            throw "an error occurred: " + e.stack;
          }

          return;
        }

        animationCount++;
      }

      animateQueue.stop = function() {
        for (var attribute in animateQueue) {
          animateQueue[attribute].stop && animateQueue[attribute].stop();
        }
      }

      return animateQueue;
    };

  init.config = function(configVars) {
    if (configVars) {
      if (configVars.fx) {
        for (var fxName in configVars.fx) {
          if (typeof configVars.fx[fxName] === "function") {
            fx[fxName] = configVars.fx[fxName];
          }
        }
      }

      if (configVars.unit) {
        for (var unitName in configVars.unit) {
          if (typeof configVars.unit[unitName] === "object") {
            unit[unitName] = configVars.unit[unitName];
          }
        }
      }

      if (configVars.debug) {
        debug = configVars.debug || false;
      }
    }
  };

  init.each = function(array, handler) {
    if (typeof handler === "function") {
      for (var i = 0, length = array.length; i < length; i++) {
        handler.call(array[i], i, array);
      }
    }
  };

  /*
   * 赠送几个单位存取函数（暂时实现行内样式读取，单位px -。-）
   */
  init.each("width, height, left, right, top, bottom, marginLeft, marginTop".split(/\s*,\s*/), function(index, array) {
    var attributeName = this;
    unit[attributeName] = {
      getter: function(element) {
        return parseInt((element.nodeType && element.style[attributeName] || element)["match"](/\d+/)[0]);
      },
      setter: function(element, value) {
        element.style[attributeName] = value + "px";
      }
    }
  });

  return init;

}();
```

#### ShowCase

测试如下（需引入Animation）：

详见：http://runjs.cn/code/lgrfeykn

```html
<!DOCTYPE html>
<html>

<head>
  <title></title>
  <script type="text/javascript">
  function init() {

    Animation.config({ //可以在这里设置或扩充功能
      debug: true,
      fps: 60,
      fx: {
        easeOutElastic: function(t, b, c, d) {
          var s = 1.70158;
          var p = 0;
          var a = c;
          if (t == 0) return b;
          if ((t /= d) == 1) return b + c;
          if (!p) p = d * .3;
          if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
          } else var s = p / (2 * Math.PI) * Math.asin(c / a);
          return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        }
      },
      unit: {
        backgroundColor: { //
          getter: function(element) {
            var backgroundColor = (element.nodeType && element.style.backgroundColor || element)["match"](/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            return [parseInt(backgroundColor[1]), parseInt(backgroundColor[2]), parseInt(backgroundColor[3])];
          },
          setter: function(element, value) {
            element.style.backgroundColor = "rgb(" + parseInt(value[0]) + ", " + parseInt(value[1]) + ", " + parseInt(value[2]) + ")";
          }
        }
      }
    });

    var animation = new Animation(test, {
      width: {
        value: "100px"
      },
      height: {
        value: "100px"
      },
      marginLeft: {
        value: "50px"
      },
      marginTop: {
        value: "50px"
      },
      backgroundColor: {
        value: "rgb(203,215,255)"
      }
    }, 1000, "easeOutElastic", function() {
      console.log("complete");
    });

  }
  </script>
</head>
<body onload="init();">
  <div id="test" style="width: 200px; height: 200px; background: rgb(255,104,228);margin-left: 0; margin-top: 0"></div>
</body>
</html>
```

 
