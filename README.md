Selectivizr
-----------

**CSS3 for IE 6-9**

## Selectivizr ##

Selectivizr是一个为IE6-8提供css3选择器的js库，他的官方网站是：http://selectivizr.com/

## Fork ##

这个fork整合了PIE修改版的PIE，从而让IE6-9获得css3的选择器之外，或获得了圆角、阴影、渐变色资源等css3属性的支持


> 大神们常说：PC端写css3，优雅降级才是王道。但是鉴于草根前端er们在项目组中的地位，往往无法说服领导。今天，你不用再取舍，使用本项目尽情使用css3吧

使用方式：
```HTML
<!--[if lte IE 9]>
	<script src="selectivizr.js"></script>
<![endif]-->
```

## 注意事项

- 为推进大家写更规范的代码，请将css写入文件中，行内和页面内样式均不支持
- 出现元素背景及边框消失的情况，请用 `position: relative;` 方式修正