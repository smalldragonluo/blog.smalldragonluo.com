(function (window, document) {

    var L = function (selector, context) {
        return new L.fn.makePackage(selector, context);
    }

    L.fn = {
        makePackage:function (selector, context) {
            if (selector.nodeType) {
                this.elementList = [selector];
            }
            else if (selector instanceof Function) {
                L.ready(selector);
            }
            else if ("isTags" && 0) {

            }
            else {
                this.elementList = select(selector, context);
            }
        },
        bind:function (eventType, callBack, stopPropagation, useCapture) {
            each(this.elementList, function () {
                bind(this, eventType, callBack, stopPropagation, useCapture);
            });
        },
        remove:function () {
            for (var i = 0; i < this.elementList.length; i++) {
                remove(this.elementList[i]);
            }
        }
    };

    L.fn.makePackage.prototype = L.fn;

    /*简单的继承函数*/
    L.extend = function (from, to) {
        var to = to || this;
        merge(from, to);
    }

    L.extend({
        ready:(function () {
            var ready,
                fnList = [],
                callBack = function () {
                    if (document.addEventListener) {
                        document.removeEventListener("DOMContentLoaded", callBack, false);
                        window.removeEventListener("load", callBack, false);
                    } else if (document.readyState === "complete") {
                        document.detachEvent("onreadystatechange", callBack);
                        window.detachEvent("onload", callBack);
                    } else return;
                    ready = true;
                    for (var i in fnList) fnList[i]();
                }
            if (document.readyState === "complete") {
                callBack();
            }
            else if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", callBack, false);
                window.addEventListener("load", callBack, false);
            }
            else {
                document.attachEvent("onreadystatechange", callBack);
                window.attachEvent("onload", callBack);

                /* 在IE8中,可以使用readystatechange事件来检测DOM文档是否加载完毕.在更早的IE版本中,
                 * 可以通过每隔一段时间执行一次document.documentElement.doScroll("left");的方法检测到,
                 * 因为在DOM加载完成执行,这段代码会跑出一个错误(throw an error)。
                 */
                var top = false;

                try {
                    top = window.frameElement == null && document.documentElement;
                } catch (e) {
                }

                if (top && top.doScroll) {
                    (function doScrollCheck() {
                        if (!ready) {
                            try {
                                top.doScroll("left");
                            } catch (e) {
                                return setTimeout(doScrollCheck, 50);
                            }
                            callBack();
                        }
                    })();
                }
            }

            return function (fn) {
                if (ready) fn();
                else fnList.push(fn);
            };
        })(),

        /*用于定义一个类
         *参数：构造函数，继承的父类， 属性， 静态属性， 是否为单例模式
         */
        defineClass:function defineClass(constructor, parent, properties, statics, isSingleton) {

            /*使用代理函数，这样父类采用this.xx定义的引用类型将每个实例独有*/
            var oldConstructor = constructor;

            /*如果为单例模式，保存实例，并在以后的调用中返回此实例*/
            if (isSingleton) {
                var instance;
                constructor = function () {
                    if (instance) return instance;
                    parent.apply(this, arguments);
                    oldConstructor.apply(this, arguments);
                    instance = this;
                }
            }
            else {
                constructor = function () {
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
        },
        select:function (selector, context) {

        },
        bind:bind,
        animation:function () {

            var debug = false, //如果debug，遇到异常将抛出
                unit = {}, //样式存取函数，详见下方each函数
                fx = {                   //缓动函数
                    linear:function (currentTime, initialDistance, totalDistance, duration) {    //自带一个线性缓动函数
                        return initialDistance + (currentTime / duration * totalDistance);
                    }
                },
                getTime = function () {                                                       //获取当前时间（ms或更精确）
                    return performance.now && performance.now() || new Date().getTime();
                },
                executorCanceler = window.cancelAnimationFrame, //取消帧函数
                executor = window.requestAnimationFrame                            //帧执行函数
                    || window.webkitRequestAnimationFrame
                    || window.msRequestAnimationFrame
                    || window.mozRequestAnimationFrame
                    || window.oRequestAnimationFrame
                    || function () {
                    var callbacks = [];

                    !function frame() {
                        var oldTime = getTime(),
                            tmp = callbacks;

                        callbacks = [];

                        for (var i = 0, length = tmp.length; i < length; i++) {
                            tmp[i].callback(oldTime);
                        }

                        var currentTime = getTime(),
                            delayTime = Math.max(16.66 - currentTime + oldTime, 0);

                        setTimeout(frame, delayTime);
                    }();

                    executorCanceler = function (id) {
                        for (var i = 0, length = callbacks.length; i < length; i++) {
                            if (callbacks[i].id === id) callbacks.splice(i, 1);
                        }
                    }

                    return function (callback) {
                        var context = {callback:callback, id:Math.random()};
                        callbacks.push(context);
                        return context.id;
                    }
                }(),
            /*
             * 为每个属性运行此函数，类似于启动一个线程（虽然不是真正的线程）
             */
                animate = function (element, attribute, distances, duration, timingFunction, completeCallback) {
                    var oldTime = getTime(),
                        animationPassedTime = 0,
                        executorReference = executor(function anonymous(currentTimeStamp) {
                            animationPassedTime = currentTimeStamp - oldTime;

                            var computedValues = [];        //computedValues为缓动函数计算值，可能返回数值或者数组（按动画属性不同，比如rgb）

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
                        stop = function () {
                            executorCanceler(executorReference);
                            completeCallback();      //执行回调函数
                        };

                    return {
                        stop:stop
                    }
                },
            /*
             * Animation 引用的函数，此函数返回一个包含所有动画属性的控制对象（如停止操作），因此可以采取函数调用或者new的方式创建一个动画对象
             */
                init = function (element, animationVars, duration, timingFunction, callback) {

                    var animateQueue = {}, animationCount = 0, animationCompletedCount = 0, completeCallback = function () {
                        return function () {      //每个animate完成后调用此函数，当计数器满调用callback
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

                    animateQueue.stop = function () {
                        for (var attribute in animateQueue) {
                            animateQueue[attribute].stop && animateQueue[attribute].stop();
                        }
                    }

                    return animateQueue;
                };

            init.config = function (configVars) {
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

            init.each = function (array, handler) {
                if (typeof handler === "function") {
                    for (var i = 0, length = array.length; i < length; i++) {
                        handler.call(array[i], i, array);
                    }
                }
            };

            /*
             * 赠送几个单位存取函数（暂时实现行内样式读取，单位px -。-）
             */
            init.each("width, height, left, right, top, bottom".split(/\s*,\s*/), function (index, array) {
                var attributeName = this;
                unit[attributeName] = {
                    getter:function (element) {
                        return parseInt((element.nodeType && element.style[attributeName] || element)["match"](/\d+/)[0]);
                    },
                    setter:function (element, value) {
                        element.style[attributeName] = value + "px";
                    }
                }
            });

            return init;

        }(),

        support:{

        }
    });

    /*补充ES3原型*/

    String.prototype.trim = function () {
        return this.replace(/^\s|\s$/g, "");
    }

    /*补充ES3原型 结束*/

    var getByClass = function (document) {

        return getByClass = document.getElementsByClassName ? function (className, context) {

            return (context ? context : document)["getElementsByClassName"](className);

        } : function (className, context) {

            var elements = (context ? context : document)["getElementsByTagName"]("*"), matchedElements = [];

            for (var i = 0, length = elements.length; i < length; i++) {

                if (elements[i].nodeType == 1 && hasClass(className, elements[i])) {
                    matchedElements.push(elements[i]);
                }

            }

            return matchedElements;

        };

    }(document);

    function hasClass(className, element) {

        var classNames = element.className.trim().split(" ");

        for (var i = 0, length = classNames.length; i < length; i++) {
            if (className === classNames[i]) return className;
        }

        return false;
    }

    var simpleSelector = /^[#\.][$_\w]+/;

    function select(selector, context) {

        var contextArray = context instanceof Array ? context : [context] || [document];
        var selected = [];

        for (var i = 0, length = contextArray.length; i < length; i++) {
            context = contextArray[i];

        }

        if (context.querySelectorAll) return context.querySelectorAll(selector);

        var simpleSelectorStr = selector.match(simpleSelector);
        if (simpleSelectorStr) {

        }
        else return null;
    }

    function each(array, handler) {
        for (var i = 0; i < array.length; i++) {
            handler.call(array[i]);
        }
    }

    function bind(element, eventType, callBack, stopPropagation, useCapture) {
        if (eventType == "mouseleave") {
            leave(element, callBack, stopPropagation);
        }
        else {
            _bind.apply(null, arguments);
        }
    }

    function _bind(element, eventType, callBack, stopPropagation, useCapture) {
        if (document.addEventListener) {
            element.addEventListener(eventType, __bindWrapper, useCapture);
        }
        else if (document.attachEvent) {
            element.attachEvent("on" + eventType, __bindWrapper);
        }

        function __bindWrapper(e) {
            var e = e || window.event;
            if (stopPropagation) {
                if (e.stopPropagation) e.stopPropagation();
                else e.cancelBubble = true;
            }
            return callBack.call(element, e);
        }
    }

    function leave(element, callBack, stopPropagation) {
        _bind(element, "mouseout", function (e) {
            if (!(element.contains(e.relatedTarget || e.toElement) || element == (e.relatedTarget || e.toElement))) {
                callBack.call(element, e);
            }
        }, stopPropagation);
    }

    function remove(element) {
        element.parentNode.removeChild(element);
    }

    /*将一个对象的自有属性复制到另一个对象的方法*/
    function merge(from, to) {
        for (var i in from) {
            if (from.hasOwnProperty(i)) {
                to[i] = from[i];
            }
        }
    }

    window.L = L;
})(window, document);