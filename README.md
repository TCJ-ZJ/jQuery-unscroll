## lz-scroll使用手册
**当前版本： V1.0.0**

### lz-scroll是什么
>lz-scroll是一款基于jQuery库开发的轻量级滚动条插件，方便开发者能够自定义滚动条样式。可以设置滚动速度，是否一直显示滚动条，并且能够根据父级的高度变化而自我调整。当前版本为正式版1.0.0
### 具体参数列表

| 参数名称 | 参数变量 | 参数取值 | 参数说明 |
|-----------|------------|------------|------------|
| 滚动条方向          |`axis`        |'[x]' / '[y]' / '[xy]' / '[yx]'      |控制垂直和水平滚动条的添加，参数为空时：默认值为 *y*
| 滚动速度          |`speed`     |'[number]'   				 		|控制滑轮滚动时的滚动速度，参数为空时：默认值为 *20*
| 滚动条宽度          |`width`      |'[number]''|设置滚动条的宽度，主要用于当垂直和水平滚动条同时出现时防止重叠，参数为空时： 默认值为 *20*
| 显示状态          |`display`   |[true] / [false]  |控制滚动条是否持续显示，当为false时，鼠标移出当前元素即消失，本参数为空时：默认值为 *true*  
| 样式名称          |`theme`      |'[string]' |控制所添加的滚动条样式的名称，结果为unscroll-theme-Y,unscroll-theme-X，本参数为空时：默认值为 *default*   

### 引入库文件
--此插件基于jQuery开发
```HTML
<script src="js/jquery-11.1.1.min.js"></script>
<script src="js/lz-scroll.1.0.0.min.js"></script>
<link href="css/lz-scroll.css" rel="stylesheet" type="text/css">
```	

### 调用插件
--参数可为空，全部参数请参考列表；可多次调用
```html
	<!-- 使用html5 data属性进行传参,优先级大于js传参 -->
	
	<div id="unscroll" data-scroll-param='{"axis":"x","speed":10}'></div>
```

```javascript
<script type="javascript">
    <!--
    	$('#lzscroll1').lzscroll('xy',20,10,true,'mytheme') //滚动条方向 滚动速度 滚动条宽度 是否持续显示 样式名 
		$('#lzscroll2').lzscroll(20) //滚动速度
		$('#lzscroll3').lzscroll(false) //是否持续显示

        /* 或使用对象传参 */

        $('#lzscroll4').lzscroll({
            axis : 'xy' ,
            speed : 20 ,
            width : 5 ,
            display : true ,
            theme : 'mytheme'
        })
    -->
</script>
```

### 提供的css选择器
--自定义样式时请带上外层父级id，避免同一页面多个组件样式冲突
```css
.lzscroll-theme-Y  //垂直滚动条样式
.lzscroll-theme-X  //水平滚动条样式
```
© 本手册由 磨盘兄弟 @lzmoop 官方提供 www.lzmoop.com
