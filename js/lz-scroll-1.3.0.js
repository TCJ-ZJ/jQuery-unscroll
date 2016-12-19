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

	});

	// 事件构造函数

	var scrollEvent = function(val){

		this.$ele = $(val);

		this.param = this.$ele.data("lzscroll-param");

		this.status = this.$ele.data("lzscroll-status");

		this.containerX = this.$ele.data("lzscroll-containerX");

		this.containerY = this.$ele.data("lzscroll-containerY");

		this.barX = this.$ele.data("lzscroll-barX");

		this.barY = this.$ele.data("lzscroll-barY");

	}

	// 设置事件函数，用于调用所有事件函数

	scrollEvent.prototype.setEvent = function(){

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

	// 滚轮事件

	scrollEvent.prototype.wheel = function(){

		var me = this.$ele,

		status = this.status,

		param = this.param;

		me.on('mousewheel.lzscroll DOMMouseScroll.lzscroll', function(e){

			var control = param.axis === 'x'?status.controlW:status.controlH,

			scroll = param.axis ==='x'?me.scrollLeft():me.scrollTop(),

			content = param.axis ==='x'?status.contentW:status.contentH,

			box = param.axis ==='x'?status.boxW:status.boxH,

			temp = scroll,

			speed = param.speed;

			if(status.wheelflag && control){

				var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || // chrome & ie 判断滚轮方向
	            		(e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));// firefox  判断滚轮方向

	            if(delta>0){

	            	scroll -= speed;

	            }else if(delta<0){

	            	scroll += speed;

	            }

	            if(param.axis==='x'){

	            	me.scrollLeft(scroll);

	            }else{

	            	me.scrollTop(scroll);
	            }

	            if((temp!==0 || scroll!==0) && (temp!==content-box || scroll!==content-box)) return false;

			}

		});

	}

	// 为相应的mode添加相应的事件

	scrollEvent.prototype.display = function(){

		var me = this.$ele,

		status = this.status,

		param = this.param,

		containerY = this.containerY,

		containerX = this.containerX,

		scrollValue = 0,

		interval = null;

		me.off('.scrolldisplay');

		// 当mode设置为hover时，设置鼠标移入出现滚动条，移出滚动条消失的事件

		if(param.mode ==='hover'){

			me.on('mouseover.scrolldisplay', function(e) {
				
				!!containerY && containerY.stop().fadeIn(200);

				!!containerX && containerX.stop().fadeIn(200);

			}).on('mouseout.scrolldisplay', function(e) {
				
				(!!containerY && !status.mouseY) && containerY.stop().fadeOut(200);

				(!!containerX && !status.mouseX) && containerX.stop().fadeOut(200);

			});

		// 当mode设置为active时，当滚动时滚动条出现

		}else if(param.mode==='active'){

			me.on('scroll.scrolldisplay', function(e) {
				
				!!containerY && containerY.show();

				!!containerX && containerX.show();

				if(interval){

					clearTimeout(interval);

					interval = null;

				}

				interval = setTimeout(function(){

					!!containerY && containerY.fadeOut(200);

					!!containerX && containerX.fadeOut(200);

				},1000)

			});

		}

	}

	// 设置拖拽事件

	scrollEvent.prototype.drag = function(){

		var me = this.$ele,

		status = this.status,

		param = this.param,

		barX = this.barX,

		barY = this.barY,

		containerX = this.containerX,

		containerY = this.containerY,

		doc = $(document);

		interY = 0,

		outerY = 0,

		interX = 0,

		outerX = 0;

		if(barX){

			barX.off('mousedown.lzscroll').on('mousedown.lzscroll', function(e) {

				e.preventDefault();

				interX = e.offsetX;

				status.wheelflag = false;

				status.mouseX = true;
				
			});

		}

		if(barY){

			barY.off('mousedown.lzscroll').on('mousedown.lzscroll', function(e) {

				e.preventDefault();

				interY = e.offsetY;

				status.wheelflag = false;

				status.mouseY = true;

			});

		}

		doc.on('mouseup', function(e) {

			e.preventDefault();

			if(!status.mouseH &&(status.mouseY ||status.mouseX) && param.display==='hover'){

				!!containerX && containerX.hide();

				!!containerY && containerY.hide();

			}
			
			status.mouseY = false;

			status.mouseX = false;

			status.wheelflag = true;

		});

		me.off('mouseup.lzscroll').on('mouseup.lzscroll', function(e) {
			
			status.mouseY = false;

			status.mouseX = false;

			status.wheelflag = true;

		});

		doc.on('mousemove', function(e) {
			
			if(status.mouseY){

				var objToTop = me.offset().top,

				outerY = e.clientY;

				status.moveH = outerY-interY-objToTop;

				if(status.moveH<0){

					status.moveH = 0;
				}else if(status.moveH + status.controlH > status.boxH -status.space){

					status.moveH = status.boxH - status.controlH -status.space;

				}

				bDis = ~~(status.moveH*(status.contentH-status.boxH)/(status.boxH-status.space-status.controlH)+0.5);

				me.scrollTop(bDis);

				containerY.css('top',bDis);

				barY.css('top',status.moveH);

				if(containerX) containerX.css('bottom',-bDis);

			}

			if(status.mouseX){

				var objToLeft = me.offset().left,  // 父级元素距离窗口左侧的距离

				outerX = e.clientX;

				status.moveW = outerX - interX - objToLeft;

				if(status.moveW<0){

					status.moveW = 0;

				}else if(status.moveW+status.controlW>status.boxW-status.space){

					status.moveW = status.boxW-status.controlW-status.space;

				}

				var bDis = ~~(status.moveW*(status.contentW-status.boxW)/(status.boxW-status.space-status.controlW)+0.5);

				me.scrollLeft(bDis);

				containerX.css('left',bDis);

				barX.css('left',status.moveW);

				if(containerY) containerY.css('right',-bDis);

			}

		});
	}

	// 设置元素改变的监听事件

	scrollEvent.prototype.listenChange = function(){

		var me = this.$ele,

		status = this.status,

		containerX = this.containerX,

		containerY = this.containerY;

		if(MutationObserver){

			var observer = new MutationObserver(function(){

				var w = me.width(),

				h = me.height(),

				sw = me.prop('scrollWidth'),

				sh = me.prop('scrollHeight');

				if(w!==status.boxW || h!==status.boxH || sw!==status.contentW || sh!==status.contentH){

					!!containerX && containerX.css('width',status.boxW-status.space);

					!!containerY && containerY.css('height',status.boxH-status.space);

					me.get(0).scrollexcute.updateBox();

					me.barUpdate('Style',status.axis);

					me.barUpdate('Pos',status.axis);

				}

				observer.disconnect();

				observer.observe(me.get(0),config);

			})

			var config = {attributes:true,childList:true,subtree:true};

			observer.observe(me.get(0),config);

		}else{

			if(k) clearInterval(k);

			var k = setInterval(function(){

				var w = me.width(),

				h = me.height(),

				sw = me.prop('scrollWidth'),

				sh = me.prop('scrollHeight');

				if(w!==status.boxW || h!==status.boxH || sw!==status.contentW || sh!==status.contentH){

					!!containerX && containerX.css('width',status.boxW-status.space);

					!!containerY && containerY.css('height',status.boxH-status.space);

					me.get(0).scrollexcute.updateBox();

					me.barUpdate('Style',status.axis);

					me.barUpdate('Pos',status.axis);

				}

			},100)

		}

	}

	// 方法构造函数

	var scrollMethods = function(val){

		this.$ele = $(val);

		this.param = this.$ele.data('lzscroll-param');

		this.status = this.$ele.data('lzscroll-status');

	}

	// 更新盒子的大小

	scrollMethods.prototype.updateBox = function(){

		var me  = this.$ele,

		status = this.status,

		containerX = this.$ele.data('lzscroll-containerX'),

		containerY = this.$ele.data('lzscroll-containerY');

		if(containerX){

			containerX.css({bottom:0,left:0})

		}

		if(containerY){

			containerY.css({top:0,right:0})

		}

		status.boxH = me.height();

		status.boxW = me.width();

		status.contentW = me.prop('scrollWidth');

		status.contentH = me.prop('scrollHeight');

	}

	// 更新垂直滚动条的位置

	scrollMethods.prototype.updatePosY = function(){

		var me = this.$ele,

		containerX = me.data('lzscroll-containerX'),

		containerY = me.data('lzscroll-containerY'),

		barY = me.data('lzscroll-barY'),

		status = this.status,

		scroll = me.scrollTop();

		moveH =  ~~(scroll*(status.boxH-status.space-status.controlH)/(status.contentH-status.boxH)+0.5);

		status.moveH = moveH;

		if(containerY){

			containerY.css('top',scroll);

			barY.css('top',moveH);

		}

		if(containerX){

			containerX.css('bottom',-scroll);

		}

	}

	// 更新水平滚动条的位置

	scrollMethods.prototype.updatePosX = function(){

		var me = this.$ele,

		containerX = me.data('lzscroll-containerX'),

		containerY = me.data('lzscroll-containerY'),

		barX = me.data('lzscroll-barX'),

		status = this.status;

		var scroll = me.scrollLeft();

		moveW = ~~(scroll*(status.boxW-status.space-status.controlW)/(status.contentW-status.boxW)+0.5);

		status.moveW = moveW;

		if(containerY){

			containerY.css('right',-scroll);

		}

		if(containerX){

			containerX.css('left',scroll);

			barX.css('left',moveW);

		}

	}

	// 更新垂直滚动条的样式

	scrollMethods.prototype.updateStyleY = function(){

		var me = this.$ele,

		containerY = me.data('lzscroll-containerY'),

		barY = me.data('lzscroll-barY'),

		status = this.status,

		param = this.param,

		boxH = status.boxH,

		contentH = status.contentH,

		space = status.space,

		controlH = contentH<boxH?0:boxH/contentH*(boxH-space)>6?~~(boxH/contentH*(boxH-space)+0.5):6;

		param.barChange===true?(status.controlH = controlH):(status.controlH = barY.height());

		if(controlH >= boxH-space){

			containerY.css('display','none');

		}else{

			param.display!=='active' && containerY.css('display','block');

			param.barChange && barY.css('height',controlH);

		}

		

	}

	// 更新水平滚动条的样式

	scrollMethods.prototype.updateStyleX = function(){

		var me = this.$ele,

		containerX = me.data('lzscroll-containerX'),

		barX = me.data('lzscroll-barX'),

		status = this.status,

		param = this.param,

		boxW = status.boxW,

		contentW = status.contentW,

		space = status.space,

		controlW = contentW<boxW?0:boxW/contentW*(boxW-space)>6?~~(boxW/contentW*(boxW-space)+0.5):6;

		param.barChange===true?(status.controlW = controlW):(status.controlW = barY.width());

		if(controlW >= boxW-space){

			containerX.css('display','none');

		}else{

			param.display!=='active' && containerX.css('display','block');

			param.barChange && barX.css('width',controlW);

		}

		

	}

	// 初始化构造函数

	var scrollInit = function(val,a,b,c,d){

		this.$ele = $(val);

		this.$ele.data('lzscroll-param',this.initParam(a,b,c,d));

		this.$ele.data('lzscroll-status',{
			wheelflag: true,
			axis: [],
			mouseX: false,
			mouseY: false,
			mouseH: false,
			contentH: 0,
			contentW: 0,
			boxH: 0,
			boxW: 0,
			controlH: 0,
			contorlW: 0,
			moveH: 0,
			moveW: 0,
			space: 0 
		})

	}

	// 初始化参数

	scrollInit.prototype.initParam = function(a,b,c,d){

		var param = {

			axis: 'y',

			theme: 'default',

			speed: 120,

			barChange: true,

			mode: 'always',

			containerWidth: 8,

			barWidth: 6,

			listenChange: true,

			_onScroll:null,

			event:['wheel']

		}

		if($.isObject(a)){

			param = $.extend({},param,a);

		}else{

			param .axis = a;

			param.speed = b;

			param.mode = c;

			param.theme = d;

		}

		!isNaN(a) && (param.speed = a);

		if(this.$ele.data('lzscorll-param')){

			param = $.extend({},this.$ele.data('lzscroll-param'));

		}

		param.axis = (param.axis =='x' || param.axis =='y' || param.axis == 'xy' || param.axis =='yx')?param.axis:'y';

		param.mode = (param.mode=='active' || param.mode =='hover' || param.mode=='always')?param.mode:'active';

		isNaN(param.speed) && (param.speed = 20);

		isNaN(param.containerWidth) && (param.containerWidth = 8);

		isNaN(param.BarWidth) && (param.BarWidth =6);

		param.listenChange = param.listenChange===false?false:true;

		param.barChange = param.barChange===false?false:true;

		!param.theme && (param.theme = 'default');

		return param;

	}

	// 初始化布局

	scrollInit.prototype.layout = function(){

		var me = this.$ele,

		param = me.data('lzscroll-param'),

		status = me.data('lzscroll-status');

		status.axis = param.axis.split('');

		status.boxH = me.height();

		status.boxW = me.width();

		status.contentH = me.prop('scrollHeight');

		status.contentW = me.prop('scrollWidth');

		me.css('position')==='static' && me.css('position','relative');

		me.css('overflow')!=='hidden' && me.css('overflow','hidden');

		(param.axis ==='yx' || param.axis === 'xy') && (status.space = param.containerWidth);

		var scrollCls = 'lzscroll-'+ param.theme,

		containerY = $("<div class='"+scrollCls+"-containerY'></div>").css({
			height:status.boxH-status.space,
			width:param.containerWidth,
			top:0,
			right:0,
			position:'absolute',
			marginRight:1
		}),

		containerX = $("<div class='"+scrollCls+"-containerX'></div>").css({
			width:status.boxW-status.space,
			height:param.containerWidth,
			left:0,
			bottom:0,
			position:'absolute',
			marginBottom:1
		}),

		barY = $("<div class='"+scrollCls+"-barY'></div>").css({
			width:param.barWidth,
			left:(param.containerWidth-param.barWidth)/2,
			top:0,
			position:'absolute'
		}),

		barX = $("<div class='"+scrollCls+"-barX'></div>").css({
			height:param.barWidth,
			top:(param.containerWidth-param.barWidth)/2,
			left:0,
			position:'absolute'
		});

		if(param.axis ==='x'){

			containerX.append(barX).appendTo(me);

			me.data('lzscroll-containerX',containerX);

			me.data('lzscroll-barX',barX)

		}else if(param.axis ==='y'){

			containerY.append(barY).appendTo(me);

			me.data('lzscroll-containerY',containerY);

			me.data('lzscroll-barY',barY);

		}else{

			containerX.append(barX).appendTo(me);

			containerY.append(barY).appendTo(me);

			me.data('lzscroll-containerX',containerX);

			me.data('lzscroll-barX',barX);

			me.data('lzscroll-containerY',containerY);

			me.data('lzscroll-barY',barY);

		}

		me.barUpdate('Style',status.axis);

	}

	// 初始化事件

	scrollInit.prototype.initEvent = function(){

		var me = this.$ele,

		param = me.data('lzscroll-param'),

		status = me.data('lzscroll-status'),

		containerY = me.data('lzscroll-containerY'),

		containerX = me.data('lzscroll-containerX'),

		event = new scrollEvent(me);

		if(param.mode !== 'always'){

			param.event.push('display');

			!!containerX && containerX.hide();

			!!containerY && containerY.hide();

		}

		if(param.mode !=='active') param.event.push('drag');

		$(window).resize(function(e) {
			
			status.boxW = me.width();

			status.boxH = me.height();

			me.barUpdate('Style',status.axis);

		});

		me.off('.lzscorll');

		me.on('mouseover.lzscroll', function(e) {
			
			status.mouseH = true;

		}).on('mouseout.lzscroll', function(e) {
			
			status.mouseH = false;

		}).on('scroll.lzscroll', function(e) {
			
			if(status.wheelflag) me.barUpdate('Pos',status.axis);

			if(param._onScroll) param._onScroll.call(this,param,status);

		});

		param.listenChange && (param.event.push('listenChange'));

		event.setEvent();

	}

	// 用户可使用的方法集

	var tool = function(val){

		this.$ele = $(val);

	}

	tool.prototype.destroy = function(){

		var me = this.$ele;

		$.each(me,function(index,val){

			var self = $(val);

			containerX = self.data('lzscroll-containerX'),

			containerY = self.data('lzscroll-containerY'),

			!!containerX && containerX.remove();

			!!containerY && containerY.remove();

			self.off('.lzscroll').off('.scrolldisplay');

			self.removeData('lzscroll-param').removeData('lzscroll-status');

		})

		return false;

	}

	// 重新初始化插件

	tool.prototype.init = function(a,b,c,d){

		var me = this.$ele;

		$.each(me,function(index,val){

			var self = $(val);

			self.scrollTop(0);

			self.scrollLeft(0);

			containerX = self.data('lzscroll-containerX'),

			containerY = self.data('lzscroll-containerY'),

			!!containerX && containerX.remove();

			!!containerY && containerY.remove();

		})

		me.lzscroll(a,b,c,d);

	}

	// 当没有参数时，获取当前的滚动高度，有参数时，将其滚动到指定的位置

	tool.prototype.scrollTop = function(num){

		var me = this.$ele;

		if(num===undefined){

			return me.eq(0).scrollTop();

		}else{

				setTimeout(function(){

					me.scrollTop(num);

				 },20)

				return this;

			} 


	}

	// 当没有参数时，获取当前的滚动水平距离，有参数时，将其滚动到指定的位置

	tool.prototype.scrollLeft = function(num){

		var me = this.$ele;

		if(num===undefined){

			return me.eq(0).scrollLeft();

		}else{

			setTimeout(function(){

				me.scrollLeft(num);

			},20);

			return this;

		} 

	}

	// 设置滚动条盒子的宽度

	tool.prototype.setContainerWidth = function(num){

		var me = this.$ele;

		$.each(me,function(index,val){

			var self = $(val),

			param = $(val).data('lzscroll-param'),

			status = $(val).data('lzscroll-status');

			param.containerWidth = num;

			(param.axis ==='yx' || param.axis === 'xy') && (status.space = param.containerWidth);

			!!self.data('lzscroll-containerY') && self.data('lzscroll-containerY').css({width:num,height:status.boxH-status.space});

			!!self.data('lzscroll-containerX') && self.data('lzscroll-containerX').css({height:num,width:status.boxW-status.space});

			!!self.data('lzscroll-barY') && self.data('lzscroll-barY').css({left:(param.containerWidth-param.barWidth)/2});

			!!self.data('lzscroll-barX') && self.data('lzscroll-barX').css({bottom:(param.containerWidth-param.barWidth)/2});

			self.barUpdate('Style',status.axis);

			self.barUpdate('Pos',status.axis);		

		})

		return this;

	}

	// 设置滚动条的宽度

	tool.prototype.setBarWidth = function(num){

		var me = this.$ele;

		$.each(me,function(index,val){

			var self = $(val),

			param = $(val).data('lzscroll-param');

			param.barWidth = num;

			!!self.data('lzscroll-barY') && self.data('lzscroll-barY').css({width:num,left:(param.containerWidth-param.barWidth)/2});

			!!self.data('lzscroll-barX') && self.data('lzscroll-barX').css({height:num,bottom:(param.containerWidth-param.barWidth)/2});

		})

		return this;

	}

	// 设置显示模式

	tool.prototype.setMode = function(str){

		var me = this.$ele;

		$.each(me,function(index,val){

			var self = $(val),

			containerX = self.data('lzscroll-containerX'),

			containerY = self.data('lzscroll-containerY');

			if(str==='active' || str ==='hover'){

				!!containerX && containerX.hide();

				!!containerY && containerY.hide();

				var event = new scrollEvent(val);

				self.data('lzscroll-param').mode = str;

				event.display();

			}else {

				!!containerX && containerX.show();

				!!containerY && containerY.show();

				self.data('lzscroll-param').mode = 'always';

				self.off('.scrolldisplay');

			}

		})

	}

	// 设置class名称

	tool.prototype.setTheme = function(str){

		var me =this.$ele;

		$.each(me,function(index,val){

			var self = $(val),

			containerX = self.data('lzscroll-containerX'),

			containerY = self.data('lzscroll-containerY'),

			barX = self.data('lzscroll-barX'),

			barY = self.data('lzscroll-barY'),

			param = self.data('lzscroll-param'),

			oldCls = 'lzscroll-'+ param.theme,

			newCls = 'lzscroll-'+ str;

			$(val).data('lzscroll-param').theme = str;

			!!containerX && containerX.removeClass(oldCls+'-containerX').addClass(newCls+'-containerX');

			!!containerY && containerY.removeClass(oldCls+'-containerY').addClass(newCls+'-containerY');

			!!barX && barX.removeClass(oldCls+'-barX').addClass(newCls+'-barX');

			!!barY && barY.removeClass(oldCls+'-barY').addClass(newCls+'-barY');

		})

		return this;

	}

	// 设置滚动速度

	tool.prototype.setSpeed = function(num){

		var me = this.$ele;

		$.each(me,function(index,val){

			$(val).data('lzscroll-param').speed = num;

		})

		return this;

	}

	// 设置滚动时的回调函数

	tool.prototype.on = function(str,fn){

		var me = this.$ele;

		if(str==='scroll'){

			$.each(me,function(index,val){

				if(typeof fn ==='function') $(val).data('lzscroll-param')._onScroll = fn;	

			})

		}

	}

	// 更新滚动条位置或样式

	$.fn.barUpdate = function(v,arr){

		var me = $(this).get(0);

		for(var i=0;i<arr.length;i++){

			me.scrollexcute['update'+v+arr[i].toUpperCase()]();

		}

	}

	$.fn.scrollTool = function(){

		var me = $(this);

		return new tool(me);

	}

	// 插件入口

	$.fn.lzscroll = function(a,b,c,d){

		var me = $(this);

		$.each(me,function(index,val){

			var newScrollBar = new scrollInit(val,a,b,c,d);

			val.scrollexcute = new scrollMethods(val);

			newScrollBar.layout();

			newScrollBar.initEvent();

		})

		return me.scrollTool();

	}

})(jQuery)