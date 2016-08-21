title: 一个简单的 JS 模板引擎
tags:
  - JavaScript
  - 模板引擎
  - 正则表达式
categories:
  - 前端技术
toc: true
date: 2016-02-05 10:19:25
description: 本文讲述了如何用简单的代码实现一个 JavaScript 语法模板引擎
---

> 快过年了，需求不饱和，有时间写写博客。

### What's this?

这是一个清爽的 JavaScript 语法模板引擎，使用自带的 JavaScript 解释器，无中间语法，压缩后仅 0.45 kb。

思路：
 * 拆分语句与表达式（一次处理，提高性能）
 * 拼装 compiler 函数
 * 转义 html 中的单引号与转义符，保留函数与 html 格式

```js
function Tpl(tpl) {
  // 关于传递 RegExp https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/split
  var snippet = tpl.split(/(?=<%)|(%>)/);
  var mCode = [
    'var _tplSnippet = [];',
    'with(_tplData) {'
  ];

  for (var i = 0; i < snippet.length; ++i) {
    if (typeof snippet[i] !== 'undefined' && snippet[i] !== '%>') {
      if (snippet[i].substring(0, 2) === '<%') {
        // 如果是表达式
        if (snippet[i].charAt(2) === '=') {
          mCode.push(snippet[i].replace(/<%=((\s|.)+)/g, '_tplSnippet.push($1);'));
        } else {
          // 如果是语句
          mCode.push(snippet[i].replace(/<%((\s|.)+)/g, '$1'));
        }
      } else {
        // 如果是 html
        mCode.push('_tplSnippet.push(\'' + snippet[i].replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\n/g, '\\n') + '\');');
      }
    }
  }

  mCode.push('}', 'return _tplSnippet.join(\'\');');

  return new Function('_tplData', mCode.join(''));
}
```
### ShowCase

你可以在这里编辑模板与数据

<textarea class="J_Tpl custom-tpl"></textarea>

<textarea class="J_Data custom-data"></textarea>

<button class="J_Compile custom-btn">运行</button>

<pre class="J_Result custom-result"></pre>

### 性能

我做了一些测试，结果证明，即便是模板中包含大量复杂的业务逻辑，构建渲染函数过程的性能消耗也是微乎其微的，查看 TimeLine 时间大概在 1 毫秒左右。
因此可以见得，团队使用离线编译原生 JavaScript 语法的模板，主要是为了自动化、模块化以及安全考虑，而不是性能。



<style>
  .custom-tpl, .custom-data {
    width: 100%;
    height: 310px;
    outline: none;
    resize: vertical;
    padding: 4px 8px;
    border-radius: 7px;
    border: 1px solid #DDD;
  }
  .custom-btn {
    outline: none;
    display: inline-block;
    padding: 3px 20px 3px;
    line-height: 30px;
    color: #444;
    font-size: 13px;
    background: white;
    border: 1px solid #ddd;
  }
</style>

<script class="J_TplStore" type="text/html">
  <ul>
   <% for(var i = 0; i < data.length; i++) { %>
     <li>
     <% if(i === 1) { %>
     <i> * </i>
     <% } %>
     <%= data[i] %>
     </li>
   <% } %>
  </ul>
</script>

<script class="J_DataStore" type="text/html">
  {
    "data": [1, 2, 3]
  }
</script>

<script>
(function tmp(){
  if(window.$) {
    function Tpl(tpl) {
          // 关于传递 RegExp https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/split
          var snippet = tpl.split(/(?=<%)|(%>)/);
          var mCode = [
            'var _tplSnippet = [];',
            'with(_tplData) {'
          ];
        
          for (var i = 0; i < snippet.length; ++i) {
            if (typeof snippet[i] !== 'undefined' && snippet[i] !== '%>') {
              if (snippet[i].substring(0, 2) === '<%') {
                // 如果是表达式
                if (snippet[i].charAt(2) === '=') {
                  mCode.push(snippet[i].replace(/<%=((\s|.)+)/g, '_tplSnippet.push($1);'));
                } else {
                  // 如果是语句
                  mCode.push(snippet[i].replace(/<%((\s|.)+)/g, '$1'));
                }
              } else {
                // 如果是 html
                mCode.push('_tplSnippet.push(\'' + snippet[i].replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\n/g, '\\n') + '\');');
              }
            }
          }
        
          mCode.push('}', 'return _tplSnippet.join(\'\');');
        
          return new Function('_tplData', mCode.join(''));
        }
        
        $('.J_Tpl').val($('.J_TplStore').html());
        $('.J_Data').val($('.J_DataStore').html());
        
        $('.J_Compile').on('click', function(){
          if(!JSON) {
            $('.J_Result').text('你的浏览器没有 JSON 对象，请切换浏览器再试');
            return;
          }
          
          var compiler, data, t, cTime, rTime;
          
          try {
            t = new Date().getTime();
            compiler = Tpl($('.J_Tpl').val());
            cTime = new Date().getTime() - t;
          } catch(e) {
            $('.J_Result').text('模板格式错误\n' + e.stack);
            return;
          }
          
          try {
            data = JSON.parse($('.J_Data').val());
          } catch(e) {
            $('.J_Result').text('数据格式错误\n' + e.stack);
            return;
          }
          
          try {
            t = new Date().getTime();
            var html = compiler(data);
            rTime = new Date().getTime() - t;
            $('.J_Result').text('<!-- 创建渲染函数用时：' + cTime + ' ms, 渲染用时：' + rTime + ' ms -->\n' + html);
          } catch(e) {
            $('.J_Result').text('渲染错误\n' + e.stack);
            return;
          }
        }).trigger('click');
  } else {
    setTimeout(function() {
      tmp();    
    }, 16.7);
  }
})();
</script>
