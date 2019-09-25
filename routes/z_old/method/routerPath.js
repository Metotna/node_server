function parseHandle(prefix, urls, handle) {
	if (!handle) return;
	handle.stack.forEach((layer) => {
		if (layer.name == "router") {
			var llPrefix = prefix;
			var matchs = layer.regexp.toString().match(/\\(\/[^\/\?]*)\\\//);
			if (matchs) {
				llPrefix += matchs[1];
			}
			parseHandle(llPrefix, urls, layer.handle);
		}
		if (layer.name == "bound dispatch") {
			urls.push(prefix + layer.route.path);
		}
	});
}

function routerPathHandle(app) {
	var urls = [];
	parseHandle("", urls, app._router);
	const paths = urls.filter(path => path.indexOf("*") < 0);
	routerPath = paths;
}

module.exports = routerPathHandle;