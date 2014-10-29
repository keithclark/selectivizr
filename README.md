Selectivizr
-----------

**CSS3 for IE 6-9**

## Fork ##

这个fork整合了[修改版的PIE](https://github.com/gucong3000/PIE)，从而让IE6-9获得css3的选择器之外，或获得了圆角、阴影、渐变色资源等css3属性的支持

> 再也不用为迁就低版本IE而额外写代码了，直接按照现代浏览器标准写，最后加入selectivizr即可。一个字，爽！

> 大神们常说：PC端写css3，优雅降级才是王道。但是鉴于草根前端er们在项目组中的地位，往往无法说服领导。今天，你不用再取舍，使用本项目尽情使用css3吧

## 使用方式：

[PIE.htc](PIE.htc)、[PIE_IE9.js](PIE_IE9.js)、[PIE_IE678.js](PIE_IE678.js)、[selectivizr.js](selectivizr.js)、[prefixfree.min.js](prefixfree.min.js) 将这5个文件，放在js目录下，然后在html中，引入所有css文件之后加入：

```HTML
<script src="js/selectivizr.js"></script>
```

## 功能列表
- [css3免前缀](http://leaverou.github.io/prefixfree/)
- [圆角(border-radius)](http://gucong3000.github.io/css-book/properties/border/border-radius.htm)
- [盒阴影(box-shadow)](http://gucong3000.github.io/css-book/properties/border/box-shadow.htm)
- [边框图(border-image)](http://gucong3000.github.io/css-book/properties/border/border-image.htm)
- [线性背景渐变(linear-gradient)](http://gucong3000.github.io/css-book/values/image/linear-gradient%28%29.htm)
- [媒体查询(mediaqueries)](http://www.w3.org/TR/css3-mediaqueries/) 除了普通的媒体查询，还可以这样使用：`@media all and(msie:8) {}`、`@media all and(min-msie:8) {}`、`@media all and(max-msie:8) {}`
- display: inline-block; (为IE6-IE7提供支持)
- position: fixed (IE6， 部分支持，自动以`absolute`替换)
- IE6下png图片透明(如果未使用其他css3属性，单纯需要修复IE6 png问题，可在css中写入：`-pie-png-fix: true;`)
- 相对长度单位: [vw](http://gucong3000.github.io/css-book/values/length/vw.htm), [vh](http://gucong3000.github.io/css-book/values/length/vh.htm), [vmin](http://gucong3000.github.io/css-book/values/length/vmin.htm), [vmax](http://gucong3000.github.io/css-book/values/length/vmax.htm), [rem](http://gucong3000.github.io/css-book/values/length/rem.htm)
- css选择符(建议与nwmatcher共同使用)。[详见selectivizr官方网站](http://selectivizr.com/#how) 
- IE9下自动关掉与css3属性冲突的几个滤镜(Alpha|Matrix|Gradient|FlipH|FlipV)

## 注意事项

- 不支持style属性中的行内样式。
- 应该尽量避免使用`<style>`标签。
- 如果需要本地双击html文件方式使用，请在Selectivizr前加载jQuery。
- 出现元素抖动或者背景及边框消失的情况，请用 `position: relative; zoom: 1;` 方式修正，加给元素本身或其父元素。
- 如果服务器环境的content-type配置不正确，可能造成css3属性不生效。如Apache，可在`.htaccess`文件中添加一行`AddType text/x-component .htc`即可解决此问题。

