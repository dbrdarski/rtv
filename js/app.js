define([
	'player',
	'mustache',
	// 'util',
    'jquery',
    'jquery.vimeo'
], function (Player, M, $) {
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
	var $progress = $('.controls .progress-slider');
	$progress.on('mousedown mouseup', function(e){
		var player = window.YT.API,
			control = $(this),
			width = e.pageX - control.position().left,
			percentage = range((width - 5) / (control.width() - 7), 0, 1)
		;
		updateProgressBar(control)(percentage);
		player.seekTo(player.getDuration() * percentage);
	});
	
	function pad(size){
		return function(num){
	    	var s = num+"";
	    	while (s.length < size) s = "0" + s;
	    	return s;
		};
	}

	function parseTime(t){
		var s = Math.floor(t)%60;
		var m = Math.floor(t/60)%60;
		var h = Math.floor(m/60);
		var time = [];
		h > 1 && time.push(h);
		time.push(m,s);		
		return time.map(pad(2)).join(":");
		
	}
	var updateProgressBar = function(control){
		var player = window.YT.API;
		return function(percentage){
			control.find(".progress").css({"width": percentage*100+'%'});
			control.find(".slider-handle").css({"left": percentage * (control.width() - 20)});
			$(".control-panel .time").html(parseTime(player.getCurrentTime()));
		}
	};
	
	
	function bindProgressBar(player){
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