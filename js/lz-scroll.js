/*!
 * lz-scroll v1.0.0
 * Copyright © lzmoop ( 磨盘兄弟 )
 * Author: Jack Zhang
 * Date: 2017
*/
;(function($){

	$.extend({

		// 判断参数是否为object对象，是返回true，否则返回false

		isObject: function(v) {

			return Object.prototype.toString.call(v) === '[object Object]';

		}

	});

	var scrollEvent = function(val){

		this.$ele = $(val);

		this.param = this.$ele.data('lzscroll-param');

		this.status = this.$ele.data('lzscroll-status');

		this.containerX = this.$ele.data("lzscroll-containerX");

		this.containerY = this.$ele.data("lzscroll-containerY");

		this.barX = this.$ele.data("lzscroll-barX");

		this.barY = this.$ele.data("lzscroll-barY");
	}

	scrollEvent.prototype = {

		setEvent:function(){

			var event = this;

			$.each(this.param.event,function(index,val){

				event[val] && event[val]();

			})

		},

		wheel:function(){

			var me = this.$ele,

			self = me.get(0).scrollMethods,

			param = this.param,

			status = this.status,

			requestAnimationFrame =window.requestAnimationFrame ||window.webkitRequestAnimationFrame ||window.mozRequestAnimationFrame || function( callback ){

				window.setTimeout(callback, 1000 / 60);

			}

			me.on('mousewheel.lzscroll DOMMouseScroll.lzscroll', function(e) {

				self._refresh();

				var control = param.axis ==='x'?status.controlW:status.controlH,

				scroll = param.axis ==='x'?me.scrollLeft():me.scrollTop(),

				content = param.axis ==='x'?status.contentW:status.contentH,

				box = param.axis ==='x'?status.boxW:status.boxH,

				temp = scroll;

				if(status.canWheel && control){

					var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || // chrome & ie 判断滚轮方向
	            		(e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));// firefox  判断滚轮方向

	            		var times = param.animation?~~(param.speed/100*6):1,

	            		dis = ~~(param.distance/times),

	            		step = function(){

	            			times--;

	            			if(delta>0)

	            				scroll -=dis;

	            			else if(delta<0) 

	            				scroll +=dis;

	            			scroll = param.axis==='x'?self._doScrollX(scroll):self._doScrollY(scroll);

	            			if(times>0){

	            				requestAnimationFrame(step)

	            			}
	            		}

	            		step();

	            		if((temp!==0 || scroll!==0) && (temp!==content-box || scroll!==content-box)) return false;

	            	}

	            });

		},

		display: function(){

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

		drag : function(){

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

					self._doScrollY(bDis);

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

					self._doScrollX(bDis);

				}

			});

		},

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

	var scrollMethods = function(val){

		this.$ele = $(val);

		this.param = this.$ele.data("lzscroll-param");

		this.status = this.$ele.data("lzscroll-status");

		this.containerX = this.$ele.data("lzscroll-containerX");

		this.containerY = this.$ele.data("lzscroll-containerY");

		this.barX = this.$ele.data("lzscroll-barX");

		this.barY = this.$ele.data("lzscroll-barY");

	}

	scrollMethods.prototype = {

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

		_doScrollY:function(scroll){

			var me = this.$ele,

			param = this.param,

			status = this.status;

			scroll = (scroll<0)?0:scroll;

	        scroll = (scroll>(status.contentH-status.boxH))?status.contentH-status.boxH:scroll;			

			var moveH = ~~(scroll*(status.boxH-status.space-status.controlH)/(status.contentH-status.boxH)+0.5);

			status.moveH = moveH;

			if(this.containerY){

				this.containerY.css('top',scroll);

				this.barY.css('top',moveH);

			}

			if(this.containerX) this.containerX.css('bottom',-scroll);

			status.scrollH = scroll;

			param._onUpdate && param._onUpdate();

			me.scrollTop(scroll);

			return scroll;

		},

		_doScrollX : function(scroll){

			var me = this.$ele,

			param = this.param,

			status = this.status;

			scroll = (scroll<0)?0:scroll;

	        scroll = (scroll>(status.contentW-status.boxW))?status.contentW-status.boxW:scroll;

			var moveW = ~~(scroll*(status.boxW-status.space-status.controlW)/(status.contentW-status.boxW)+0.5);

			status.moveW = moveW;

			if(this.containerX){

				this.containerX.css('left',scroll);

				this.barX.css('left',moveW);

			}

			if(this.containerY) this.containerY.css('right',-scroll);

			status.scrollW = scroll;

			param._onUpdate && param._onUpdate();

			me.scrollLeft(scroll);

			return scroll;

		},

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

		_refresh:function(){

			var me = this.$ele,

			change = this._updateBox();

			(!!this.containerX && change) && (this._doScrollX(me.scrollLeft()),this._updateStyleX());

			(!!this.containerY && change) && (this._doScrollY(me.scrollTop()),this._updateStyleY());

		}
	}	


	var scrollInit = function(val,a,b,c){

		this.$ele = $(val);

		this.$ele.data('lzscroll-param',this._initParam(a,b,c));

		this.$ele.data('lzscroll-stamp',1);

		this.$ele.data('lzscroll-status',{
			canWheel:true,
			axis:[],
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
			timer:null
		})
	}

	scrollInit.prototype = {

		defaults:{

			axis:'y',

			theme:'default',

			distance:120,

			speed:200,

			animation:true,

			barChange:true,

			mode:'always',

			containerWidth:8,

			barWidth:6,

			listenChange:true,

			stopBubble:false,

			_onScroll:null,

			_onUpdate:null,

			event:['wheel','drag']

		},

		_initParam:function(a,b,c){

			var param = this.defaults,

			temp = null;

			if($.isObject(a)){

				param = $.extend({},param,a);

			}else{

				param.axis = a;

				param.distance = b;

				param.mode = c;

			}

			!isNaN(a) && (param.speed = a);

			if((temp = this.$ele.data('lzscroll-param'))) param = $.extend({},param,temp);

			param.axis = (param.axis =='x' || param.axis =='y' || param.axis == 'xy' || param.axis =='yx')?param.axis:'y';

			param.mode = (param.mode=='active' || param.mode =='hover' || param.mode=='always')?param.mode:'always';

			isNaN(param.distance) && (param.distance = 120);

			isNaN(param.speed) && (param.speed = 200);

			isNaN(param.containerWidth) && (param.containerWidth = 8);

			isNaN(param.BarWidth) && (param.BarWidth =6);

			param.listenChange = param.listenChange===false?false:true;

			param.animation = param.animation===false?false:true;

			param.barChange = param.barChange===false?false:true;

			!param.theme && (param.theme = 'default');

			return param;
		},

		_layout:function(){

			var me = this.$ele,

			param = me.data('lzscroll-param'),

			status = me.data('lzscroll-status');

			me.css('position')==='static' && me.css('position','relative');

			me.css('overflow')!=='hidden' && me.css('overflow','hidden');

			status.axis = param.axis.split('');

			(status.axis.length ===2) && (status.space = param.containerWidth);

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

			})

			me.off('.lzscroll').on('mouseenter.lzscroll',function(){

				status.mouseH = true;

			}).on('mouseleave.lzscroll', function() {
				
				status.mouseH = false;

			}).on('scroll.lzscroll', function() {
				
				param._onScroll && param._onScroll();

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

		destory:function(){

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

			})

			return false;

		},

		init:function(a,b,c){

			this.destroy();

			this.$ele.lzscroll(a,b,c);

		},

		refresh:function(){

			$.each(this.$ele,function(index,val){

				val.scrollMethods._refresh();

			})

			return this;
		},

		scrollLeft:function(num){

			var me = this.$ele;

			if(num === undefined)
				return me.eq(0).data('lzscroll-status').scrollW;
			else
				me.get(0).scrollMethods._doScrollX(num);

			return this;

		},

		scrollTop:function(num){

			var me = this.$ele;

			if(num ===undefined)
				return me.eq(0).data('lzscroll-status').scrollH;
			else
				me.get(0).scrollMethods._doScrollY(num);

			return this;

		},

		on:function(str,fn){

			var me = this.$ele;

			fn = $.proxy(fn,this);

			if(str==='scroll'){

				$.each(me,function(index,val){

					if(typeof fn ==='function') $(val).data('lzscroll-param')._onScroll = fn;

				})

			}else if(str==='update'){

				$.each(me,function(index,val){

					if(typeof fn ==='function') $(val).data('lzscroll-param')._onUpdate = fn;

				})

			}

		}

	}

	$.fn.scrollTool = function(){

		return new tool(this);

	}

	$.fn.lzscroll = function(a,b,c){

		$.each(this,function(index,val){

			if(!$(val).data('lzscroll-stamp')){

				new scrollInit(val,a,b,c)._init();

			}

		})

		return this.scrollTool();
	}

})(jQuery)