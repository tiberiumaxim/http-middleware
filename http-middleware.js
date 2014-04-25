var http  = require('http');
var async = require('async');

var mddl = {
	server: null,
	middleware: {
		'global': []
	},
	routes: {},

	createServer: function () {
		mddl.server = http.createServer(mddl.request);

		return mddl;
	},

	listen: function (port, callback) {
		mddl.server.listen(port || '80', callback);
	},

	use: function (a, b) {
		if (typeof(a) === 'function') {
			if (a.length === 2) {
				mddl.routes['/'] = a;
			}
			else if (a.length === 3) {
				mddl.middleware['global'].push(a);
			}
			else {
				console.error('Error @ a-function');
			}
		}
		else if (typeof(a) === 'string' && typeof(b) === 'function') {
			if (b.length === 2) {
				mddl.routes[a] = b;
			}
			else if (b.length === 3) {
				if (!mddl.middleware[a]) {
					mddl.middleware[a] = [];
				}
				mddl.middleware[a].push(b);
			}
			else {
				console.error('Error @ b-function');
			}
		}
		else {
			console.error('Error @ mddl.use');
		}
	},	

	request: function (req, res) {
		var route = req.url;
		var allMiddleware = mddl.middleware.global;		
		
		if (mddl.routes[route]) {
			if (route !== 'global' && mddl.middleware.hasOwnProperty(route)) {
				allMiddleware = allMiddleware.concat(mddl.middleware[route]);
			}

			// console.log(route, mddl.middleware, allMiddleware);

			async.eachSeries(allMiddleware, function (mid, nextMid) {
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