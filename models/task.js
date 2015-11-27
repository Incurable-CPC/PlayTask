/**
 * Created by Cai on 11/18/2015.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var test = require('assert');

const DAILY = 0;
const WEEKLY = 1;
const NORMAL = 2;

function isSameDay(t1, t2) {
  return (t1.getDate() == t2.getDate())&&
    (t1.getMonth() == t2.getMonth())&&(t1.getFullYear() == t2.getFullYear());
}
function getMonday(time) {
  var diff = time.getDate()- time.getDay();
  return new Date(time.setDate(diff));
}
function isToday(time) { return isSameDay(time, new Date()); }
function isThisWeek(time) { return isSameDay(getMonday(time), getMonday(new Date())); }

var taskSchema = new Schema({
  description: String,
  points: Number,
  amount: Number,
  type: Number,
  done: [Date]
});
taskSchema.virtual('nowDone').get(function() {
  test.ok(this.type in [DAILY, WEEKLY, NORMAL]);
  var check = (this.type == DAILY)? isToday:
    (this.type == WEEKLY)? isThisWeek: function() {return true;};
  return this.done.filter(check).length;
});

taskSchema.methods.work = function work(callback) {
  var task = this;
  test.ok(task.nowDone < task.amount);
  task.done.push(Date.now());
  task.save(function(err, task) {
    if (err&&callback) return callback(err);
    if (callback) callback(null, task);
  });
};

taskSchema.set('toJSON', {virtuals: true});
taskSchema.set('toObject', {virtuals: true});
var Task = mongoose.model('Task', taskSchema);

