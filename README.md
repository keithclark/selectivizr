Selectivizr
-----------

**CSS3 for IE 6-9**

## Selectivizr ##

Selectivizr是一个为IE6-8提供css3选择器的js库，他的官方网站是：http://selectivizr.com/

## Fork ##

这个fork整合了[修改版的PIE](https://github.com/gucong3000/PIE)，从而让IE6-9获得css3的选择器之外，或获得了圆角、阴影、渐变色资源等css3属性的支持

> 再也不用为迁就低版本IE而额外写代码了，直接按照现代浏览器标准写，最后加入selectivizr即可。一个字，爽！

> 大神们常说：PC端写css3，优雅降级才是王道。但是鉴于草根前端er们在项目组中的地位，往往无法说服领导。今天，你不用再取舍，使用本项目尽情使用css3吧

使用方式：

```HTML
<!--[if lte IE 9]>
	<script src="selectivizr.js"></script>
<![endif]-->
```

## 功能列表
- [圆角(border-radius)](http://gucong3000.github.io/css-book/properties/border/border-radius.htm)
- [盒阴影(box-shadow)](http://gucong3000.github.io/css-book/properties/border/box-shadow.htm)
- [边框图(border-image)](http://gucong3000.github.io/css-book/properties/border/border-image.htm)
- [线性背景渐变(linear-gradient)](http://gucong3000.github.io/css-book/values/image/linear-gradient%28%29.htm)
- display: inline-block; (为IE6-IE7提供支持)
- position: fixed (IE6， 部分支持，自动以`absolute`替换)
- IE6下png图片透明(如果未使用其他css3属性，单纯需要修复IE6 png问题，可在css中写入：`-pie-png-fix: true;`)
- 相对长度单位: [vw](http://gucong3000.github.io/css-book/values/length/vw.htm), [vh](http://gucong3000.github.io/css-book/values/length/vh.htm), [vmin](http://gucong3000.github.io/css-book/values/length/vmin.htm), [vmax](http://gucong3000.github.io/css-book/values/length/vmax.htm), [rem](http://gucong3000.github.io/css-book/values/length/rem.htm)
- css选择符(建议与nwmatcher共同使用)。[详见selectivizr官方网站](http://selectivizr.com/#how) 

## 注意事项

- 不支持style属性中的行内样式。
- 如果需要本地双击html文件方式使用，请在Selectivizr前加载jQuery。
- 出现元素抖动或者背景及边框消失的情况，请用 `position: relative; zoom: 1;` 方式修正，加给元素本身或其父元素。
- IE6-8下，如果中有`<style>`标签，将会有ajax get请求获取原始的html(也可将html escape编码后放入`<script>`标签中传入)。
