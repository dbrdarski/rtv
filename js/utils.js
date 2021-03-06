define( function () {
	var compose = function () {
		var fns = arguments;

		return function (result) {
			for (var i = fns.length - 1; i > -1; i--) {
				result = fns[i].call(this, result);
			}

			return result;
		};
	};
	var pipe = function () {
		var fns = arguments;

		return function (result) {
			for (var i = 0; i < fns.length; i++) {
				result = fns[i].call(this, result);
			}

			return result;
		};
	};
 
    var memo = function(fn){
      var args = Array(fn.length);
      return function Replace(){
        var replace = Array.prototype.slice.call(arguments);
        args = args.concat(replace).slice(replace.length);
        return fn.apply(null, args);
      };
    };
 
	return {
		compose : compose,
		pipe : pipe,
		memo : memo
	}
});
