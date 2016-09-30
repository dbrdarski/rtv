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

	return {
		compose : compose,
		pipe : pipe
	}
});
