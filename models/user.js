/**
 * Created by Cai on 11/18/2015.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {type: String, index: {unique: true}},
  nickname: String,
  image: {type: String, default: 'default.png'},
  password: String,
  task: [Schema.Types.ObjectId],
  desire: [{
    description: String,
    points: Number,
    lastDate: Date
  }],
  event: [{
    description: String,
    points: Number,
    date: Date
  }]
});
userSchema.virtual('achievement').get(function() {
  var points = this.event.map((evt)=>evt.points);
  return (points.length)? points.reduce((a, b)=>a+b): 0;
});
userSchema.pre('save', function(next) {
  if (!this.nickname) {
    this.nickname = this.username;
  }
  next();
});

userSchema.methods.addTask = function addTask(task, callback) {
  this.task.push(task._id);
  this.save(callback);
};
userSchema.methods.getAllTask = function getAllTask(type, callback) {
  var Task = mongoose.model('Task');
  Task.find({_id: {$in: this.task}, type: type}, callback);
};
userSchema.methods.removeTask = function remove(task, callback) {
  this.task.remove(task._id);
  this.save(callback);
};
userSchema.methods.completeTask = function completeTask(task, callback) {
  var user = this;
  var Task = mongoose.model('Task');
  task = new Task(task);
  Task.findById(task._id, function(err, task) {
    if (err) callback(err);
    if (task.nowDone < task.amount) {
      task.work();
      user.event.push({
        description: task.description,
        points: task.points,
        date: Date.now()
      });
      user.save(function(err, user) {
        if (callback) return callback(err, true, user);
      });
    } else if (callback) return callback(err, false);
  });
};

userSchema.methods.addDesire = function addDesire(desire, callback) {
  desire.points = parseInt(desire.points);
  this.desire.push(desire);
  this.save(callback);
};
userSchema.methods.removeDesire = function removeDesire(desire, callback) {
  this.desire.remove(desire._id);
  this.save(callback);
};
userSchema.methods.editDesire = function editDesire(desire, callback) {
  desire.points = parseInt(desire.points);
  User.update({'desire._id': desire._id}, {$set: {
    'desire.$': desire
  }}, callback);
};
userSchema.methods.enjoyDesire = function enjoy(desire, callback) {
  this.event.push({
    description: desire.description,
    points: -desire.points,
    date: new Date()
  });
  this.save(function(err, user) {
    if (err) return callback(err);
    desire.lastDate = new Date();
    user.editDesire(desire, callback);
  });
};

userSchema.methods.removeEvent = function removeEvent(event, callback) {
  this.event.remove(event._id);
  this.save(callback);
};

userSchema.set('toJSON', {virtuals: true});
userSchema.set('toObject', {virtuals: true});
var User = mongoose.model('User', userSchema);
