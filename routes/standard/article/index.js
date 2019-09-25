var express = require('express');
var router = express.Router();
// const crypto = require('crypto');
// var utils = require('../pulgin/index.js');
// var MYSQL = require('../method/MYSQL.js');

router.post('*', function (req, res, next) {
  next()
})

router.post('/data', function (req, res, next) {
  const t = req.body;
  // console.log(tokeninfo.id)
  var sql = 'SELECT `id`,`title`,`introduce`,`updatetime`,`type`  FROM `as_basic`  WHERE writerid = ' + tokeninfo.id + ' ORDER BY  `updatetime` DESC ';
  if (t.pageNumber && t.pageNumber > 0) {
    var LIMIT = `LIMIT ${t.pageNumber*10-10},${t.pageNumber*10} `
  } else {
    var LIMIT = `LIMIT 0,10 `
  }
  sql += LIMIT;
  var sql_count = `SELECT COUNT(*) AS total FROM as_basic  WHERE writerid = ${tokeninfo.id}`
  //  事务查询
  var TSA = MYSQL.TSA;
  var result = {}
  TSA.begin().then(con => {
      return TSA.course_res(con, sql_count)
    }).then(data => {
      result.total = data.res[0].total;
      result.page = t.pageNumber || 1;
      return TSA.course_res(data.con, sql)
    }).then(data => {
      result.list = data.res;
      result.list.map(i => {
        i.updatetime = MYSQL.DATEF(i.updatetime, 'yyyy/MM/dd hh:mm:ss');
        // i.end_time = MYSQL.DATEF(i.end_time, 'yyyy/MM/dd hh:mm:ss');
      })
      return TSA.finish(data.con)
    }).then(data => {
      MYSQL.SEND_RES(res, '数据获取成功!', result)
    }).catch(err => {
      MYSQL.SEND_RES(res, 'Unknown data store API error', null, false)
    })
})

router.post('/content', function (req, res, next) {
  const t = req.body;
  if (!t.id) {
    MYSQL.SEND_RES(res, '数据异常,请稍后再试!', null, false)
  }
  var sql = `SELECT id,title,content,updatetime,type FROM as_basic where id= ${t.id} AND writerid = ${tokeninfo.id}`;
  MYSQL.FIRST(sql).then(data => {
    data.map(i => {
      i.updatetime = MYSQL.DATEF(i.updatetime, 'yyyy/MM/dd hh:mm:ss');
      // i.end_time = MYSQL.DATEF(i.end_time, 'yyyy/MM/dd hh:mm:ss');
    })
    MYSQL.SEND_RES(res, 'Success', data[0])
  }).catch(data => {
    MYSQL.SEND_RES(res, 'Unknown data store API error', null, false)
  })
  // console.log(1111)
});

router.post('/content/edit', function (req, res, next) {
  const t = req.body;
  var nowtime = MYSQL.DATEF(new Date(), 'yyyy/MM/dd hh:mm:ss');
  var _item_prop = {
    title: t.title,
    content: t.content,
    writerid: tokeninfo.id,
    updateid: tokeninfo.id,
    type: t.type || ``,
    introduce: t.introduce || ``,
    updatetime: nowtime,
  }
  if (t.id) {
    // 修改数据-partA
    // var sql_item = 'select ikey from lot_opt_ui_item where id=' + t.id; //A1 
    var sql = MYSQL.SQLJOIN({
      type: 'UPDATE',
      prop: _item_prop,
    }, 'as_basic', {
      where: true,
      whereProp: [{
        id: t.id,
      }]
    }, {
      limit: true,
      num: 1
    }) //A4
    MYSQL.SINGLE(sql)
      .then(data => {
        MYSQL.SEND_RES(res, '数据操作成功!', data)
      })
      .catch(err => {
        MYSQL.SEND_RES(res, 'Unknown data store API error', null, false)
      })
  } else {
    // 插入数据-partB
    _item_prop.creatime = nowtime;
    var sql = MYSQL.SQLJOIN({
      type: 'INSERT',
      prop: _item_prop
    }, 'as_basic', {
      limit: true,
      num: 1
    }) //B1
    // var sql_lay_max = 'select max(item_pos) as maxid from lot_opt_ui_layout_item;'; // B2
    MYSQL.SINGLE(sql)
      .then(data => {
        MYSQL.SEND_RES(res, '数据操作成功!', data)
      })
      .catch(err => {
        MYSQL.SEND_RES(res, '数据异常,请稍后再试!', null, false)
      })
  }
})


router.post('/c', function (req, res, next) {
  console.log(2)
  // crypto.decrypt(encrypted, key) => {
  // 注意，encrypted是Buffer类型
  console.log(req.body)
  // const encodeData = crypto.publicEncrypt(utils.pubkey, Buffer.from(`newtotna`)).toString('base64');
  // const encodeData =req.body.pwd;
  // console.log("encode: ", encodeData)
  // const decodeData = crypto.privateDecrypt(utils.prikey, Buffer.from(encodeData.toString('base64'), 'base64'));
  // console.log("decode: ", decodeData.toString())
  // };
  // console.log(ends)
  res.send(JSON.stringify({
    status: 666,
    msg: '数据操作异常!',
    data: null,
  }))
  // res.render('index', { title: 'Express' });
})
module.exports = router;