;(function(factory){

	"use strict";

	if(typeof define ==='function'){ 

		define(['jquery'],factory);

	}else if(typeof module !=='undefined' && module!==null){

		module.exports = factory(jQuery);

	}else{

		factory(jQuery);

	}

})(function($){

	"use strict";

	var lzscroll = {

		version:'1.0.0',

		author:'tcj',

		date:'2017-07-02'

	}

	$.extend({

		// 判断参数是否为object对象，是返回true，否则返回false

		isObject: function(v) {

			return Object.prototype.toString.call(v) === '[object Object]';

		},

		isFunction:function(v){

			return Object.prototype.toString.call(v) ==='[object Function]';

		}

	});

	var requestAnimationFrame =window.requestAnimationFrame ||window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callback ){

				window.setTimeout(callback, 1000 / 60);

			},

		cancelRequestAnimationFrame = window.cancelAnimationFrame || clearTimeout;

	var scrollEvent = function(val){

		this.$ele = $(val);

		this.param = this.$ele.data('lzscroll-param');

		this.status = this.$ele.data('lzscroll-status');

		this.containerX = this.$ele.data('lzscroll-containerX');

		this.containerY = this.$ele.data('lzscroll-containerY');

		this.barX = this.$ele.data('lzscroll-barX');

		this.barY = this.$ele.data('lzscroll-barY');

	}

	scrollEvent.prototype = {

		constructor:scrollEvent,

		setEvent:function(){

			var event = this;

			$.each(this.param.event,function(index,val){

				event[val] && event[val]();

			})

		},

		// 滑轮滚动事件

		wheel:function(){

			var me = this.$ele,

			self = me.get(0).scrollMethods,

			param = this.param,

			status = this.status,

			delta = 0;

			me.on('mousewheel.lzscroll DOMMouseScroll.lzscroll', function(e) {

				self._refresh();

				var control = param.axis ==='x'?status.controlW:status.controlH,

				content = param.axis ==='x'?status.contentW:status.contentH,

				box = param.axis ==='x'?status.boxW:status.boxH,

				temp = param.axis ==='x'?me.scrollLeft():me.scrollTop();

				if(status.canWheel && control){

					if(e.originalEvent.wheelDelta){

						delta = e.originalEvent.wheelDelta>0?(e.originalEvent.wheelDelta+10)/120:(e.originalEvent.wheelDelta-10)/120;

					}else if(e.originalEvent.detail){

						status.firefoxwheel?(status.firefoxwheel-=e.originalEvent.detail/2):(status.firefoxwheel-=e.originalEvent.detail/40);

						delta = status.firefoxwheel;

					}

	            	self._setAnimateParam(param.animation?~~(param.speed/100*6):1,param.distance*(-delta),param.axis);

	            	self._animateScroll();

	            	var scroll = param.axis ==='x'?me.scrollLeft():me.scrollTop();

	            	if((temp!==0 || scroll!==0) && (temp!==content-box || scroll!==content-box)) return false;

	            }

	        });

		},

		// 滚动条模式设置

		display:function(){

			var me = this.$ele,

			status = this.status,

			param = this.param,

			containerY = this.containerY,

			containerX = this.containerX,

			interval = null;

			me.off('.scrolldisplay');

			if(param.mode ==='hover'){

				me.on('mouseenter.scrolldisplay', function(e) {
					
					(!!containerY && status.controlH && !status.mouseY && !status.mouseX) && containerY.stop().hide().fadeIn(200);

					(!!containerX && status.controlW && !status.mouseY && !status.mouseX) && containerX.stop().hide().fadeIn(200);

				}).on('mouseleave.scrolldisplay', function(e) {
					
					(!!containerY && !status.mouseY && !status.mouseX) && containerY.stop().fadeOut(200);

					(!!containerX && !status.mouseX && !status.mouseY) && containerX.stop().fadeOut(200);

				});

			}else if(param.mode==='active'){

				me.on('scroll.scrolldisplay', function(e) {

					(!!containerY && status.controlH) && containerY.show();

					(!!containerX && status.controlW) && containerX.show();

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

		},

		//拖拽滚动条事件

		drag:function(){

			var me = this.$ele,

			self = me.get(0).scrollMethods,

			status = this.status,

			param  = this.param,

			containerX = this.containerX,

			containerY = this.containerY,

			doc = $(document),

			interY = 0,

			outerY = 0,

			interX = 0,

			outerX = 0;

			if(this.barX){

				this.barX.off('mousedown.lzscroll').on('mousedown.lzscroll', function(e) {

					self._refresh();

					interX = e.offsetX;

					status.canWheel = false;

					status.mouseX = true;

					return false;
					
				}).off('click.lzscroll').on('click.lzscroll',function(e){

					return false;

				})

			}

			if(this.barY){

				this.barY.off('mousedown.lzscroll').on('mousedown.lzscroll', function(e) {

					self._refresh();

					interY = e.offsetY;

					status.canWheel = false;

					status.mouseY = true;

					return false;

				}).off('click.lzscroll').on('click.lzscroll',function(e){

					return false;

				})

			}

			doc.on('mouseup', function(e) {

				e.preventDefault();

				if(!status.mouseH &&(status.mouseY ||status.mouseX) && param.mode==='hover'){

					!!containerX && containerX.hide();

					!!containerY && containerY.hide();

				}
				
				status.mouseY = false;

				status.mouseX = false;

				status.canWheel = true;

			});

			me.off('mouseup.lzscroll').on('mouseup.lzscroll', function(e) {
				
				status.mouseY = false;

				status.mouseX = false;

				status.canWheel = true;

			});

			me.off('click.lzscroll').on('click.lzscroll', function(e) {
				
				if(param.stopBubble) return false;

			});;

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

					!self._topOrButtom(bDis,'y') && self._doScrollY(bDis);

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

					!self._topOrButtom(bDis,'x') && self._doScrollX(bDis);

				}

			});


		},

		// 实时监听滚动条变化

		listenChange:function(){

			var me = this.$ele,

			self = me.get(0).scrollMethods,

			status = this.status;

			if(!status.timer){

				status.timer = setInterval(function(){

					var stamp = me.data('lzscroll-stamp');

					stamp && self._refresh();	

					!stamp && clearInterval(status.timer);

				},100) 

			}
		}

	}

	// 方法集

	var scrollMethods = function(val){

		this.$ele = $(val);

		this.param = this.$ele.data('lzscroll-param');

		this.status = this.$ele.data('lzscroll-status');

		this.containerX = this.$ele.data('lzscroll-containerX');

		this.containerY = this.$ele.data('lzscroll-containerY');

		this.barX = this.$ele.data('lzscroll-barX')

		this.barY = this.$ele.data('lzscroll-barY');

	}

	scrollMethods.prototype = {

		constructor:scrollMethods,

		// 判断滚动条是否到顶或底

		_topOrButtom:function(dis,dir){

			var status = this.status,

			top = dir==='x'?status.scrollW==0:status.scrollH==0,

			scrollDis = dir==='x'?status.contentW-status.boxW:status.contentH-status.boxH,

			bottom = dir==='x'?(status.scrollW == scrollDis ):(status.scrollH == scrollDis);

			if((top && dis<=0)||(bottom && dis>=scrollDis)) return true;

			return false;

		},

		// 设置滚动动画的参数

		_setAnimateParam:function(times,dis,dir){

			var status = this.status;

			if(this._topOrButtom(dis,dir)) return;

			status.times = times>1?times:1;

			status.lastdis = (dis % status.times);

			status.dis = ~~((dis-status.lastdis)/status.times);

			status.times++;

			status.dir = dir==='x'?'x':'y';

		},

		// 调整滚动的数值

		_fixScrollVal:function(scroll,axis){

			var status = this.status;

			scroll = (scroll<0)?0:scroll;

			axis=='y'?(scroll = (scroll>(status.contentH-status.boxH))?status.contentH-status.boxH:scroll):(scroll = (scroll>(status.contentW-status.boxW))?status.contentW-status.boxW:scroll);

			return scroll;	

		},

		// 执行滚动动画

		_animateScroll:function(){

			var status = this.status,

			me = this;

			status.times--;

			if(status.times==0){

				status.dir==='x'?this._doScrollX(status.scrollW+status.lastdis):this._doScrollY(status.scrollH+status.lastdis);

			}else if(status.times>=1){

				status.dir==='x'?this._doScrollX(status.scrollW+status.dis):this._doScrollY(status.scrollH+status.dis);

			}

			cancelRequestAnimationFrame(status.requestid);

			if(status.times>0){

				status.requestid = requestAnimationFrame(function(){me._animateScroll()});

			}else{

				status.firefoxwheel = 0;

				if($.isFunction(status.callback)){

					status.callback();

					status.callback = null;

				}

			}

		},

		// 更新滚动条样式

		_updateBox:function(){

			var me = this.$ele,

			status = this.status,

			containerX = this.containerX,

			containerY = this.containerY,

			flag = false;

			!!containerX && containerX.css({bottom:0,left:0});

			!!containerY && containerY.css({top:0,right:0});

			var w = me.innerWidth(),

			h = me.innerHeight(),

			sw = me.prop('scrollWidth'),

			sh = me.prop('scrollHeight'),

			sl = me.scrollLeft(),

			st = me.scrollTop();

			(status.boxH != h) && (status.boxH = h,flag=true);

			(status.boxW != w) && (status.boxW = w,flag = true);

			(status.contentW != sw) && (status.contentW=sw,flag = true);

			(status.contentH != sh) && (status.contentH =sh,flag = true);

			(!!containerY && status.moveH>h-this.barY.height()-status.space) && (flag = true);

			(!!containerX && status.moveX>w-this.barX.width()-status.space) && (flag = true);

			!!containerX && containerX.css({left:sl,bottom:-st});

			!!containerY && containerY.css({top:st,right:-sl});

			return flag;

		},

		// 执行纵向滚动条滚动

		_doScrollY:function(scroll){

			var me = this.$ele,

			param = this.param,

			status = this.status;

			scroll = this._fixScrollVal(scroll,'y');

			var moveH = ~~(scroll*(status.boxH-status.space-status.controlH)/(status.contentH-status.boxH)+0.5);

			status.moveH = moveH;

			if(this.containerY){

				this.containerY.css('top',scroll);

				this.barY.css('top',moveH);

			}

			if(this.containerX) this.containerX.css('bottom',-scroll);

			status.scrollH = scroll;

			param._onScroll && param._onScroll();

			me.scrollTop(scroll);

		},

		// 执行横向滚动条滚动

		_doScrollX : function(scroll){

			var me = this.$ele,

			param = this.param,

			status = this.status;

			scroll = this._fixScrollVal(scroll,'x');

			var moveW = ~~(scroll*(status.boxW-status.space-status.controlW)/(status.contentW-status.boxW)+0.5);

			status.moveW = moveW;

			if(this.containerX){

				this.containerX.css('left',scroll);

				this.barX.css('left',moveW);

			}

			if(this.containerY) this.containerY.css('right',-scroll);

			status.scrollW = scroll;

			param._onScroll && param._onScroll();

			me.scrollLeft(scroll);

		},

		// 更新纵向滚动条样式

		_updateStyleY: function(){

			var me = this.$ele,

			status = this.status,

			param = this.param,

			containerY = this.containerY,

			boxH = status.boxH,

			contentH = status.contentH,

			space = status.space,

			controlH = contentH<=boxH?0:boxH/contentH*(boxH-space)>6?~~(boxH/contentH*(boxH-space)+0.5):6;

			param.barChange===true?(status.controlH = controlH):(status.controlH = this.barY.height());

			containerY.css('height',boxH-space);

			if(!controlH){

				containerY.css('display','none');

			}else{

				(param.mode=='always' || (param.mode=='hover' && status.mouseH)) && containerY.css('display','block');

				param.barChange && this.barY.css('height',controlH);

			}

		},

		// 更新横向滚动条样式

		_updateStyleX:function(){

			var me = this.$ele,

			status = this.status,

			param = this.param,

			containerX = this.containerX,

			boxW = status.boxW,

			contentW = status.contentW,

			space = status.space,

			controlW = contentW<=boxW?0:boxW/contentW*(boxW-space)>6?~~(boxW/contentW*(boxW-space)+0.5):6;

			param.barChange===true?(status.controlW = controlW):(status.controlW = this.barX.width());

			containerX.css('width',boxW-space);

			if(!controlW){

				containerX.css('display','none');

			}else{

				(param.mode=='always' || (param.mode=='hover' && status.mouseH)) && containerX.css('display','block');

				param.barChange && this.barX.css('width',controlW);

			}

		},

		// 刷新滚动条

		_refresh:function(){

			var me = this.$ele,

			change = this._updateBox();

			(!!this.containerX && change) && (this._updateStyleX(),this._doScrollX(me.scrollLeft()));

			(!!this.containerY && change) && (this._updateStyleY(),this._doScrollY(me.scrollTop()));

		}

	}

	// 初始化

	var scrollInit = function(val,a,b,c){

		this.$ele = $(val);

		this.$ele.data('lzscroll-param',this._initParam(a,b,c));

		this.$ele.data('lzscroll-stamp',1);

		this.$ele.data('lzscroll-status',{
			canWheel:true,
			axis:[],
			dir:'y',
			mouseX:false,
			mouseY:false,
			mouseH:false,
			contentH:0,
			contentW:0,
			boxH:0,
			boxW:0,
			controlH:0,
			controlW:0,
			moveH:0,
			moveW:0,
			scrollH:0,
			scrollW:0,
			space:0,
			timer:null,
			times:0,
			dis:0,
			lastdis:0,
			requestid:0,
			firefoxwheel:0
		});

	}

	scrollInit.prototype = {

		constructor:scrollInit,

		defaults:{

			axis:'y', // (显示滚动的方向，y为纵向，x为横向，xy,yx为双向)

			theme:'default',  // (自定义类名, 最终显示形式为 lzscroll-theme-(barX,barY,containerX,containerY))

			distance:120,    // (滚动一次的长度: px)

			speed:200,       // (滚动一次需要的时间：ms)

			animation:true,  // (是否开启滚动动画)

			barChange:true,  // (滚动条长度是固定不动)

			mode:'always', // (显示模式：always(总是显示) hover(悬停显示) active(滚动显示))

			containerWidth:8, // (滚动条盒子的宽度)

			barWidth:6,   // (滚动条的宽度)
 
 			listenChange:false, // (是否开启实时监听滚动内容滚动变化)

			stopBubble:false,  // (是否阻止冒泡)

			_onScroll:null,  // (滚动时触发的函数)

			event:['wheel','drag']

		},

		// 初始化参数

		_initParam:function(a,b,c){

			var param = this.defaults,

			temp = null;

			if($.isObject(a)){

				param = $.extend(true,{},param,a);

			}else{

				param.axis = a;

				param.distance = b;

				param.mode = c;

			}

			!isNaN(a) && (param.speed = a);

			if((temp = this.$ele.data('lzscroll-param'))) param = $.extend(true,{},param,temp);

			param.axis = (param.axis=='x' || param.axis == 'y' || param.axis=='xy' || param.axis=='yx')?param.axis:'y';

			param.mode = (param.mode=='active' || param.mode=='hover' || param.mode=='always')?param.mode:'always';

			isNaN(param.distance-0) && (param.distance=120);

			isNaN(param.speed-0) && (param.speed = 200);

			isNaN(param.containerWidth-0) && (param.containerWidth = 8);

			isNaN(param.BarWidth-0) && (param.BarWidth =6);

			param.listenChange = param.listenChange===true?true:false;

			param.animation = param.animation===false?false:true;

			param.barChange = param.barChange===false?false:true;

			!param.theme && (param.theme = 'default');

			$.isFunction(param._onScroll)?(param._onScroll = $.proxy(param._onScroll, new tool(this.$ele))):(param._onScroll=null);

			return param;

		},

		// 初始化版式

		_layout:function(){

			var me = this.$ele,

			param = me.data('lzscroll-param'),

			status = me.data('lzscroll-status');

			me.css('position')==='static' && me.css('position','relative');

			me.css('overflow')!=='hidden' && me.css('overflow','hidden');

			status.axis = param.axis.split('');

			(status.axis.length===2) && (status.space = param.containerWidth);

			var scrollCls = 'lzscroll-'+param.theme,

			containerY = $("<div class='"+scrollCls+"-containerY'></div>").css({
				width:param.containerWidth,
				top:0,
				right:0,
				position:'absolute'
			}),

			containerX = $("<div class='"+scrollCls+"-containerX'></div>").css({
				height:param.containerWidth,
				left:0,
				bottom:0,
				position:'absolute'
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

			if($.inArray('x',status.axis)>=0){

				containerX.append(barX).appendTo(me);

				me.data('lzscroll-containerX',containerX);

				me.data('lzscroll-barX',barX);

			}

			if($.inArray('y',status.axis)>=0){

				containerY.append(barY).appendTo(me);

				me.data('lzscroll-containerY',containerY);

				me.data('lzscroll-barY',barY);

			}

		},

		// 初始化事件

		_initEvent:function(){

			var me = this.$ele,

			self = me.get(0).scrollMethods,

			param = me.data('lzscroll-param'),

			status = me.data('lzscroll-status'),

			containerY = me.data('lzscroll-containerY'),

			containerX = me.data('lzscroll-containerX'),

			event = new scrollEvent(me);

			if(param.mode!=='always'){

				param.event.push('display');

				!!containerY && containerY.css('display','none');

				!!containerX && containerX.css('display','none');

			}

			$(window).resize(function(){

				if(!!me.data('lzscroll-stamp')){
					
						self._refresh();

				}

			});

			me.off('lzscroll').on('mouseenter.lzscroll',function(){

				status.mouseH = true;

			}).on('mouseleave.lzscroll', function() {
				
				status.mouseH = false;
				
			});

			param.listenChange && (param.event.push('listenChange'));

			event.setEvent();

			self._refresh();

		},

		_init:function(){

			var self = this.$ele.get(0);

			this._layout();

			self.scrollMethods = new scrollMethods(self);

			this._initEvent();

		}

	}

	var tool = function(val){

		this.$ele = $(val);

	}

	tool.prototype = {

		constructor: tool,

		// 摧毁插件

		destroy:function(){

			$.each(this.$ele,function(index,val){

				var self = $(val);

				self.scrollTop(0);

				self.scrollLeft(0);

				var containerX = self.data('lzscroll-containerX'),

				containerY = self.data('lzscroll-containerY'),

				status = self.data('lzscroll-status');

				status.timer && clearInterval(status.timer);

				!!containerX && containerX.remove();

				!!containerY && containerY.remove();

				self.off('.lzscroll').off('.scrolldisplay');

				self.removeData('lzscroll-param').removeData('lzscroll-status').removeData('lzscroll-stamp');

				val.scrollMethods = null;

			});

			return false;

		},

		// 重新调用插件

		init:function(a,b,c){

			this.destroy();

			this.$ele.lzscroll(a,b,c);
		},

		// 刷新滚动条

		refresh:function(){

			$.each(this.$ele,function(index,val){

				val.scrollMethods._refresh();

			})

			return this;

		},

		// 获取当前滚动已滚动的长度，或者设置滚到固定位置，可以设置滚动速度以及执行完后的回调

		scrollLeft:function(num,speed,fn){

			var me = this.$ele,

			self = me.get(0).scrollMethods,

			status = me.eq(0).data('lzscroll-status'),

			param = me.eq(0).data('lzscroll-param');

			$.isFunction(speed) && (fn = speed);

			$.isFunction(fn) && (status.callback = $.proxy(fn,this));

			isNaN(speed)?(speed=param.speed):(speed = speed);

			if(isNaN(num)){

				return status.scrollW;

			}
			else{

				num = self._fixScrollVal(num,'x');

				self._setAnimateParam(param.animation?~~(speed/100*6):1,num-status.scrollW,'x');	

				self._animateScroll(fn);

			}
				
			return this;

		},

		// 获取当前滚动已滚动的高度，或者设置滚到固定位置，可以设置滚动速度以及执行完后的回调

		scrollTop:function(num,speed,fn){

			var me = this.$ele,

			self = me.get(0).scrollMethods,

			status = me.eq(0).data('lzscroll-status'),

			param = me.eq(0).data('lzscroll-param');

			$.isFunction(speed) && (fn = speed);

			$.isFunction(fn) && (status.callback = $.proxy(fn,this));

			isNaN(speed)?(speed=param.speed):(speed = speed);

			if(isNaN(num)){

				return status.scrollH;

			}else{

				num = self._fixScrollVal(num,'y');

				self._setAnimateParam(param.animation?~~(speed/100*6):1,num-status.scrollH,'y');

				self._animateScroll();

			}

			return this;

		},

		// 添加或改变滚动时调用的函数

		scroll:function(fn){

			var me = this.$ele;

			if($.isFunction(fn)){

				fn = $.proxy(fn,this);

				$.each(me,function(index,val){

					$(val).data('lzscroll-param')._onScroll = fn;

				});

			}	
			
			return this;
		}

	}	

	// 插件工具方法集调用入口

	$.fn.scrollTool = function(){

		return new tool(this);

	}

	// 插件入口

	$.fn.lzscroll = function(a,b,c){

		$.each(this,function(index,val){

			if(!$(val).data('lzscroll-stamp')){

				new scrollInit(val,a,b,c)._init();

			}

		});

		return this.scrollTool();

	}

	return lzscroll;

})