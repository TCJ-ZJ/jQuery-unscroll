;(function($){

	$.extend({

		// 判断参数是否为array对象，是返回true，否则返回false

		isArray: function(v) {

			return Object.prototype.toString.call(v) === '[object Array]';

		},

		// 判断参数是否为object对象，是返回true，否则返回false

		isObject: function(v) {

			return Object.prototype.toString.call(v) === '[object Object]';

		}
	})

/*！
* 定义构造函数--事件函数
*
* 初始化该对象上的各类参数
*
* 设置各类prototype的方法设置事件函数 
*/

	// 创建一个构造函数

	var scrollEvent = function(val){

		//初始化各类参数

		this.$ele = $(val);

		this.param = this.$ele.data("scroll-param");

		this.status = this.$ele.data("scroll-status");

		this.controlY = this.$ele.data("scroll-controlY");

		this.controlX = this.$ele.data("scroll-controlX");

	}

	// 设置事件函数，用于调用所有事件函数

	scrollEvent.prototype.setEvent = function(){

		// 初始化对象和参数

		var event = this,

		param = this.param;

		// 如果事件（event）参数为数组，则调用所有事件函数

		if($.isArray(param.event)){

			// 调用所有事件函数以绑定元素

			$.each(param.event, function(index, val) {
				
				event[val]  && event[val]();

			});

		// 如果事件（event）参数不为数组，则调用当前事件

		}else{

			event[param.event] && event[param.event]();

		}

	}

	// 定义默认的滚轮控制事件并放入事件函数的原型中

	scrollEvent.prototype.wheel = function(){

		// 初始化各类参数

		var me = this.$ele,

		status = this.status,

		param = this.param,

		speed = param.speed;

		// 添加滚轮事件

		me.on('mousewheel DOMMouseScroll', function(e) {

			// 判断是否只有横向滚动条，如果是则移动横向，否则移动垂直滚动条

			var control = param.axis==='x'?status.controlW:status.controlH,

			move = param.axis==='x'?status.moveW:status.moveH,

			box = param.axis==='x'?status.boxW: status.boxH-status.space;
			
			e.preventDefault();

			// 判断是否可以调用滚轮事件以及滚动条是否存在
			
			if(status.wheelflag && control){

				var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || // chrome & ie 判断滚轮方向
	            		(e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));// firefox  判断滚轮方向 

	            // 如果是向上滑动

	            if(delta>0){

	            	// 如果当前距离滚动条顶部或左边大于滚动速度，则滚动相应距离

	            	if(move>speed){

	            		move -= speed;

	            	// 如果当前滚动条距离顶部或左边小于滚动速度，则将滚动距离设置为0

	            	}else{

	            		move = 0;
	            	}

	            // 如果是向下滑动	

	            }else if(delta<0){

	            	// 如果当前滚动条距离底部或右边大于滚动速度，则滚动相应距离

	            	if(move+control+speed<box){

	            		move+=speed;

	            	// 如果当前滚动条距离底部或右边小于滚动速度，则滚动相应距离设置为最大距离

	            	}else{

	            		move = ~~(box-control);

	            	}

	            }

	            // 如果只有水平滚动条，则改变水平滚动距离，并调用水平滚动函数

	            if(param.axis ==='x'){

	            	status.moveW = move;

	            	me.scrollExcute('x');

	            // 否则改变垂直滚动距离，并调用垂直滚动函数

	            }else{

	            	status.moveH = move;

	            	me.scrollExcute('y');

	            }

			}

		});

	}

	// 定义默认的拖拽控制事件并放入事件函数的原型中

	scrollEvent.prototype.drag = function(){

		// 初始化各类参数

		var me = this.$ele,

		status = this.status,

		param = this.param,

		controlX = this.controlX,

		controlY = this.controlY,

		doc = $(document);

		interY = 0, // 鼠标点击时距离父级元素顶部的距离

		outerY = 0, // 鼠标移动时距离窗口顶部的距离

		interX = 0, // 鼠标点击时距离父级元素左侧的距离

		outerX = 0; // 鼠标移动时距离窗口左侧的距离

		// 如果存在水平滚动条，则给滚动条加上拖拽事件

		if(controlX){

			controlX.on('mousedown', function(e) {
				
				e = e || window.event;

				e.preventDefault();

				interX = e.offsetX;

				status.wheelflag = false;

				status.mouseX = true;

			});

		}

		// 如果存在垂直滚动条，则给滚动条加上拖拽事件

		if(controlY){

			controlY.on('mousedown', function(e) {
				
				e = e || window.event;

				e.preventDefault();

				interY = e.offsetY;

				status.wheelflag = false;

				status.mouseY = true;

			});

		}

		// 当鼠标松开，解除拖拽

		doc.on('mouseup', function(e) {

			if(!status.mouseH &&(status.mouseY ||status.mouseX) && !param.display){

				!!controlX && controlX.hide();

				!!controlY && controlY.hide();

			}
			
			status.mouseY = false;

			status.mouseX = false;

			status.wheelflag = true;

		});

		me.on('mouseup', function(e) {
			
			status.mouseY = false;

			status.mouseX = false;

			status.wheelflag = true;

		});

		// 当鼠标移动时，判断进行相应的滚动操作

		doc.on('mousemove', function(e) {

			// 如果点击的是垂直滚动条
			
			if(status.mouseY){

				var objToTop = me.offset().top, // 父级元素距离窗口顶部的距离

				outerY = e.clientY;

				status.moveH = outerY-interY-objToTop;

				if(status.moveH<0){

					status.moveH = 0;

				}else if(status.moveH + status.controlH>status.boxH-status.space){

					status.moveH = status.boxH-status.controlH-status.space;

				}

				me.scrollExcute('y');

			}

			// 如果点击的是水平滚动条

			if(status.mouseX){

				var objToLeft = me.offset().left,  // 父级元素距离窗口左侧的距离

				outerX = e.clientX;

				status.moveW = outerX - interX - objToLeft;

				if(status.moveW<0){

					status.moveW = 0;

				}else if(status.moveW+status.controlW>status.boxW-status.space){

					status.moveW = status.boxW-status.controlW-status.space;

				}

				me.scrollExcute('x');

			}
			
		});

	}

	// 定义默认的显示隐藏事件并放入事件函数的原型中

	scrollEvent.prototype.display = function(){

		var me = this.$ele,

		status = this.status,

		controlX = this.controlX,

		controlY = this.controlY;

		// 当鼠标进入父级元素时，如果有滚动条，则将其显示

		me.on('mouseover', function(e) {
			
			!!controlX && controlX.show();

			!!controlY && controlY.show();

		// 当鼠标进入父级元素时，如果有滚动条且不处于拖拽事件时，则将其隐藏

		}).on('mouseout', function(e) {
			
			(!!controlY && !status.mouseY) && controlY.hide();

			(!!controlX && !status.mouseX) &&  controlX.hide();

		});

	}

	// 定义默认的内容高度改变的监听事件并放入事件函数的原型中

	scrollEvent.prototype.change = function(){

		var me = this.$ele,

		status = this.status,

		controlX = this.controlX,

		controlY = this.controlY,

		// 调用Mutationobserver对象对其进行监控

		observer = new MutationObserver(function(){

			if(controlX){

				me.scrollUpdate(['x']);

				controlX.css('width',status.controlW);

				me.scrollExcute('x');

			}

			if(controlY){

				me.scrollUpdate(['y']);

				controlY.css('height',status.controlH);

				me.scrollExcute('y');
                                      
			}

			observer.disconnect();

			observer.observe(me.get(0),config);

		})

		var config = {attributes: true, childList: true,subtree:true}

		observer.observe(me.get(0),config);

	}

/*！
* 定义构造函数--执行函数
*
* 初始化该对象上的各类参数
*
* 设置各类prototype的方法：滚动条和内容高度的计算，并进行滚动操作
*/

	// 创建构造函数

	var scrollMethods = function(val){

		// 初始化各类参数

		this.$ele = $(val);

		this.param = this.$ele.data('scroll-param');

		this.status = this.$ele.data('scroll-status');

	}

	// 如果内容元素高度改变，进行垂直滚动条的更新

	scrollMethods.prototype.updateY = function(){

		var me = this.$ele,

		controlX = me.data('scroll-controlX'),

		controlY = me.data('scroll-controlY'),

		status = this.status;

		if(controlY){

			controlY.css('top',0);

		}

		if(controlX){

			controlX.css('bottom',0)

		}

		var contentH = me.prop('scrollHeight');

		var boxH = me.height(),

		controlH = contentH<=boxH?0:boxH/contentH*(boxH-status.space)>6?~~(boxH/contentH*(boxH-status.space)+0.5):6,

		moveH = ~~(me.scrollTop()*(boxH-status.space-controlH)/(contentH-boxH)+0.5);

		status.contentH = contentH;

		status.controlH = controlH;

		status.boxH = boxH;

		status.moveH = moveH;
	}

	// 如果内容元素宽度改变，进行水平滚动条的更新

	scrollMethods.prototype.updateX = function(){

		var me = this.$ele,

		controlX = me.data('scroll-controlX'),

		controlY = me.data('scroll-controlY'),

		status  = this.status;

		if(controlX){

			controlX.css('left',0);

		}

		if(controlY){

			controlY.css('right',0)

		}

		var contentW = me.prop('scrollWidth');

		var boxW = me.width(),

		controlW = contentW<=boxW?0:boxW/contentW*(boxW-status.space)>6?~~(boxW/contentW*(boxW-status.space)+0.5):6,

		moveW = ~~(me.scrollLeft()*(boxW-status.space-controlW)/(contentW-boxW)+0.5);

		status.contentW = contentW;

		status.controlW = controlW;

		status.boxW = boxW;

		status.moveW = moveW;

	}

	// 执行函数

	scrollMethods.prototype.doScroll = function(axis){

		this["calculate"+axis.toUpperCase()]();

	}

	// 执行垂直滚动条的移动

	scrollMethods.prototype.calculateY = function(){

		var me = this.$ele,

		status = this.status,

		control = me.data('scroll-controlY'),

		controlX = me.data('scroll-controlX');

		if(status.contentH<=status.boxH){

			control.css('height',0);

			arr = [0,0];

		}

		bDis = ~~(status.moveH*(status.contentH-status.boxH)/(status.boxH-status.space-status.controlH)+0.5);

		sDis = status.moveH + bDis;

		control.css('top',sDis);

		if(controlX){

			controlX.css('bottom',-bDis)

		}

		me.scrollTop(bDis);

	}

	// 执行水平滚动条的移动

	scrollMethods.prototype.calculateX = function(){

		var me = this.$ele,

		status = this.status,

		control = me.data('scroll-controlX'),

		controlY = me.data('scroll-controlY');

		if(status.contentW<=status.boxW){

			control.css('width',0);

			arr = [0,0];

		}

		bDis = ~~(status.moveW*(status.contentW-status.boxW)/(status.boxW-status.space-status.controlW)+0.5);

		sDis = status.moveW + bDis;

		control.css('left',sDis);

		if(controlY){

			controlY.css('right',-bDis)

		}

		me.scrollLeft(bDis);

	}

/*！
* 定义构造函数--初始化函数
*
* 初始化该对象上的各类参数
*
* 设置各类prototype的方法：包括初始化参数，初始化事件，初始化布局
*/

	var scrollInit = function(val,a,b,c,d,e){

		// 初始化对象上的参数

		this.$ele = $(val);

		// 参数

		this.$ele.data('scroll-param',this.initParam(a,b,c,d,e));

		// 执行状态

		this.$ele.data('scroll-status',{
			wheelflag:true, // 是否可以执行滚轮事件
			mouseX:false,   // 是否点击水平滚动条进行拖拽操作
			mouseY:false,   // 是否点击垂直滚动条进行拖拽操作
			mouseH:false,   // 鼠标是否在父级元素内部
			contentH:0,     // 父级元素内容高度
			contentW:0,     // 父级元素内容宽度
			boxH:0,         // 父级元素盒子高度
			boxW:0,         // 父级元素盒子宽度
			controlH:0,     // 垂直滚动条高度
			controlW:0,     // 水平滚动条宽度
			moveH:0,        // 垂直滚动条移动距离
			moveW:0,        // 水平滚动条移动距离
			space:0         // 垂直和水平滚动条同时出现时的间隙
		})

		this.arr = this.$ele.data('scroll-param').axis.split('');

	}

	// 初始化事件函数

	scrollInit.prototype.initEvent = function(){

		// 初始化各类参数

		var me = this.$ele,

		controlX = me.data('scroll-controlX'),

		controlY = me.data('scroll-controlY'),

		param = me.data('scroll-param'),

		display = param.display,

		arr = this.arr,

		event = new scrollEvent(me);

		if(!display){

			param.event.push('display');

			!!controlY && controlY.hide();

			!!controlX && controlX.hide();

		}

		// 当窗口发生变化时，自动调整滚动条

		// 用于保证窗口改变时效果的正确执行

		$(window).resize(function(e) {
			
			me.scrollUpdate(arr);

			!!controlY && controlY.css('height',status.controlH);

			!!controlX && controlX.css('width',status.controlW);

		});

		// 设置当鼠标移入盒子时将mouseH参数设置为true

		me.on('mouseover', function(e) {

			status.mouseH = true;

		// 设置当鼠标移出盒子时将mouseH参数设置为false
			
		}).on('mouseout', function(e) {
			
			status.mouseH = false;
			
		});

		event.setEvent();

	}

	// 初始化页面布局

	scrollInit.prototype.layout = function(){

		// 初始化各类参数

		var me = this.$ele,

		param = me.data('scroll-param'),

		status = me.data('scroll-status');

		if(me.css('position')==='static'){

			me.css('position','relative');

		}

		if(param.axis ==='yx' ||param.axis==='xy'){

			status.space = param.width;

		}

		// 获取当前所选的css类名

		var unscrollClass = 'lzscroll-'+param.theme;

		var controlY = $("<div class='"+unscrollClass+"-Y'></div>").addClass('scroll-controlY');

		var controlX = $("<div class='"+unscrollClass+"-X'></div>").addClass('scroll-controlX');

		// 如果axis为x，添加水平滚动条

		if(param.axis === 'x'){

			controlX.appendTo(me)

			me.data('scroll-controlX',me.find('.scroll-controlX'));

		// 如果axis为y，添加垂直滚动条

		}else if(param.axis === 'y'){

			controlY.appendTo(me)

			me.data('scroll-controlY',me.find('.scroll-controlY'));

		// 如果axis为xy或者yx，添加水平和垂直滚动条

		}else{

			controlY.appendTo(me);

			controlX.appendTo(me);

			me.data('scroll-controlX',me.find('.scroll-controlX'));

			me.data('scroll-controlY',me.find('.scroll-controlY'));

		}

		// 更新滚动条状态

		me.scrollUpdate(this.arr);

		// 设置滚动条的样式

		if(me.data('scroll-controlY')){

			me.data('scroll-controlY').css('height',status.controlH);

		}

		if(me.data('scroll-controlX')){

			me.data('scroll-controlX').css('width',status.controlW);

		}
		
	}

	// 初始化各项参数	

	scrollInit.prototype.initParam = function(a,b,c,d,e){

		var param = {

			// 滚动条参数，默认值为y

			// 取值包括y（可省略） x xy yx

			axis : 'y',

			// 类名

			theme : 'default',

			// 滚轮滚动的速度

			// 默认取值20，即滚一下，滚动条滚动20px的距离

			// 参数可缺省

			speed : 20,

			// 自动隐藏参数

			// 默认值为true

			// 取值 true false

			display : true,

			// 滚动条的宽度

			// 默认取值8

			// 参数可缺省

			width : 8,

			// 事件参数

			// 非传参参数

			event : ['wheel','drag','change']

		}

		if($.isObject(a)){

			param = $.extend({},param,a);

		}else{

			param.axis = a;

			param.speed = b;

			param.width = c;

			param.display = d;

			param.theme = e;

		}

		!isNaN(a) && (param.speed=a);

		typeof a ==='boolean' && (param.display = a);

		if(this.$ele.data('scroll-param')){

			param = $.extend({},param,this.$ele.data('scroll-param'));

		}

		param.axis = (param.axis == 'x' || param.axis =='y' || param.axis == 'xy' ||param.axis =='yx')?param.axis:'y';

		param.display = (param.display===false)?false:true;

		isNaN(param.speed) && (param.speed = 20);

		isNaN(param.width) && (param.width = 10);

		!param.theme && (param.theme = 'default');

		return param;

	}

/*！
* 在jQuery原型中创建一个对象级方法，用于当内容高度或宽度改变时，调用该函数进行滚动条的修整
*/

	$.fn.scrollUpdate = function(arr){

		var me = $(this).get(0);

		$.each(arr, function(index, val) {
			
			me.scrollexcute["update"+val.toUpperCase()]();

		});

	}

/*！
* 在jQuery原型中创建一个对象级方法，用于调用执行方法
*/

	$.fn.scrollExcute =function(axis){

		var me = $(this).get(0);

		me.scrollexcute.doScroll(axis);

	}

/*！
* 在jQuery原型中创建一个对象级方法，用于调用scroll方法
*/

	$.fn.lzscroll = function(a,b,c,d,e){

		// 将调用对象保保存在变量me中

		// 此处非功能对象而是页面上的元素DOM对象

		var me = $(this);

		// 循环遍历添加scroll方法

		$.each(me, function(index, val) {
			
			var newScrollBar = new scrollInit(val,a,b,c,d,e);

			val.scrollexcute = new scrollMethods(val);

			newScrollBar.layout();

			newScrollBar.initEvent();

		});

		return me;

	}

})(jQuery)