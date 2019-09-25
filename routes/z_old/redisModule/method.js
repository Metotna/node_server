var redis = require("redis");

var set = (key, value, time) => {
	let client = redis.createClient();
	client.set(key, value);
	time = time ? time : 1 * 3600 * 24;
	client.expire(key, time);
	client.quit();
};

var get = (key) => {
	return new Promise(function (resolve, reject) {
		let client = redis.createClient();
		var result;
		client.get(key, function (err, response) {
			client.quit();
			if (err) {
				reject(err);
				return;
			}
			resolve(response);
		});
	});
};

var del = (key) => {
	let client = redis.createClient();
	client.del(key);
	client.quit();
};

var keys = function (key, type) {
	return new Promise(function (resolve, reject) {
		let client = redis.createClient();
		key = type ? "*#" + key : key + "#*";
		client.keys(key, function (err, response) {
			client.quit();
			if (err) {
				reject(err);
				return;
			}
			resolve(response[0]);
		});
	});
};

module.exports = {
	set,
	get,
	del,
	keys
};