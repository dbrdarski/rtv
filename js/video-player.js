define(['vue','Rx', 'text!../../templates/video-player.html', 'utils', 'jquery'], function(Vue, Rx, template, _, $){
	// register

	
	function swapVideoSize(el){
		var videoRatio = el.offsetWidth / el.offsetHeight;
			
		return function(){
			var ratio = window.innerWidth / window.offsetHeight / videoRatio;
			if ( ratio > 1 ){
				video.setAttribute('scale', 'width');
			} else if( ratio < 1 ){
				$video.setAttribute('scale', 'height');
			}
 		};
	}

	function pad(size){
		return function(num){
	    	var s = num+"";
	    	while (s.length < size) s = "0" + s;
	    	return s;
		};
	}

	function range(x, min, max){
		return Math.max(min, Math.min(x, max));
	}

	function roundTime(t){
		return typeof t === 'number' ? Math.floor(t) : false;
	}

	var resizeVideo = function(el){
		return function(){
			var ratio = (window.innerWidth/window.innerHeight) / (el.offsetWidth/el.offsetHeight);
			if ( ratio > 1 ){
				el.setAttribute('scale', 'width');
			} else if( ratio < 1 ){
				el.setAttribute('scale', 'height');
			}
		};
	};

	function parseTime(t){
		var s = t%60;
		var m = Math.floor(t/60)%60;
		var h = Math.floor(m/60);
		var time = [];
		h > 1 && time.push(h);
		time.push(m,s);
		return time.map(pad(2)).join(":");
	}

	var time = _.compose(parseTime, roundTime);
	
	resizeEvent = Rx.Observable.fromEvent(window, 'resize');

	var interval;

	Vue.component('video-player', {
		template: template,
		data : function(){
			return {
				controls : {
					el : null,
					timeout : null,
					active : true
				},
				play : {
					el : ''					
				},
				volume : {
					el : '',
					state : ''
				},
				progress : {
					el : '',
					state : '',
					originalState : ''
				},
				overlay : null,
				video: {
					el : null,
					duration : 0,
					time : 0,
					percentage : 0
				},
				state : 'stopped'
			}
		},
		computed : {
			duration: function(){
				return time(this.video.duration);
			},
			time: function(){
				return parseTime(this.video.time);
			},
			controlsState : function(){
				return this.controls.active ? 'active' : '';
			},
			percentage : function(){
				return { "width": this.video.percentage * 100+'%' };
			},
			sliderHandle : function(){
				return {"left": this.video.percentage * (this.progress.el.offsetWidth - 20) + "px"}
			},
			filtersForPause : function(){
				var asd = this.state === 'paused' ? {'filter':'grayscale() contrast(1.1) brightness(.65)'} : {'filter':'none'};				
				return asd;
			},
			imageOverlay : function(){
				return this.state !== 'stopped' ? 'active' : '';
			}
		},
		mounted: function (e) {
			var self = this;
			// `this` points to the vm instance
			this.controls.el = document.querySelector('.controls');
			// this.play.el = document.querySelector('.control-play');
			this.progress.el = document.querySelector('.progress-slider');
			this.video.el = document.querySelector('#video-overlay .video-wrapper');			
			var resize = resizeVideo(self.video.el);
			resize();
			resizeEvent.subscribe(resize);
			Player.on('play', function(){
				interval = setInterval(self.bindProgressBar(YT.API), 200);
				self.state = 'playing';
				// $('#video-overlay').css({'filter':'none'});
				// $(YT.API.getIframe()).parent().addClass('playing');
			}).on('pause', function(){
				self.state = 'paused';
				// $('#video-overlay').css({'filter':'grayscale() contrast(1.1) brightness(.65)'});
			}).on('end', function(){
				self.state = 'stopped';
				// $(YT.API.getIframe()).parent().removeClass('playing');
			}).on('statechange', function(){
				self.updateTime(YT.API.getCurrentTime());
				clearInterval(interval);
			}).on('qualitychange', function(){
				$('.control-quality .level[name="'+YT.API.getPlaybackQuality()+'"]').addClass('active').siblings().removeClass('active');		
			});
		},	
		methods: {
			updateDuration : function(time){
				this.video.duration = time;
			},
			updatePercentage : function(percent){
				this.video.percentage = percent;
			},
			updateTime : function(time){
				this.video.time = roundTime(time);
			},
			playButtonClick : function(){
				var player = window.YT.API;
				this.state === 'paused' ? player.playVideo() : player.pauseVideo();
			},
			hideControls : function(){
				this.controls.active = false;
			},
			showControls : function(){
				clearTimeout(this.controls.timeout);
				this.controls.active = true;
				this.controls.timeout = setTimeout(this.hideControls, 1000);
			},
			volumeClick : function(){
				if ( window.YT.API.getVolume() !== 0 ) {
					this.volume.state = "mute";
					window.YT.API.setVolume(0);
				} else {
					this.volume.state = "";
					window.YT.API.setVolume(100)
				}
			},
			progressDown : function(e){
				var player = window.YT.API;
				this.progressChange(e);
				this.progress.originalState = player.getPlayerState() === 1 ? player.pauseVideo() && 'playing' : 'paused';
				this.progress.state = 'active';
			},
			progressUp : function(e){
				var player = window.YT.API;
				this.progressChange(e);
				this.progress.state = 'inactive';
				this.progress.originalState === 'playing' ? player.playVideo() : null;				
			},
			progressChange : function(e){
				var player = window.YT.API,
					control = $(this.progress.el),
					width = e.pageX - control.position().left,
					percentage = range((width - 5) / (control.width() - 7), 0, 1);
				if(e.type !=="mousemove" || this.state === "active"){
					this.updateTime(player.getCurrentTime());
					this.updatePercentage(percentage);
					player.seekTo(player.getDuration() * percentage);
				}
			},
			bindProgressBar : function (player){
				var self = this,
					player = window.YT.API;
				self.updateDuration(player.getDuration());
				return function(){
					var percentage = player.getCurrentTime() / player.getDuration();
					self.updatePercentage(percentage);
					self.updateTime(player.getCurrentTime());
				};
			}
		}
	});
});