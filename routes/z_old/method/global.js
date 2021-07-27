// 本地全局变量
// 将设置为不可删除、只读

const mysql = require("./mysql");

global.tokeninfo = {};
global.info = [];
global.routerPath = [];

Object.defineProperty(global, "MYSQL", {
  value: mysql,
  writable: false,
  configurable: false,
});

const reset = function () {
  global.tokeninfo = {};
  global.info = {};
};
module.exports = {
  reset,
};
