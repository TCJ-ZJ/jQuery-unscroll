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

	var scrollEvent = function(val){

		this.$ele = $(val);

		this.param = this.$ele.data("scroll-param");

		this.status = this.$ele.data("scroll-status");

		this.controlY = this.$ele.data("scroll-controlY");

		this.controlX = this.$ele.data("scroll-controlX");

	}

	scrollEvent.prototype.setEvent = function(){

		var event = this,

		param = this.param;

		if($.isArray(param.event)){

			$.each(param.event, function(index, val) {
				
				event[val]  && event[val]();

			});

		}else{

			event[param.event] && event[param.event]();

		}

	}

	scrollEvent.prototype.wheel = function(){

		var me = this.$ele,

		status = this.status,

		param = this.param,

		speed = param.speed;

		me.on('mousewheel DOMMouseScroll', function(e) {

			var control = param.axis==='x'?status.controlW:status.controlH,

			move = param.axis==='x'?status.moveW:status.moveH,

			box = param.axis==='x'?status.boxW: status.boxH-status.space;
			
			e.preventDefault();
			
			if(status.wheelflag && control){

				var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || // chrome & ie 判断滚轮方向
	            		(e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));// firefox  判断滚轮方向 

	            if(delta>0){

	            	if(move>speed){

	            		move -= speed;

	            	}else{

	            		move = 0;
	            	}

	            }else if(delta<0){

	            	if(move+control+speed<box){

	            		move+=speed;

	            	}else{

	            		move = ~~(box-control);

	            	}

	            }

	            if(param.axis ==='x'){

	            	status.moveW = move;

	            	me.scrollExcute('x');

	            }else{

	            	status.moveH = move;

	            	me.scrollExcute('y');

	            }

			}

		});

	}

	scrollEvent.prototype.drag = function(){

		var me = this.$ele,

		status = this.status,

		controlX = this.controlX,

		controlY = this.controlY,

		doc = $(document);

		var objToTop = me.offset().top,

		objToLeft = me.offset().left,

		interY = 0,

		outerY = 0,

		interX = 0,

		outerX = 0;

		if(controlX){

			controlX.on('mousedown', function(e) {
				
				e = e || window.event;

				e.preventDefault();

				interX = e.offsetX;

				status.wheelflag = false;

				status.mouseX = true;

			});

		}

		if(controlY){

			controlY.on('mousedown', function(e) {
				
				e = e || window.event;

				e.preventDefault();

				interY = e.offsetY;

				status.wheelflag = false;

				status.mouseY = true;

			});

		}

		doc.on('mouseup', function(e) {
			
			status.mouseY = false;

			status.mouseX = false;

			status.wheelflag = true;

		});

		doc.on('mousemove', function(e) {
			
			if(status.mouseY){

				outerY = e.clientY;

				status.moveH = outerY-interY-objToTop;

				if(status.moveH<0){

					status.moveH = 0;

				}else if(status.moveH + status.controlH>status.boxH-status.space){

					status.moveH = status.boxH-status.controlH-status.space;

				}

				me.scrollExcute('y');

			}

			if(status.mouseX){

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

	scrollEvent.prototype.display = function(){

		var me = this.$ele,

		status = this.status,

		controlX = this.controlX,

		controlY = this.controlY;

		me.on('mouseover', function(e) {
			
			!!controlX && controlX.show();

			!!controlY && controlY.show();

		}).on('mouseout', function(e) {
			
			(!!controlY && !status.mouseY) && controlY.hide();

			(!!controlX && !status.mouseX) &&  controlX.hide();

		});

	}

	scrollEvent.prototype.change = function(){

		var me = this.$ele,

		status = this.status,

		controlX = this.controlX,

		controlY = this.controlY,

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

	var scrollMethods = function(val){

		this.$ele = $(val);

		this.param = this.$ele.data('scroll-param');

		this.status = this.$ele.data('scroll-status');

	}

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

	scrollMethods.prototype.doScroll = function(axis){

		this["calculate"+axis.toUpperCase()]();

	}

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


	var scrollInit = function(val,a,b,c,d,e){

		this.$ele = $(val);

		this.$ele.data('scroll-param',this.initParam(a,b,c,d,e));

		this.$ele.data('scroll-status',{
			wheelflag:true,
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
			space:0
		})

		this.arr = this.$ele.data('scroll-param').axis.split('');

	}

	scrollInit.prototype.initEvent = function(){

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

		$(window).resize(function(e) {
			
			me.scrollUpdate(arr);

			!!controlY && controlY.css('height',status.controlH);

			!!controlX && controlX.css('width',status.controlW);

		});

		me.on('mouseover', function(e) {
			
			status.mouseH = true;
			
		}).on('mouseout', function(e) {
			
			status.mouseH = false;
			
		});

		event.setEvent();

	}

	scrollInit.prototype.layout = function(){

		var me = this.$ele,

		param = me.data('scroll-param'),

		status = me.data('scroll-status');

		if(me.css('position')==='static'){

			me.css('position','relative');

		}

		if(param.axis ==='yx' ||param.axis==='xy'){

			status.space = param.width;

		}

		var unscrollClass = 'unscroll-'+param.theme;

		var controlY = $("<div class='"+unscrollClass+"-Y'></div>").addClass('scroll-controlY');

		var controlX = $("<div class='"+unscrollClass+"-X'></div>").addClass('scroll-controlX');

		if(param.axis === 'x'){

			controlX.appendTo(me)

			me.data('scroll-controlX',me.find('.scroll-controlX'));

		}else if(param.axis === 'y'){

			controlY.appendTo(me)

			me.data('scroll-controlY',me.find('.scroll-controlY'));

		}else{

			controlY.appendTo(me);

			controlX.appendTo(me);

			me.data('scroll-controlX',me.find('.scroll-controlX'));

			me.data('scroll-controlY',me.find('.scroll-controlY'));

		}

		me.scrollUpdate(this.arr);

		if(me.data('scroll-controlY')){

			me.data('scroll-controlY').css('height',status.controlH);

		}

		if(me.data('scroll-controlX')){

			me.data('scroll-controlX').css('width',status.controlW);

		}
		
	}	

	scrollInit.prototype.initParam = function(a,b,c,d,e){

		var param = {

			axis : 'y',

			theme : 'default',

			speed : 20,

			display : true,

			width : 8,

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

	$.fn.scrollUpdate = function(arr){

		var me = $(this).get(0);

		$.each(arr, function(index, val) {
			
			me.scrollexcute["update"+val.toUpperCase()]();

		});

	}

	$.fn.scrollExcute =function(axis){

		var me = $(this).get(0);

		me.scrollexcute.doScroll(axis);

	}


	$.fn.unscroll = function(a,b,c,d,e){

		var me = $(this);

		$.each(me, function(index, val) {
			
			var newScrollBar = new scrollInit(val,a,b,c,d,e);

			val.scrollexcute = new scrollMethods(val);

			newScrollBar.layout();

			newScrollBar.initEvent();

		});

	}

})(jQuery)