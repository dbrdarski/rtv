define([
	'player',
	'mustache',
	'utils',
    'jquery',
    'jquery.vimeo'
], function (Player, M, _, $) {
	function getSize(domObject){
		var $o = $(domObject);
		return $o.width() / $o.height();
	}
	function range(x, min, max){
		return Math.max(min, Math.min(x, max));
	}
	function swapVideoSize(video){
		var videoRatio = getSize(video),
			$video = $(video);
		return function(){
			var ratio = getSize(window) / videoRatio;
			if ( ratio > 1 ){
				$video.attr('scale', 'width');
			} else if( ratio < 1 ){
				$video.attr('scale', 'height');
			}
 		};
	}
	// var player;
	// $(document).on('youtubeAPI.loaded', function(){
	// 	player = window.YT.API;
	// });

	// $(window).on('resize.ratio', ratio).trigger('resize.ratio');

	var hideControls = function function_name($controls) {
		return function(){
			$controls.removeClass('active');
		};
	};

	var showControls = function function_name($controls, $timeout) {
		var timer;
		return function(){
			clearTimeout(timer);
			$controls.addClass('active');
			timer = setTimeout(hideControls($controls), $timeout);
		};
	};

	$('#video-overlay').on('mousemove', showControls($('.controls'), 1000));

	var $progress = $('.controls .progress-slider');
	$progress.on('mousedown mousemove mouseup', (function(state){ 
		return function(e){
			e.preventDefault();
			var player = window.YT.API,
				control = $(this),
				width = e.pageX - control.position().left,
				percentage = range((width - 5) / (control.width() - 7), 0, 1)
			;
			if(e.type !=="mousemove" || state === "active"){
				updateProgressBar(control)(percentage);
				player.seekTo(player.getDuration() * percentage);
			}
			if(e.type === "mousedown"){
				state = "active";
				player.pauseVideo();
			}else if(e.type === "mouseup"){
				player.playVideo();
				state = "inactive";
			}
		};
	})()
	);
	
	function pad(size){
		return function(num){
	    	var s = num+"";
	    	while (s.length < size) s = "0" + s;
	    	return s;
		};
	}
	function roundTime(t){
		return Math.floor(t);
	}
	function parseTime(t){
		var s = t%60;
		var m = Math.floor(t/60)%60;
		var h = Math.floor(m/60);
		var time = [];
		h > 1 && time.push(h);
		time.push(m,s);
		return time.map(pad(2)).join(":");
	}
	// var hi = memo(fn, 0, 0);
	// var fn = function(x,y){
	// 	return x === y ? true : false;
	// }

	var updateTime = _.memo(function(x, y){
		x !== y && $(".control-panel .time").html(parseTime(y));
	}, null, 0);
	
	var updateDuration = function(duration){
		$(".control-panel .duration").html(parseTime(roundTime(duration)));
	}

	var updateProgressBar = function(control){
		var player = window.YT.API;
		return function(percentage){
			control.find(".progress").css({"width": percentage*100+'%'});
			control.find(".slider-handle").css({"left": percentage * (control.width() - 20)});
			updateTime = updateTime(roundTime(player.getCurrentTime()));
		}
	};
	
	
	function bindProgressBar(player){
		updateDuration(player.getDuration());
		return function(){
			var percentage = player.getCurrentTime() / player.getDuration();
			updateProgressBar($progress)(percentage);
		};
	}	

	var $play = $('.control-play');
	$play.on('click', function(){		
		var player = window.YT.API;
		$play.attr('state') === 'paused' ? player.playVideo() : player.pauseVideo();
	})
	
	require(["youtube"], function(YT){
		YT.events({
			onStateChange:  function(event){
				var time = YT.API.getCurrentTime(),
					duration = YT.API.getDuration()
				;
				Player.trigger('statechange');
				switch(event.data){
					case -1:
				    	// unstarted?
				    	console.log('unstarted');
				    	break;
					case 0:
						Player.trigger('end');
			    		break;
					case 1:
						Player.trigger('play');
			    		break;
					case 2:
			    		if(time !== duration){
							Player.trigger('pause');
			    		}
			    		break;
					case 3:
						Player.trigger('buffer');
			    		break;
				}
			}
		});
		Player.inject(YT, 'youtube');		
	});
	function YTV(id){
		return {
			videoId: id,
			iframeId: 'YT'+id,
			vendor: 'youtube'
		}
	}
	var playlist = {
		'videos':[
		// {
			// videoId: '0_e4YX73Ww4',
			// iframeId: 'YT'+'0_e4YX73Ww4',
			// vendor: 'youtube'
		// }
		]
	};

	var a = Array.prototype.push.bind(playlist.videos);	
	a(YTV('ia9PLzX1RUM'));
	// a(YTV('LhP_PKpSONQ'));
	// a(YTV('IVZHNPyMhMo'));
	// a(YTV('0_e4YX73Ww4'));
	// a(YTV('4AMV6SLT9KI'));

	require(['stache!../../templates/video'], function(template){
		var html = template(playlist);
		$("#video-overlay").html(html);
		var $videos = $('.video-wrapper');
		$videos.each(function(){
			$(window).on('resize.videos', swapVideoSize(this)).trigger('resize.videos');
		});

		Player.load(playlist.videos[0]);

	});

	var interval;
	Player.on('play', function(){
		interval = setInterval(bindProgressBar(YT.API), 200);
		$play.attr('state', 'playing');
		$('#video-overlay').css({'filter':'none'});
		$(YT.API.getIframe()).parent().addClass('playing');		
	}).on('pause', function(){
		$play.attr('state', 'paused');
		$('#video-overlay').css({'filter':'grayscale() contrast(1.1) brightness(.65)'});
	}).on('end', function(){	
		$(YT.API.getIframe()).parent().removeClass('playing');
	}).on('statechange', function(){	
		clearInterval(interval);
	})
});