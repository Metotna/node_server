var express = require('express');
var router = express.Router();
var handler = require('../../_methods/pulgin/cryhandler')
// var MYSQL = require('../method/MYSQL.js');
var redisMethod = require('../redis/method')

router.post('*', function (req, res, next) {
  next()
})
router.post('/in', function (req, res, next) {
  const t = req.body;
  if (!t.name || !t.pwd) {
    MYSQL.SEND_RES(res, 'The username or password can not be empty', null, false)
  } else {
    var sql = `SELECT * from tbl_usr WHERE account = '${t.name}' or mobile = '${t.name}' `
    console.log(343333)
    MYSQL.SINGLE(sql).then(function (data) {
      if (data) {
        var secret = handler.decompile(t.pwd)
        var hash = handler.encryption(secret, data.pwd_salt)
        if (hash == data.pwd) {
          var new_token = handler.encrypMD5()
          redisMethod.keys(data.account).then(d => {
            if (d) {
              return redisMethod.get(d)
            } else {
              data.token = new_token;
              redisMethod.set(data.account + '#' + new_token, JSON.stringify(data))
              MYSQL.SEND_RES(res, 'Successful user login', {
                token: new_token
              })
            }
          }).then(r => {
            r = JSON.parse(r)
            redisMethod.del(r.account + '#' + r.token)
            r.token = new_token
            redisMethod.set(r.account + '#' + new_token, JSON.stringify(r))
            MYSQL.SEND_RES(res, 'Successful user login', {
              token: r.token
            })
          }).catch(err => {
            MYSQL.SEND_RES(res, 'A database error occurred. Please try again', null, false, 805)
          })
        } else {
          MYSQL.SEND_RES(res, 'Password Error', null, false)
        }
      } else {
        MYSQL.SEND_RES(res, 'The user does not exist！', null, false)
      }
    }).catch(function (data) {
      MYSQL.SEND_RES(res, 'Service temporarily unavailable', null, false, 2)
    })
  }

})


router.post('/reg', function (req, res, next) {
  const t = req.body;
  if (!t.name || !t.pwd) {
    MYSQL.SEND_RES(res, 'The username or password can not be empty', null, false)
  } else {
    var _pwd_salt = handler.randomString(16);
    var sql = `SELECT * from tbl_usr WHERE account = '${t.name}'`
    /* 检验 是否已注册 */
    var nowtime = MYSQL.DATEF(new Date(), 'yyyy/MM/dd hh:mm:ss');
    MYSQL.SINGLE(sql).then(function (data) {
      if (!data) {
        /* 未注册用户流程 */
        var hash = handler.encryption(t.pwd, _pwd_salt)
        var _item_prop = {
          account: t.name,
          pwd: hash,
          pwd_salt: _pwd_salt,
          usr_type: 1,
          mobile: t.mobile || '',
          create_time: nowtime,
        }
        var sql = MYSQL.SQLJOIN({
          type: 'INSERT',
          prop: _item_prop
        }, 'tbl_usr', {
          limit: true,
          num: 1
        })
        MYSQL.SINGLE(sql).then(data => {
          MYSQL.SEND_RES(res, 'Successful registration,please sign in.',null)
        }).catch(error => {
          MYSQL.SEND_RES(res, 'Invalid parameter', null, false, 100)
        })
      } else {
        MYSQL.SEND_RES(res, 'The user does not exist！', null, false)
      }
    }).catch(function (data) {
      MYSQL.SEND_RES(res, 'Service temporarily unavailable', data, false, 2)
    })
  }

})
// _item_prop.creatime = nowtime;
// var sql = MYSQL.SQLJOIN({
//   type: 'INSERT',
//   prop: _item_prop
// }, 'as_basic', {
//   limit: true,
//   num: 1
// }) 

router.post('/c', function (req, res, next) {
  // console.log(2) 
  const v = handler.encrypMD5()
  MYSQL.SEND_RES(res, 'token获取成功', v)
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
  MYSQL.SEND_RES(res, 'A database error occurred. Please try again', null, false, 805)
  // res.render('index', { title: 'Express' });
})
router.post('/regin', (req, res, next) => {
  const v = handler.encrypMD5()
  MYSQL.SEND_RES(res, 'token获取成功', v)
})

module.exports = router