var express = require('express');
var router = express.Router();
var mysql = require('../method/mysql');


router.post('/data', function(req, res, next) {
  var sql = 'SELECT `lot_item`.key as `ikey`, `lot_item`.name as `iname`, `lot_type`.name as `tname`, `lot_org`.name as `oname` FROM `lot_item` LEFT JOIN `lot_type` ON `lot_type`.id = `lot_item`.lot_type LEFT JOIN `lot_org` ON `lot_type`.lot_org = `lot_org`.key';
  mysql.ROW(sql).then(function(data) {
    mysql.SEND_RES(res, '数据获取成功!', data)
  }).catch(function(data) {
    mysql.SEND_RES(res, '数据异常,请稍后再试!', null, false)
  })
});


module.exports = router;