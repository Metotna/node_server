function parseHandle(prefix, urls, handle) {
	if (!handle) return;
	handle.stack.forEach((layer) => {
		if (layer.name === "router") {
			var llPrefix = prefix;
			var matching = layer.regexp.toString().match(/\\(\/[^/?]*)\\\//);
			if (matching) {
				llPrefix += matching[1];
			}
			parseHandle(llPrefix, urls, layer.handle);
		}
		if (layer.name === "bound dispatch") {
			urls.push(prefix + layer.route.path);
		}
	});
}

function routerPathHandle(app) {
	var urls = [];
	parseHandle("", urls, app._router);
	global.routerPath= urls.filter(path => path.indexOf("*") < 0);
}

module.exports = routerPathHandle;
