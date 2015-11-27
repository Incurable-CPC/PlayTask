var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Task = mongoose.model('Task');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Index' });
});
router.get('/api/achievement/get', function(req, res, next) {
  User.findOne({username: 'test'}, function(err, user) {
    if (err) return next(err);
    res.send({achievement: user.achievement});
  });
});

router.get('/api/task/get/:type/', function (req, res, next) {
  var type = Number(req.params['type']);
  User.findOne({username: 'test'}, function(err, user) {
    if (err) return next(err);
    user.getAllTask(type, function(err, taskList) {
      if (err) return next(err);
      res.send(taskList);
    });
  })
});
router.post('/api/task/new', function(req, res, next) {
  var task = new Task(JSON.parse(req.body.task));
  task.save(function(err, task) {
    if (err) return next(err);
    User.findOne({username: 'test'}, function(err, user) {
      if (err) return next(err);
      user.addTask(task, function(err, user) {
        if (err) return next(err);
        res.send(task);
      });
    });
  });
});
router.post('/api/task/edit', function(req, res, next) {
  var task = JSON.parse(req.body.task);
  Task.findByIdAndUpdate(task._id, task, function(err, task) {
    if (err) return next(err);
    res.send(task);
  });
});
router.post('/api/task/complete', function(req, res, next) {
  var task = JSON.parse(req.body.task);
  User.findOne({username: 'test'}, function(err, user) {
    if (err) return next(err);
    user.completeTask(task, function(err, success) {
      if (err) return next(err);
      res.send(success);
    });
  });
});
router.post('/api/task/remove', function(req, res, next) {
  var task = JSON.parse(req.body.task);
  User.findOne({username: 'test'}, function(err, user) {
    if (err) return next(err);
    user.removeTask(task, function(err, user) {
      if (err) return next(err);
      res.send(task);
    });
  });
});

router.get('/api/desire/get', function(req, res, next) {
  User.findOne({username: 'test'}, function(err, user) {
    if (err) return next(err);
    res.json(user.desire);
  });
});
router.post('/api/desire/new', function(req, res, next) {
  var desire = JSON.parse(req.body.desire);
  User.findOne({username: 'test'}, function(err, user) {
    if (err) return next(err);
    user.addDesire(desire, function(err, user) {
      if (err) return next(err);
      res.send(desire);
    });
  });
});
router.post('/api/desire/edit', function(req, res, next) {
  var desire = JSON.parse(req.body.desire);
  User.findOne({username: 'test'}, function(err, user) {
    if (err) return next(err);
    user.editDesire(desire, function(err) {
      if (err) return next(err);
      res.send(desire);
    });
  });
});
router.post('/api/desire/enjoy', function(req, res, next) {
  var desire = JSON.parse(req.body.desire);
  User.findOne({username: 'test'}, function(err, user) {
    if (err) return next(err);
    user.enjoyDesire(desire, function(err) {
      if (err) return next(err);
      res.send(desire);
    });
  });
});
router.post('/api/desire/remove', function(req, res, next) {
  var desire = JSON.parse(req.body.desire);
  User.findOne({username: 'test'}, function(err, user) {
    if (err) return next(err);
    user.removeDesire(desire, function(err, user) {
      if (err) return next(err);
      res.send(desire);
    });
  });
});

router.get('/api/event/get', function(req, res, next) {
  User.findOne({username: 'test'}, function(err, user) {
    if (err) return next(err);
    res.json(user.event.slice(-10).reverse());
  });
});
router.post('/api/event/remove', function(req, res, next) {
  var event = JSON.parse(req.body.event);
  User.findOne({username: 'test'}, function(err, user) {
    if (err) return next(err);
    user.removeEvent(event, function(err, user) {
      if (err) return next(err);
      res.send(event);
    });
  });
});
module.exports = router;
