define(['jquery'], function(){
    
    var events = {};
    YT =  function(container, video) {
        if (typeof(window.YT) == 'undefined' || typeof(window.YT.Player) == 'undefined') {
            window.onYouTubeIframeAPIReady = function() {
                loadPlayer(container, video);
            };

            // $.getScript('https://www.youtube.com/iframe_api');
            require(['https://www.youtube.com/iframe_api']);
        } else {
            loadPlayer(container, video);
            $(document).trigger('youtubeAPI.loaded');
        }
    };

    YT.events = function(e){
        events = e;
    }

    var loadPlayer = function(container, video) {
        YT.id = video;          // ??
        YT.iframe = container;  // ??
        YT.API = new window.YT.Player(container, {
            videoId: video,
            playerVars: {
                autoplay: 1,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0
            },
            events: events
        });
    };  

    return YT;
});