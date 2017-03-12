define([
	'player',
	'vue',
	'Rx',
	'mustache',
	'utils',
    'jquery',
    'jquery.vimeo',
    './video-player'
], function (Player, Vue, Rx, M, _, $) {
	var resize = Rx.Observable.fromEvent(window, 'resize').map(function(x){
		return [x];
	}).subscribe((x)=>console.log(['Resize event!', x]));

	// var player;
	// $(document).on('youtubeAPI.loaded', function(){
	// 	player = window.YT.API;
	// });


	// function getSize(domObject){
	// 	var $o = $(domObject);
	// 	return $o.width() / $o.height();
	// }

	// function swapVideoSize(video){
	// 	var videoRatio = getSize(video),
	// 		$video = $(video);
	// 	return function(){
	// 		var ratio = getSize(window) / videoRatio;
	// 		if ( ratio > 1 ){
	// 			$video.attr('scale', 'width');
	// 		} else if( ratio < 1 ){
	// 			$video.attr('scale', 'height');
	// 		}
 // 		};
	// }
	// $(window).on('resize.ratio', ratio).trigger('resize.ratio');

	// create a root instance

	new Vue({
	  	el: '#app',
	  	data : {
			playlistActive : false	  	
	  	},
	  	methods : {
			togglePlaylist : function(){
				this.playlistActive = !this.playlistActive;
			}	  		
	  	}
	});	


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
			},
			onPlaybackQualityChange: function(){
				Player.trigger('qualitychange');
			}
		});
		Player.inject(YT, 'youtube');		
	});
	
	function YTV(id, title){
		return {
			videoId: id,
			iframeId: 'YT'+id,
			vendor: 'youtube',
			title: title,
			category : 'Music'
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
	// use player.getAvailableQualityLevels()
	var quality = {
		levels: [
			{name:'tiny', label:'144p'},
			{name:'small', label:'240p'},
			{name:'medium', label:'360p'},
			{name:'large', label:'480p'},
			{name:'hd720', label:'720p'},
			{name:'hd1080', label:'1080p'},
			// {name:'highres', label:'HD+'},
			{name:'default', label:'auto'}
		]
	};

	var addToPlaylist = Array.prototype.push.bind(playlist.videos);
	
	addToPlaylist(YTV('4AMV6SLT9KI'));
	addToPlaylist(YTV('0KSOMA3QBU0', 'Katy Perry - Dark Horse (Official) ft. Juicy J'));
	addToPlaylist(YTV('IVZHNPyMhMo', 'HAKEN - The Endless Knot (Lyric Video)'));
	addToPlaylist(YTV('0_e4YX73Ww4', 'HAKEN - The Cockroach King Official Video'));
	addToPlaylist(YTV('LhP_PKpSONQ', 'Andy Emler / Claude Tchamitchian / Eric Echampard / Marc Ducret - Running Backwards'));
	addToPlaylist(YTV('ia9PLzX1RUM', 'Bill Lawrence - Ready Wednesday (Flint)'));
	// addToPlaylist(YTV('ZrU_tt4R3xY', 'South Park - Stick Of Truth (Full Movie)'));

	require(['stache!../../templates/video'], function(template){
		var html = template({videos:[playlist.videos[0]]});
		$("#video-overlay > .video-wrapper").html(html);
		// var $videos = $('.video-wrapper');
		// $videos.each(function(){
		// 	$(window).on('resize.videos', swapVideoSize(this)).trigger('resize.videos');
		// });

		Player.load(playlist.videos[0]);
	
	});

	require(['stache!../../templates/sidebar-articles'], function(template){
		var html = template(playlist);
		$("#sidebar").html(html);
		Player.load(playlist.videos[0]);
	});

	require(['stache!../../templates/quality-control'], function(template){
		var html = template(quality);
		$control = $(".control-quality");
		$control.html(html);
		$levels = $control.find('.level');		
		$levels.on('click', function(){
			var $level = $(this),
				level = $level.attr('name');
				
			if(window.YT.API.getPlaybackQuality() !== level){
				setQuality(window.YT.API, level);
			}
		});
		$control.on('click', function(){
			$(this).toggleClass('active');
		});

	});

});

function setQuality(player, q){
    var currentTime = player.getCurrentTime(); // current video time
    var status = player.getPlayerState(); // video status
    if(status!=-1 && status!=5){ // if not started, does not to be stoped
        player.stopVideo();
    }
    player.setPlaybackQuality(q);
    player.seekTo(currentTime);
    if(status!=1){
        player.pauseVideo(); // if was paused   
    }else{
        player.playVideo(); // if was playing
    }
}