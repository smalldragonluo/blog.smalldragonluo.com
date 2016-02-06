title: IE中的 Bug 们之 box-shadow 无效
date: 2014-09-26 16:59
tags:
 - box-shadow
 - CSS
categories: 
 - 前端技术
description: 测试半小时，我终于捉住了这只Bug。

---

测试半小时，我终于捉住了这只Bug。

内容如下：

在 IE 中，如果元素 display 为 table 且 border-collapse 为 collapse，其 box-shadow 将会无效。
 
```css
.a {
    box-shadow: 0 0 35px rgba(0, 0, 0, .15); display: table; border-collapse: collapse;
}
.b, .c {
    display: table-cell;
}
```

```html
<div class="a">
    <div class="b">b</div>
    <div class="c">c</div>
</div>
```
