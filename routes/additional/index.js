var express = require('express');
var router = express.Router();
var operation = require('./operation')
var condition = require('./condition')

router.use('/operation', operation)
router.use('/condition', condition)

module.exports = router;