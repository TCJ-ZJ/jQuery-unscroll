## lz-scroll使用手册
**当前版本： V1.3.0**
<br>
### lz-scroll是什么
>lz-scroll是一款基于jQuery库开发的轻量级滚动条插件，方便开发者能够自定义滚动条样式。可以设置滚动速度，是否一直显示滚动条，并且能够根据内容的高度变化而自我调整。当前版本为正式版1.3.0

### 具体参数列表

| 参数名称 | 参数变量 | 参数取值 | 参数说明 |
|-----------|------------|------------|------------|
| 滚动条方向          |`axis`        |'[x]' / '[y]' / '[xy]' / '[yx]'      |控制垂直和水平滚动条的添加，参数为空时：默认值为 *y*
| 滚动速度          |`speed`     |'[number]'   				 		|控制滑轮滚动时的滚动速度，参数为空时：默认值为 *120*
| 滚动条盒子宽度          |`containerWidth`      |'[number]''|设置滚动条盒子的宽度，主要用于当垂直和水平滚动条同时出现时防止重叠，参数为空时： 默认值为 *8*
| 滚动条宽度          |`barWidth`      |'[number]''|设置滚动条的宽度，参数为空时： 默认值为 *6*
| 显示模式          |`mode`   |['always']/['hover']/['active']  |控制滚动条显示模式，当为always时，一直显示，当为hover时，悬停时显示，当为active时，滚动显示，本参数为空时：默认值为 *always* 
| 样式名称          |`theme`      |'[string]' |控制所添加的滚动条样式的名称，结果为lzscroll-default-[]，本参数为空时：默认值为 *default*
| 滚动条是否固定          |`barChange`      |[true]/[false] |滚动条是否根据内容高度进行改变，本参数为空时：默认值为 *true*
| 监听改变          |`listenChange`      |[true]/[false] |是否根据元素的改变来实时调整滚动条，本参数为空时：默认值为 *true*
| 滚动回调函数          |`_onScroll`      |[fn] |滚动时执行的函数，本参数为空时：默认值为 *null*

### 引入库文件
--此插件基于jQuery开发
```HTML
<script src="js/jquery-11.1.1.min.js"></script>
<script src="js/lz-scroll.1.3.0.min.js"></script>
<link href="css/lz-scroll.css" rel="stylesheet" type="text/css">
```	

### 调用插件
--参数可为空，全部参数请参考列表；可多次调用
```html
	<!-- 使用html5 data属性进行传参,优先级大于js传参 -->
	
	<div id="unscroll" data-lzscroll-param='{"axis":"x","speed":10}'></div>
```

```javascript
<script type="javascript">
    <!--
    	$('#lzscroll1').lzscroll('xy',120,'hover','mytheme') //滚动条方向 滚动速度 显示模式 样式名 
		$('#lzscroll2').lzscroll(20) //滚动速度
		$('#lzscroll3').lzscroll(false) //是否持续显示

        /* 或使用对象传参 */

        $('#lzscroll4').lzscroll({
            axis : 'xy' ,
            speed : 20 ,
            containerWidth : 10 ,
	    barWidth: 8,
            mode : 'always' ,
	    listenChange: true,
	    barChange: true,
	    _onScroll:fn,
            theme : 'mytheme'
        })
    -->
</script>
```

###回调方法
```javascript
	//调用方式	
	var tool = $('#lzscroll').lzscroll(); //调用插件并获得回调方法集
	var tool =  $('#lzscroll').scrollTool(); //获得该元素的回调方法集
	
	//回调方法
	tool.scrollTop() //当前滚动的垂直距离
	tool.scrollTop(num) //设置滚动的垂直距离
	tool.scrollLeft() //当前滚动的水平距离	
	tool.scrollLeft(num) // 设置滚动的水平距离
	tool.setContainerWidth(num) //设置滚动条盒子的宽度
	tool.setBarWidth(num) //设置滚动条的宽度
	tool.setMode(str) //设置滚动条显示模式
	tool.setTheme(str) //设置滚动条的class名称
	tool.setSpeed(num) //设置滚动条的滚动样式
	tool.init({}) //初始化滚动条
	tool.on('scroll',fn) //添加滚动时的回调函数
```


### 提供的css选择器
--自定义样式时请带上外层父级id，避免同一页面多个组件样式冲突
```css
.lzscroll-theme-containerY  //垂直滚动条盒子样式
.lzscroll-theme-containerX  //水平滚动条盒子样式
.lzscroll-theme-barY  //垂直滚动条样式
.lzscroll-theme-barX  //垂直滚动条样式

```
© 本手册由 磨盘兄弟 @lzmoop 官方提供 www.lzmoop.com
