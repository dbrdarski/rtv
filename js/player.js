define(function(){
	var events = {};
	var interfaces = {};
	Player = {};
	Player.on = function(name, callback){
		events[name] = callback;
		return Player;
	};
	Player.trigger = function(name){
		event = events[name];				
		return event && event.apply(Player, Array.prototype.splice.call(arguments, 1));
	};
	Player.inject = function(i, name){
		interfaces[name || i.name] = i;
	};
	Player.load = function(v){
		interfaces[v.vendor](v.iframeId, v.videoId);
	};
	return Player;
});