var http  = require('http');
var async = require('async');

var mddl = {
	server: null,
	middleware: [],
	routes: {},

	createServer: function () {
		mddl.server = http.createServer(mddl.request);

		return mddl;
	},

	listen: function (port, callback) {
		mddl.server.listen(port || '80', callback);
	},

	use: function (a, b) {
		if (typeof(a) === 'function' && a.length === 3) {
			mddl.middleware.push(a);
		}
		else if (typeof(a) === 'function' && a.length === 2) {
			mddl.routes['/'] = a;
		}
		else if (typeof(a) === 'string' && typeof(b) === 'function') {
			mddl.routes[a] = b;
		}
		else {
			console.error('Error @ mddl.use');
		}
	},	

	request: function (req, res) {
		var route = req.url;
		
		if (mddl.routes[route]) {
			async.eachSeries(mddl.middleware, function (mid, nextMid) {
				mid(req, res, nextMid);
			}, function () {
				mddl.routes[route](req, res);		
			});
		}
		else {
			res.end('Route ' + route + ' was not found');
		}		
	}
};

module.exports = mddl;