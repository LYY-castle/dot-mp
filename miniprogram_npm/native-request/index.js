module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1596528633790, function(require, module, exports) {
`use strict`

const http = require('http');
const https = require('https');
const url = require('url');

function getProtocol(path) {
	return url.parse(path).protocol === "http:" ? http : https;
}

/**
 * Send a get request
 * @param path is the url endpoint
 * @param headers of the request
 * @param callback contains (error, body, status, headers)
 */
 function get(path, headers, callback) {
 	request(path, "GET", null, headers, callback);
 }

/**
 * Send a post request
 * @param path is the url endpoint
 * @param headers of the request
 * @param callback contains (error, body, status, headers)
 * @param data a JSON Object or a string
 */
 function post(path, data, headers, callback) {
 	request(path, "POST", data, headers, callback);
 }

/**
 * Send a custom request
 * @param path is the url endpoint
 * @param headers of the request
 * @param callback contains (error, statusCode, data)
 * @param data a JSON Object or a string
 * @param method is the protocol used like POST GET DELETE PUT etc...
 */
 function request(path, method, data, headers = '', callback) {
 	if (typeof data === 'function') {
 		callback = data;
 		data = '';
 	} else if (typeof headers === 'function') {
 		callback = headers;
 		headers = {};
 	} 
 	const postData = typeof data === "object" ? JSON.stringify(data) : data;
 	const parsedUrl = url.parse(path);
 	const options = {
 		hostname: parsedUrl.hostname,
 		port: parsedUrl.port,
 		path: parsedUrl.pathname +  (!!parsedUrl.search ? parsedUrl.search : ''),
  		method: method,
 		headers: headers
 	};
 	const req = getProtocol(path).request(options, function (response) {
 		handleResponse(response, callback);
 	});
 	req.on('error', function (error) {
 		callback(error);
 		console.error(error);
 	});
	// Write data to request body
	if (method !== "GET")
		req.write(postData);
	req.end();
}

function handleResponse(response, callback) {
	let body = '';
	const status = response.statusCode;
	const hasError = status >= 300;
	response.setEncoding('utf8');
	response.on('data', function (data) {
		body += data;
	});
	response.on('end', function () {
		callback(hasError ? body : null, hasError ? null : body, response.statusCode, response.headers);
	});
}

module.exports = {
	get,
	request,
	post
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1596528633790);
})()
//# sourceMappingURL=index.js.map