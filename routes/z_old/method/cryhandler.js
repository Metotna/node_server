'use strict'
var crypto = require('crypto');
var utils = require('./utils.js');

var randomString = function (len) {　　
  len = len || 32;　　
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/ 　　
  var maxPos = $chars.length;　　
  var pwd = '';　　
  for (let i = 0; i < len; i++) {　　　　
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));　　
  }　　
  return pwd;
}
var decompile = function (val) {
  if (!val) return
  const decodeData = crypto.privateDecrypt(utils.prikey, Buffer.from(val.toString('base64'), 'base64'));
  return decodeData.toString()
}
var encryption = function (secret, salt) {
  if (!secret || !salt) return
  const hash = crypto.createHmac('sha256', secret).update(salt).digest('hex');
  return hash
}

var encrypMD5 = function () {
  var content = this.randomString(5);
  var shasum = crypto.createHash('md5').update(content).digest('hex');
  return shasum
}
//模块导出
module.exports = {
  randomString,
  decompile,
  encryption,
  encrypMD5
}