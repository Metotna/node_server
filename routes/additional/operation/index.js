var express = require('express');
var router = express.Router();
var mysql = require('../../_methods/mysql');

router.post('/list', function (req, res, next) {
  var sql = 'SELECT `id`,`type`,`ikey`,`name`,icon,title,adv,propose_1,propose_2,propose_3,start_time,end_time FROM `lot_opt_ui_item` ';
  mysql.ROW(sql).then(data => {
    data.map(i => {
      i.start_time = mysql.DATEF(i.start_time, 'yyyy/MM/dd hh:mm:ss');
      i.end_time = mysql.DATEF(i.end_time, 'yyyy/MM/dd hh:mm:ss');
    })
    mysql.SEND_RES(res, '成功获取列表!', data)
  }).catch(data => {
    mysql.SEND_RES(res, '数据异常,请稍后再试!', null, false)
  })
  // console.log(1111)
});

router.post('/list/edit', function (req, res, next) {
  const t = req.body;
  if (!t.name || !t.ikey) {
    res.send(JSON.stringify({
      status: 500,
      msg: '条件不满足!',
      data: null,
    }))
    return
  }
  var TSA = mysql.TSA;
  var nowtime = mysql.DATEF(new Date(), 'yyyy/MM/dd hh:mm:ss');
  
  var _item_prop = {
    type: t.type,
    ikey: t.ikey,
    name: t.name,
    icon: t.icon,
    title: t.title,
    adv: t.adv,
    propose_1: t.propose_1,
    propose_2: t.propose_2,
    propose_3: t.propose_3,
    start_time: t.start_time || null,
    end_time: t.end_time || null,
    update_time: nowtime,
  }
  // console.log( _item_prop)
  if (t.id) {
    // 修改数据-partA
    var sql_item = 'select ikey from lot_opt_ui_item where id=' + t.id; //A1 

    var sql = mysql.SQLJOIN({
      type: 'UPDATE',
      prop: _item_prop,
    }, 'lot_opt_ui_item', {
      where: true,
      whereProp: [{
        id: t.id
      }]
    }, {
      limit: true,
      num: 1
    }) //A4
    mysql.SINGLE(sql_item).then(data => {
      if (data == t.ikey) {
        mysql.SINGLE(sql).then(data => {
            mysql.SEND_RES(res, '数据操作成功!', data)
          })
          .catch(err => {
            mysql.SEND_RES(res, '数据异常,请稍后再试!', null, false)
          })
      } else {
        var sql_lay = "select id from lot_opt_ui_layout_item where item_key = '" + data + "'"; //A2
        // console.log(1001)
        TSA.begin()
          .then(con => {
            return TSA.course_res(con, sql_lay)
          })
          .then(data => {
            var sql_lay_up = " update lot_opt_ui_layout_item set item_key ='" + t.ikey + "' where id = " + data.res; //A3
            return TSA.course(data.con, sql_lay_up)
          })
          .then(con => {
            return TSA.course(con, sql)
          })
          .then(con => {
            return TSA.finish(con)
          })
          .then(data => {
            mysql.SEND_RES(res, '数据操作成功!', data)
          })
          .catch(err => {
            mysql.SEND_RES(res, '数据异常,请稍后再试!', null, false)
          })
      }
    })
  } else {
    // 插入数据-partB
    // console.log('PartB')
    var sql = mysql.SQLJOIN({
      type: 'INSERT',
      prop: _item_prop
    }, 'lot_opt_ui_item', {
      limit: true,
      num: 1
    }) //B1
    var sql_lay_max = 'select max(item_pos) as maxid from lot_opt_ui_layout_item;'; // B2
    TSA.begin()
      .then(con => {
        return TSA.course(con, sql)
      })
      .then(con => {
        return TSA.course_res(con, sql_lay_max)
      })
      .then(data => {
        var sql_lay_ins = mysql.SQLJOIN({
          type: 'INSERT',
          prop: {
            layout_id: '1',
            item_key: t.ikey,
            item_pos: data.res + 1,
            create_time: nowtime
          },
        }, 'lot_opt_ui_layout_item', {
          limit: true,
          num: 1
        }) //B3
        return TSA.course(data.con, sql_lay_ins)
      })
      .then(con => {
        return TSA.finish(con)
      })
      .then(data => {
        mysql.SEND_RES(res, '数据操作成功!', data)
      })
      .catch(err => {
        mysql.SEND_RES(res, '数据异常,请稍后再试!', null, false)
      })
  }
})

router.post('/layout', function (req, res, next) {
  var x = req.body;
  var _id = x.id || 1;
  var sql = 'SELECT lot_opt_ui_layout_item.id,lot_opt_ui_layout_item.item_key AS ikey,lot_opt_ui_item.name,lot_opt_ui_layout_item.item_pos AS ordid ,lot_opt_ui_item.icon ,lot_opt_ui_item.title ,lot_opt_ui_item.adv ,lot_opt_ui_item.propose_1 ,lot_opt_ui_item.propose_2,lot_opt_ui_item.propose_3 FROM lot_opt_ui_layout_item LEFT JOIN `lot_opt_ui_item` ON `lot_opt_ui_item`.ikey=`lot_opt_ui_layout_item`.item_key where layout_id =' + _id + ' ORDER BY lot_opt_ui_layout_item.item_pos;select id,propose,adv,normal from lot_opt_ui_layout where id=' + _id;

  mysql.ROW(sql)
    .then(data => {
      var datas = {
        list: data[0],
        layout: data[1][0]
      };
      mysql.SEND_RES(res, '成功获取列表!', datas)
    })
    .catch(data => {
      mysql.SEND_RES(res, '数据异常,请稍后再试!', null, false)
    })
})

router.post('/layout/edit', function (req, res, next) {
  var t = req.body
  var TSA = mysql.TSA;
  var nowtime = mysql.DATEF(new Date(), 'yyyy/MM/dd hh:mm:ss');
  var sql_layout = mysql.SQLJOIN({
    type: 'UPDATE',
    prop: {
      propose: t.propose,
      adv: t.adv,
      normal: t.normal,
      update_time: nowtime,
    }
  }, 'lot_opt_ui_layout', {
    where: true,
    whereProp: [{
      id: t.id
    }]
  }, {
    limit: true,
    num: 1
  })

  TSA.begin()
    .then(con => {
      return TSA.course(con, sql_layout)
    })
    .then(con => {
      var sql = JoinStr_layedit(t);
      return TSA.course(con, sql)
    })
    .then(con => {
      return TSA.finish(con)
    })
    .then(data => {
      mysql.SEND_RES(res, '成功获取列表!', data)
    })
    .catch(err => {
      mysql.SEND_RES(res, '数据异常,请稍后再试!', null, false)
    })
})

module.exports = router;

function JoinStr_layedit(t) {
  var str = '';
  var ary = t.list.split(',');
  for (var i = 0; i < ary.length; i++) {
    var temp = ' when ' + ary[i] + ' then ' + (i + 1);
    str += temp;
  }
  var str = 'UPDATE lot_opt_ui_layout_item SET item_pos =  case id ' + str + ' END WHERE  id IN (' + t.list + ')';
  return str
}