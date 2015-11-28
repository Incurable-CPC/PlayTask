/**
 * Created by Cai on 11/27/2015.
 */

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Task = mongoose.model('Task');

function checkLogin(req, res, next) {
  if (req.session.user) {
    return next();
  } else if (req.signedCookies.user) {
    req.session.user = req.signedCookies.user;
    return next();
  }
  res.send({});
}

router.get('/', checkLogin);
router.get('/achievement/get', function(req, res, next) {
  User.findOne({username: req.session.user}, function(err, user) {
    if (err) return next(err);
    res.send({achievement: user.achievement});
  });
});

router.get('/task/get/:type/', function (req, res, next) {
  var type = Number(req.params['type']);
  User.findOne({username: req.session.user}, function(err, user) {
    if (err) return next(err);
    user.getAllTask(type, function(err, taskList) {
      if (err) return next(err);
      res.send(taskList);
    });
  })
});
router.post('/task/new', function(req, res, next) {
  var task = new Task(JSON.parse(req.body.task));
  task.save(function(err, task) {
    if (err) return next(err);
    User.findOne({username: req.session.user}, function(err, user) {
      if (err) return next(err);
      user.addTask(task, function(err, user) {
        if (err) return next(err);
        res.send(task);
      });
    });
  });
});
router.post('/task/edit', function(req, res, next) {
  var task = JSON.parse(req.body.task);
  Task.findByIdAndUpdate(task._id, task, function(err, task) {
    if (err) return next(err);
    res.send(task);
  });
});
router.post('/task/complete', function(req, res, next) {
  var task = JSON.parse(req.body.task);
  User.findOne({username: req.session.user}, function(err, user) {
    if (err) return next(err);
    user.completeTask(task, function(err, success) {
      if (err) return next(err);
      res.send(success);
    });
  });
});
router.post('/task/remove', function(req, res, next) {
  var task = JSON.parse(req.body.task);
  User.findOne({username: req.session.user}, function(err, user) {
    if (err) return next(err);
    user.removeTask(task, function(err, user) {
      if (err) return next(err);
      res.send(task);
    });
  });
});

router.get('/desire/get', function(req, res, next) {
  User.findOne({username: req.session.user}, function(err, user) {
    if (err) return next(err);
    res.json(user.desire);
  });
});
router.post('/desire/new', function(req, res, next) {
  var desire = JSON.parse(req.body.desire);
  User.findOne({username: req.session.user}, function(err, user) {
    if (err) return next(err);
    user.addDesire(desire, function(err, user) {
      if (err) return next(err);
      res.send(desire);
    });
  });
});
router.post('/desire/edit', function(req, res, next) {
  var desire = JSON.parse(req.body.desire);
  User.findOne({username: req.session.user}, function(err, user) {
    if (err) return next(err);
    user.editDesire(desire, function(err) {
      if (err) return next(err);
      res.send(desire);
    });
  });
});
router.post('/desire/enjoy', function(req, res, next) {
  var desire = JSON.parse(req.body.desire);
  User.findOne({username: req.session.user}, function(err, user) {
    if (err) return next(err);
    user.enjoyDesire(desire, function(err) {
      if (err) return next(err);
      res.send(desire);
    });
  });
});
router.post('/desire/remove', function(req, res, next) {
  var desire = JSON.parse(req.body.desire);
  User.findOne({username: req.session.user}, function(err, user) {
    if (err) return next(err);
    user.removeDesire(desire, function(err, user) {
      if (err) return next(err);
      res.send(desire);
    });
  });
});

router.get('/event/get', function(req, res, next) {
  User.findOne({username: req.session.user}, function(err, user) {
    if (err) return next(err);
    res.json(user.event.slice(-10).reverse());
  });
});
router.post('/event/remove', function(req, res, next) {
  var event = JSON.parse(req.body.event);
  User.findOne({username: req.session.user}, function(err, user) {
    if (err) return next(err);
    user.removeEvent(event, function(err, user) {
      if (err) return next(err);
      res.send(event);
    });
  });
});

module.exports = router;
