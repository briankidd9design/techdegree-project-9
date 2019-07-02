const express = require('express');
const router = express.Router();

/* GET current user. */
router.get('/', function(req, res, next) {
  res.redirect('/api/users')
});

module.exports = router;
