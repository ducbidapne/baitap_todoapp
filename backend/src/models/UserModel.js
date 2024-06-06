const mongoose = require('mongoose');
const Task = require('./TaskModel');

const UserSchema = new mongoose.Schema({
  assignee: String,
  task: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

module.exports = mongoose.model('User', UserSchema);
