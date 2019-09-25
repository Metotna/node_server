var express = require("express");
// var app = express();
var router = express.Router();

/* Check router path . */
router.get("/", function (req, res) {
	res.location("/index.html");
});

router.get("/url", function (req, res) {
	// var a = router.toString();
	// var urls = [];
	// parseHandle("", urls, router.app._router)
	res.send("GET request to homepage");
	// mysql.SEND_RES(res, urls, null, false,502)
});


module.exports = router;
