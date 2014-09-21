!function (document) {

    var Lang = {
            merge:function (target, origin) {
                for (var attribute in origin) {
                    if (origin.hasOwnProperty(attribute) && !(attribute in target)) {
                        target[attribute] = origin[attribute];
                    }
                }
            },
            augment:function (fn, prototype) {
                if (typeof prototype === "function") {
                    prototype = prototype.prototype;
                }
                for (var attribute in prototype) {
                    if (prototype.hasOwnProperty(attribute) && !(attribute in fn.prototype)) {
                        fn.prototype[attribute] = prototype[attribute];
                    }
                }
            },
            defineClass:function defineClass(constructor, parent, properties, statics, isSingleton) {

                /*使用代理函数，这样父类采用this.xx定义的引用类型将每个实例独有*/
                var oldConstructor = constructor;

                /*如果为单例模式，保存实例，并在以后的调用中返回此实例*/
                if (isSingleton) {
                    var instance;
                    constructor = function () {
                        if (instance) return instance;
                        if (parent) {
                            parent.apply(this, arguments);
                        }
                        oldConstructor.apply(this, arguments);
                        instance = this;
                    }
                } else {
                    constructor = function () {
                        if (parent) {
                            parent.apply(this, arguments);
                        }
                        oldConstructor.apply(this, arguments);
                    }
                }
                /*设置原型属性，这意味着传入的构造函数的原型属性将被覆盖
                 *重要：parent内部需要检测参数合理合法性
                 */
                constructor.prototype = parent ? new parent() : {};
                /*将自有属性复制到原型中
                 *将静态属性复制到构造函数中，这意味着将不会继承parent的静态属性
                 */
                Lang.merge(constructor.prototype, properties);
                Lang.merge(constructor, statics);
                /*将构造函数更改为当前构造函数
                 *将parent的引用保留
                 */
                constructor.prototype.constructor = constructor;
                constructor.prototype.parent = parent;
                return constructor;
            }
        },

        Utils = {
            getTime: function () {                                                       //获取当前时间（ms或更精确）
                return performance.now && performance.now() || new Date().getTime();
            },
            find: function(value,target) {
                for(var i in target){
                    if(target[i] == value) {
                        return true;
                    }
                }
                return false;
            },
            random: function(length){
                var min = Math.pow(10,length - 1),
                    max = min * 10 - 1,
                result = Math.round(min + Math.random()*(max - min));
                return result;
            },
            getUniqueId: function(){
                var ids = {};

                return function(length){                            /*注意：如果范围太小将死循环*/
                    length = length || 10;

                    var id = "" + Utils.random(length);

                    while(id in ids) {
                        id = Utils.random(length);
                    }

                    ids[id] = undefined;

                    return id;
                }
            }()
        },

        /* TimeLine */

        TimeLine = Lang.defineClass(function(){
            var that = this;

            this.frameCanceler = window.cancelAnimationFrame, //取消帧函数
            this.frameExecutor = window.requestAnimationFrame                            //帧执行函数
                || window.webkitRequestAnimationFrame
                || window.msRequestAnimationFrame
                || window.mozRequestAnimationFrame
                || window.oRequestAnimationFrame
                || function ()  {
                    var callbacks = [];

                    !function frame() {
                        var oldTime = Utils.getTime(),
                            tmp = callbacks;

                        callbacks = [];

                        for (var i = 0, length = tmp.length; i < length; i++) {
                            tmp[i].callback(oldTime);
                        }

                        var currentTime = Utils.getTime(),
                            delayTime = Math.max(16.66 - currentTime + oldTime, 0);

                        setTimeout(frame, delayTime);
                    }();

                    that.executorCanceler = function (id) {
                        for (var i = 0, length = callbacks.length; i < length; i++) {
                            if (callbacks[i].id === id) callbacks.splice(i, 1);
                        }
                    }

                    return function (callback) {
                        var context = {callback: callback, id: Utils.getUniqueId()};
                        callbacks.push(context);
                        return context.id;
                    }
                }();
            }, undefined, {
            runTask: function(taskConfig){
                var that = this,
                    frameExecutor = this.frameExecutor,
                    duration = taskConfig.duration || -1,
                    stepHandler = taskConfig.stepHandler,
                    completeHandler = taskConfig.completeHandler,
                    oldTime = Utils.getTime(),
                    executorID = frameExecutor(function anonymous(currentTimeStamp) {
                        if(duration != -1 && Utils.getTime() - oldTime > duration) {
                            completeHandler(duration);
                        } else {
                            stepHandler(currentTimeStamp - oldTime);
                            executorID = frameExecutor(anonymous);
                        }
                    });

                return {
                    stop: function(){
                        that.frameCanceler(executorID);
                    }
                }
            }
        }, {}, true),

        Animation = function () {

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

        /* Loader对象，用于获取资源 */

        Loader = {
            storage:{},
            loadImage:function (url, callback) {
                var that = this,
                    onload = function(){
                        that.storage[url] = img;
                        callback(img);
                    };

                if(this.storage[url]) {
                    callback(this.storage[url]);
                    return;
                }

                var img = document.createElement("img");

                img.src = url;

                if(img.complete) {
                    onload();
                } else {
                    img.onload = onload;
                }
            },
            load:function () {
                var itemCount = 0, itemLoaded = 0, items = [], callback;

                for (var i = 0; i < arguments.length; i++) {
                    var item = arguments[i], type, url;

                    if (typeof item === "function") {
                        callback = item;
                        continue;
                    }

                    if (typeof item === "string" && item.lastIndexOf(".")) {
                        type = item.substring(item.lastIndexOf(".") + 1, item.length);
                        url = item;
                    } else if (item.type && item.url) {
                        type = item.type;
                        url = item.url;
                    } else {
                        throw "资源参数不正确";
                    }

                    itemCount++;

                    if (type === "png" || type === "jpg" || type === "bmp" || type === "gif" || type === "img") {
                        !function(i){
                            Loader.loadImage(url, function(img){
                                loadedOne(img, i);
                            });
                        }(i);
                    }

                }

                function loadedOne(item, index){
                    items[index] = item;
                    itemLoaded ++;
                    if(itemCount === itemLoaded && callback) {
                         callback.apply(undefined, items);
                    }
                }
            }
        },

        /* Eventable */

        Event = Lang.defineClass(function(){
            this._stopPropagation = false;
        }, undefined, {
            stopPropagation: function(){
                this._stopPropagation = true;
            }
        }, {
            MOUSE_CLICK: 0,
            MOUSE_DOWN: 1,
            MOUSE_UP: 2,
            MOUSE_OVER: 3,
            MOUSE_OUT: 4,
            MOUSE_MOVE: 5
        }),

        /* Eventable */

        Eventable = Lang.defineClass(function(){
            this._eventListenerQueue = {};
        }, undefined, {
            addEventListener: function(eventType, eventHandler, useCapture){
                if(!this._eventListenerQueue[eventType]) {
                    this._eventListenerQueue[eventType] = [];
                }
                this._eventListenerQueue[eventType].push({eventHandler: eventHandler, useCapture: useCapture});
            },
            removeEventListener: function(eventType, eventHandler){
                if(!this._eventListenerQueue[eventType]) {
                    return;
                }
                for(var i = 0, length = this._eventListenerQueue[eventType].length; i < length; i++){
                    if(eventHandler == this._eventListenerQueue[eventType][i].eventHandler) {
                        return this._eventListenerQueue[eventType].splice(i, 1)[0].eventHandler;
                    }
                }
            },
            _dispatchEvent: function(event){
                if(this._eventListenerQueue[event.eventType]) {
                    if(event._identifyHandler && event._identifyHandler.call(this)){
                        if(event.isCapture) {
                            for(var i = 0, length = this._eventListenerQueue[event.eventType].length; i < length; i++){
                                if(this._eventListenerQueue[event.eventType][i].useCapture) {
                                    this._eventListenerQueue[event.eventType][i].eventHandler(event);
                                }
                            }
                            if(!event._stopPropagation) {
                                if(this.child.length === 0) {
                                    event.isCapture = false;
                                    parent._dispatchEvent(event);
                                } else {
                                    for(var i = 0, length = this.child.length; i < length; i++){
                                        this.child[i]._dispatchEvent(event);
                                    }
                                }
                            }
                        } else {
                            for(var i = 0, length = this._eventListenerQueue[event.eventType].length; i < length; i++){
                                if(!this._eventListenerQueue[event.eventType][i].useCapture) {
                                    this._eventListenerQueue[event.eventType][i].eventHandler(event);
                                }
                            }
                            if(!event._stopPropagation) {
                                parent._dispatchEvent(event);
                            }
                        }
                    } else {
                        throw "事件传播错误，可能是没添加识别函数或识别函数异常";
                    }
                }
            }
        }),

         /* Feature */

        Feature = Lang.defineClass(function (space, speed, friction, density, weight) {
            this.space = space || [];
            this.speed = speed || {x: 0, y: 0};
            this.friction = friction || 0;
            this.density = density || 0;
            this.weight = weight || 0;
        }, undefined, {

        }),

        /* Sprite */

        Sprite = Lang.defineClass(function (width, height, position, frameNumber, background) {
            this.width = width || 0;
            this.width = height || 0;
            this.position = position || {x: 0, y: 0};
            this.frameNumber = frameNumber || 1;
            this.background = background || {width: 0, height: 0, img: null, direction: Sprite.HORIZONTAL};
            this.visible = true;
        }, undefined, {}, {
            HORIZONTAL: 0,
            VERTICAL: 1
        }),

        /* DomSprite */

        DomSprite = Lang.defineClass(function (width, height, position, frameNumber, background) {
            var element = document.createElement("div");
            element.setAttribute("class", "Sprite");
            element.setAttribute("style", "width: " + this.width + "px; height: " + this.height + "px; left: " + this.position.x + "px; top: " +  this.position.x + "px;");
            this._element = element;
        }, Sprite, {
            show: function(){
                this._element.style.display = "block";
            },
            hide: function(){
                this._element.style.display = "none";
            },
            play: function(){
                new TimeLine().runTask({
                    stepHandler: function(time){

                    },
                    completeHandler: function(time){
                        console.log("over");
                    }
                });

                this._element;
            }
        }),

        /* Body */

        Body = Lang.defineClass(function (width, height, texture) {

        }, undefined, {

        }),

        /* World */

        World = Lang.defineClass(function (width, height, texture) {

        }, undefined, {

        }),

        Game = Lang.defineClass(function () {

            /*初始化开始*/


            /*初始化结束*/

        }, undefined, {
            createSprite:function (width, height, texture) {
                var element = document.createElement("div"),
                    sprite = {}

                return;
            },
            createStage:function (parentElement, width, height) {
                var element = null;
                var stage = {

                }
            }
        });

    Loader.load("http://www.baidu.com/img/bdlogo.gif", {type: "img", url: "http://s.cn.bing.net/az/hprichbg/rb/SwimmingTiger_ZH-CN11319597773_1366x768.jpg"}, function(img, img2){
        console.log("hehe " + img.src + " " + img2.src);
    });

    var oldTile = Utils.getTime();

    new TimeLine().runTask({
        duration: 2000,
        stepHandler: function(time){
            console.log(time);
        },
        completeHandler: function(time){
            console.log("over");
        }
    });

}(document);