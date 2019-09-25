var express = require('express');
var router = express.Router();
// var mysql = require('../method/mysql');
var redisMethod = require('./method')
var globalPara = require('../../_methods/dataSource/global')

/* redis 公共模块 baseUrl 校验 */
router.post('*', function (req, res, next) {
  const Url = req.baseUrl;
  let result = false;
  // console.log(Url, routerPath)
  for (var x in routerPath) {
    if (routerPath[x] == Url) {
      result = true;
      break;
    }
  }
  if(result) next()
  else MYSQL.SEND_RES(res, 'Specified route cannot be found', null, false, 806)
})

/* redis 公共模块 token 校验 */
router.post('/', function (req, res, next) {
  globalPara.reset();
  // const a = req.body
  // req.body.token = '496276df53f76ea2fa0df7bae839456e'
  const token = req.body.token || ''
  if (!token) {
    /* 无效的access token */
    MYSQL.SEND_RES(res, 'Parameter token invalid or no longer valid', null, false, 110)
  }else{
      redisMethod.keys(token, 1).then(rediskey => {
    if (rediskey) {
      return redisMethod.get(rediskey)
    } else {
      throw 'err'
    }
  }).then(val => {
    tokeninfo = JSON.parse(val)
    next()
  }).catch(err => {
    // access token过期
    MYSQL.SEND_RES(res, 'Parameter token expired', null, false, 111)
  })
  }

});

module.exports = router;