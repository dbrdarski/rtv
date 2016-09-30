define([
	'mustache',
	// 'util',
    'jquery',
    'jquery.vimeo'
], function (M, $) {
	function getSize(domObject){
		var $o = $(domObject);
		return $o.width() / $o.height();
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
	
	var $videos = $('.video-wrapper');
	$videos.each(function(){
		$(window).on('resize.videos', swapVideoSize(this)).trigger('resize.videos');
	})
	// $(window).on('resize.ratio', ratio).trigger('resize.ratio');
});