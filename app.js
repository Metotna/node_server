const express = require("express");
const path = require("path");
// var favicon = require('serve-favicon');
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();

const index = require("./routes");

const tools = require("./tools");

// var lotopr_lot = require('./routes/lotopr/lot')
// var lotopr_opt = require('./routes/lotopr/opt')
// const global = require('./routes/method/global')
// const redisModule = require('./routes/redisModule')
// const articleModule = require('./routes/articleModule')
// const loginModule = require('./routes/loginModule')

const standard = require("./routes/standard");
const additional = require("./routes/additional");

const global = require("./routes/_methods/dataSource/global");
const routerPathHandle = require("./routes/_methods/routerPath");

// // view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 设置跨域访问
app.all("*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "X-Requested-With");
  // res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  // res.header("X-Powered-By", ' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

app.use((req, res, next) => {
  res.sendInfo = tools.SEND_RES;
  res.sendErr = tools.SEND_ERR;
  next();
});

app.use("/", index);
/* blog内容 */
app.use("/", standard);
/* 运营内容 */
// app.use('/',additional)

// app.use('/login', loginModule)
// app.use('/', redisModule);
// app.use('/pro', articleModule)

// app.use('/open/ui/condition', lotopr_lot)
// app.use('/open/ui/operation', lotopr_opt)

// // catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // console.log(`info`,info)
  res.status(500).send({
    status: 2,
    msg: "Service temporarily unavailable",
  });
});

routerPathHandle(app);
module.exports = app;
