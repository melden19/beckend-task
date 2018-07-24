const express = require('express');
const router = express.Router();

router.get('/', ensureAuth, (req, res) => {
  res.render('index');
})

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('error_msg', 'You are not logged in!')
    res.redirect('/signin')
  }
}

module.exports = router