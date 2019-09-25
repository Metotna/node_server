"use strict";
const mysql = require("mysql");
var sqljoin = require("./sqljoin");
var dataparse = require("./dataformt");
var config = require("../../serverconfig");

var pool = mysql.createPool(config.MYSQLCONFIG);

var SEND_RES = (res, text, data, flag, status) => {
	status = !flag ? (status || 200) : (status || 500);
	res.send(JSON.stringify({
		status: status,
		msg: text,
		data: data || null,
	}));
};

var beginTSA = () => {
	return new Promise(function (resolve, reject) {
		pool.getConnection(function (err, connection) {
			if (err) {
				reject(err);
				return;
			}
			connection.beginTransaction(err => {
				if (err) reject(err);
				else {
					resolve(connection);
				}
			});
		});
	});
};
/**只返回 连接状态  */
var course = (connection, sql, params) => {
	return new Promise(function (resolve, reject) {

		connection.query(sql, params, function (err, res) {
			// console.log('res')
			if (err) {
				return connection.rollback(function () {
					resolve(err);
				});
			}
			resolve(connection);
		});
	});
};
/**返回 连接状态 && 查询结果 */
var course_res = (connection, sql, params) => {
	return new Promise(function (resolve, reject) {
		connection.query(sql, params, function (err, res) {
			if (err) {
				return connection.rollback(function () {
					resolve(err);
				});
			}
			for (let i in res[0]) {
				// console.log(res[0][i])
				resolve({
					con: connection,
					res: res[0][i] || null
				});
				return;
			}
			resolve(connection);
		});
	});
};

var finishTSA = (connection) => {
	return new Promise(function (resolve, reject) {
		connection.commit(function (err) {
			if (err) {
				return connection.rollback(function () {
					resolve(err);
				});
			}
			resolve("success");
		});
	});
};

//将结果与对象数组返回
var row = (sql, params) => {
	return new Promise(function (resolve, reject) {
		pool.getConnection(function (err, connection) {
			if (err) {
				reject(err);
				return;
			}
			connection.query(sql, params, function (error, res) {
				connection.release();
				if (error) {
					reject(error);
					return;
				}
				resolve(res);
			});
		});
	});
};
//返回一个对象
var first = (sql, params) => {

	return new Promise(function (resolve, reject) {

		pool.getConnection(function (err, connection) {
			if (err) {
				reject(err);
				return;
			}
			connection.query(sql, params, function (error, res) {
				connection.release();
				if (error) {
					reject(error);
					return;
				}
				resolve(res || null);
			});
		});
	});
};
//返回单个查询结果
var single = (sql, params) => {
	return new Promise(function (resolve, reject) {
		pool.getConnection(function (err, connection) {
			if (err) {
				reject(err);
				return;
			}
			connection.query(sql, params, function (error, res) {
				connection.release();
				if (error) {
					reject(error);
					return;
				}
				resolve(res[0] || null);
				// console.log(res[0])
				// for (let i in res[0]) {
				//   resolve(res[0][i] || null);
				//   return;
				// }
				// resolve(null);
			});
		});
	});
};
//执行代码，返回执行结果
var execute = (sql, params) => {
	return new Promise(function (resolve, reject) {
		pool.getConnection(function (err, connection) {
			if (err) {
				reject(err);
				return;
			}
			connection.query(sql, params, function (error, res) {
				connection.release();
				if (error) {
					reject(error);
					return;
				}
				resolve(res);
			});
		});
	});
};


//模块导出
module.exports = {
	TSA: {
		begin: beginTSA,
		finish: finishTSA,
		course: course,
		course_res: course_res
	},
	SEND_RES: SEND_RES,
	ROW: row,
	FIRST: first,
	SINGLE: single,
	EXECUTE: execute,
	SQLJOIN: sqljoin,
	DATEF: dataparse,
};