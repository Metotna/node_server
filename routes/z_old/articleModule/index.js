var express = require("express");
// const crypto = require('crypto');
// var utils = require('../pulgin/index.js');
var handler = require("../method/cryhandler");

var mysql = require("../method/mysql.js");

var router = express.Router();

function randomString(len) {　　
	len = len || 32;　　
	var $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/ 　　
	var maxPos = $chars.length;　　
	var pwd = "";　　
	for (i = 0; i < len; i++) {　　　　
		pwd += $chars.charAt(Math.floor(Math.random() * maxPos));　　
	}　　
	return pwd;
}

router.post("*", function (req, res, next) {
	console.log(23435);
	next();
});


router.post("/data", function (req, res, next) {
	const t = req.body;
	var sql = "SELECT `id`,`title`,`introduce`,`updatetime`,`type`  FROM `as_basic` ORDER BY  `updatetime` DESC ";
	if (t.pagenumber && t.pagenumber > 0) {
		var LIMIT = `LIMIT ${t.pagenumber*10},${t.pagenumber*10+10} `;
	} else {
		var LIMIT = "LIMIT 0,10 ";
	}
	sql += LIMIT;
	mysql.ROW(sql).then(function (data) {
		data.forEach(function (x, index, array) {
			x.updatetime = mysql.DATEF(x.updatetime, "yyyy-MM-dd hh:mm:ss");
		});
		mysql.SEND_RES(res, "数据获取成功!", data);
	}).catch(function (err) {
		mysql.SEND_RES(res, err, null, false);
	});
});

router.post("/content", function (req, res, next) {
	const t = req.body;
	if (!t.id) {
		res.send(JSON.stringify({
			status: 500,
			msg: "参数有误",
			data: null,
		}));
		return;
	}
	var sql = "SELECT id,title,content,updatetime,type FROM as_basic where id= " + t.id;
	mysql.FIRST(sql).then(data => {
		data.map(i => {
			i.updatetime = mysql.DATEF(i.updatetime, "yyyy/MM/dd hh:mm:ss");
			// i.end_time = mysql.DATEF(i.end_time, 'yyyy/MM/dd hh:mm:ss');
		});
		mysql.SEND_RES(res, "ok!", data[0]);
	}).catch(data => {
		mysql.SEND_RES(res, "数据异常,请稍后再试!", null, false);
	});
	// console.log(1111)
});

router.post("/content/edit", function (req, res, next) {
	const t = req.body;
	// if (!t.name || !t.ikey) {
	//   res.send(JSON.stringify({
	//     status: 500,
	//     msg: '条件不满足!',
	//     data: null,
	//   }))
	//   return
	// }
	var TSA = mysql.TSA;
	var nowtime = mysql.DATEF(new Date(), "yyyy/MM/dd hh:mm:ss");

	var _item_prop = {
		title: t.title,
		content: t.content,
		writerid: 1,
		updateid: 1,
		type: t.type || "",
		introduce: t.introduce || "",
		updatetime: nowtime,
	};
	if (t.id) {
		// 修改数据-partA
		// var sql_item = 'select ikey from lot_opt_ui_item where id=' + t.id; //A1 
		var sql = mysql.SQLJOIN({
			type: "UPDATE",
			prop: _item_prop,
		}, "as_basic", {
			where: true,
			whereProp: [{
				id: t.id
			}]
		}, {
			limit: true,
			num: 1
		}); //A4
		mysql.SINGLE(sql).then(data => {
			mysql.SEND_RES(res, "数据操作成功!", data);
		})
			.catch(err => {
				mysql.SEND_RES(res, "数据异常,请稍后再试!", null, false);
			});
	} else {
		// 插入数据-partB
		_item_prop.creatime = nowtime;
		var sql = mysql.SQLJOIN({
			type: "INSERT",
			prop: _item_prop
		}, "as_basic", {
			limit: true,
			num: 1
		}); //B1
		// var sql_lay_max = 'select max(item_pos) as maxid from lot_opt_ui_layout_item;'; // B2
		mysql.SINGLE(sql).then(data => {
			mysql.SEND_RES(res, "数据操作成功!", data);
		})
			.catch(err => {
				mysql.SEND_RES(res, "数据异常,请稍后再试!", null, false);
			});
	}
});


router.post("/c", function (req, res, next) {
	console.log(2);
	// crypto.decrypt(encrypted, key) => {
	// 注意，encrypted是Buffer类型
	console.log(req.body);
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
module.exports = router;