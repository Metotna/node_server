var express = require('express');
var router = express.Router();
var article = require('./article')
var login = require('./login')
var redis = require('./redis')

router.use('/login', login)
router.use('*',redis)
router.use('/article', article)

module.exports = router;