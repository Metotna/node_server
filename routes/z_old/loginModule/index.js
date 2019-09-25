var express = require("express");
var router = express.Router();
var handler = require("../method/cryhandler");
var mysql = require("../method/mysql.js");
var redisMethod = require("../redisModule/method");

router.post("*", function (req, res, next) {
	next();
});
router.post("/in", async function (req, res, next) {
	const t = req.body;
	if (!t.name || !t.pwd) {
		mysql.SEND_RES(res, "用户名或密码不能为空！", null, false);
	}
	var sql = `SELECT * from tbl_usr WHERE account = '${t.name}'`;
	mysql.SINGLE(sql).then(function (data) {
		if (data) {
			var secret = handler.decompile(t.pwd);
			var hash = handler.encryption(secret, data.pwd_salt);
			if (hash == data.pwd) {
				var new_token = handler.encrypMD5();
				redisMethod.keys(data.account)
					.then(d => {
						if (d) {
							return redisMethod.get(d);
						} else {
							data.token = new_token;
							redisMethod.set(data.account + "#" + new_token, JSON.stringify(data));
							mysql.SEND_RES(res, "用户登录成功", {token:new_token});
						}
					})
					.then(r => {
						r = JSON.parse(r);
						redisMethod.del(r.account + "#" + r.token);
						r.token = new_token;
						redisMethod.set(r.account + "#" + new_token, JSON.stringify(r));
						mysql.SEND_RES(res, "用户登录成功", {token:r.token});
					})
					.catch(err => {
						mysql.SEND_RES(res, "缓存区异常，请稍后再试", null, false);
					});
			} else {
				mysql.SEND_RES(res, "密码输入错误", null, false);
			}
		} else {
			mysql.SEND_RES(res, "该用户不存在！", null, false);
		}
	}).catch(function (data) {
		mysql.SEND_RES(res, "请求异常,请稍后再试", null, false);
	});
});
router.post("/c", function (req, res, next) {
	// console.log(2) 
	const v = handler.encrypMD5();
	mysql.SEND_RES(res, "token获取成功", v);
	// crypto.decrypt(encrypted, key) => {
	// 注意，encrypted是Buffer类型
	// console.log(v)
	// const encodeData = crypto.publicEncrypt(utils.pubkey, Buffer.from(`newtotna`)).toString('base64');
	// const encodeData =req.body.pwd;
	// console.log("encode: ", encodeData)
	// const decodeData = crypto.privateDecrypt(utils.prikey, Buffer.from(encodeData.toString('base64'), 'base64'));
	// console.log("decode: ", decodeData.toString())
	// };
	// console.log(ends)
	res.send(JSON.stringify({
		status: 666,
		msg: "数据操作异常!",
		data: null,
	}));
	// res.render('index', { title: 'Express' });
});
router.post("/regin", (req, res, next) => {
	const v = handler.encrypMD5();
	mysql.SEND_RES(res, "token获取成功", v);
});

module.exports = router;