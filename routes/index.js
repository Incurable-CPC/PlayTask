var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Task = mongoose.model('Task');

function encrypt(str) {
  var crypto = require('crypto');
  var md5 = crypto.createHash('md5');
  return md5.update(str).digest('base64');
}

function checkLogin(req, res, next) {
  console.log(req.signedCookies);
  if (req.session.user) {
    return next();
  } else if (req.signedCookies.user) {
    req.session.user = req.signedCookies.user;
    return next();
  }
  res.redirect('/login');
}
/* GET home page. */
router.get('/', checkLogin);
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Index',
    jsxFile: 'index.jsx'
  });
});

router.get('/login', function(req, res, next) {
  res.render('index', {
    title: 'Login',
    jsxFile: 'login.jsx'
  });
});
router.get('/logout', function(req, res, next) {
  req.session.user = null;
  res.clearCookie('user');
  res.redirect('/login');
});

router.post('/login', function(req, res, next) {
  var password = encrypt(req.body.password);
  User.findOne({username: req.body.username}, function(err, user) {
    if (err) return next(err);
    if (!user) {
      return res.send({
        success: false,
        errorMessage: 'User not exist'
      });
    }
    if (user.password != password) {
      return res.send({
        success: false,
        errorMessage: 'Wrong password'
      });
    }
    if (req.body.remember == 'true') {
      var nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth()+1);
      console.log(nextMonth);
      res.cookie('user', user.username, {
        signed: true,
        expires: nextMonth
      });
    }
    req.session.user = user.username;
    res.send({success: true});
  });
});
router.post('/register', function(req, res, next) {
  var password = encrypt(req.body.password);
  var newUser = new User({
    username: req.body.username,
    password: password
  });
  User.findOne({username: newUser.username}, function(err, user) {
    if (err) return next(err);
    if (user) {
      return res.send({
        success: false,
        errorMessage: 'User existed'
      });
    }
    newUser.save(function(err) {
      if (err) return next(err);
      res.send({success: true});
    });
  });
});

module.exports = router;
