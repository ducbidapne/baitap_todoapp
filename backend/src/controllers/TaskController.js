const Task = require("../models/TaskModel");
const User = require('../models/UserModel');

exports.findTaskByTitle = async (req,res)=>{
  try {
    var title = req.query.title;
    const tasks = await Task.find({title:title})
      .sort({ create_at: -1 })
      .populate('userId');  
    const result = tasks.map(task => {
      if (task.userId) {
        return {
          userId: task.userId._id,
          assignee: task.userId.assignee,
          taskId: task._id,
          title: task.title,
          content: task.content,
          status: task.status,
          create_at: task.create_at,
        };
      }});
    return res.status(200).json({result});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' }); 
  }
}
exports.findTaskByAssignee = async(req,res)=>{
  try {
    var userId =req.query.userId;
    if(!userId){
      return res.status(404).json({message:"Invalid id"});
    }    
    const tasks = await Task.find({userId:userId})
      .sort({ create_at: -1 })
      .populate('userId');  

    const result = tasks.map(task => {
      if (task.userId) {
        return {
          userId: task.userId._id,
          assignee: task.userId.assignee,
          taskId: task._id,
          title: task.title,
          content: task.content,
          status: task.status,
          create_at: task.create_at,
        };
      }});
    return res.status(200).json({result});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' }); 
  }
}

exports.getAllTasks = async (req,res)=>{
  console.log("Method GET: /");
  try {
    const users = await User.find().populate('task');
    var result = [];
    users.forEach(user => {
      user.task.forEach(task => {
        result.push({
          userId: user._id,
          assignee: user.assignee,
          taskId: task._id,
          title: task.title,
          content: task.content,
          status: task.status,
          create_at: task.create_at
        });
      });
    });
    result = result.sort((a, b) => new Date(b.create_at) - new Date(a.create_at));
    res.status(200).json({result});
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

exports.addTask = async(req,res)=>{
  console.log("Method POST: /add-task");
  
  try {
  
    const { title, content, status, create_at, userId} = req.body;
    const task = new Task({
      title,
      content,
      status,
      create_at: create_at || Date.now(), 
      userId
    });

    const savedTask = await task.save();

    let user = await User.findById(userId);
    if (!user) {
      user = new User({ _id: userId, task: [savedTask._id] });
    } else {
      user.task.push(savedTask._id);
    }
    
    await user.save();

    res.status(201).json({ message: 'Task created successfully', task: savedTask });
  } catch (err) {
    console.error('Error adding task:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
exports.deleteTaskById = async (req,res)=>{
  console.log("Method DELETE:/delete");
    try {
        const taskId = req.query.taskId; 
        const userId = req.query.userId; 
        const task = await Task.findById(taskId);
        if (!task) {
          return res.status(404).json({ message: `Task with ID ${taskId} not found` });
        }

    
        const deletedTask = await Task.findByIdAndDelete(taskId);
    
        if (!deletedTask) {
          return res.status(404).json({ message: 'Task not found' });
        }
        await User.findByIdAndUpdate(userId, {
          $pull: { task: taskId }, 
        });
    
        res.status(200).json({ message: 'Task deleted and user updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
}

exports.updateTaskById = async (req,res)=>{
  console.log("Method PUT: /update-task");
  try {
    const taskId = req.query.taskId;
    const { title, content, status, userId } = req.body;
    const taskToUpdate = await Task.findById(taskId).populate('userId');
    if (!taskToUpdate) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (taskToUpdate.userId !== userId) {
      await User.findByIdAndUpdate(taskToUpdate.userId, {
        $pull: { task: taskId }
      });

      let newUser = await User.findById(userId);
      if (!newUser) {
        newUser = new User({ _id: userId, task: [taskId] });
      } else {
        newUser.task.push(taskId);
      }
      await newUser.save();
      taskToUpdate.title = title;
      taskToUpdate.content = content;
      taskToUpdate.status = status;
      taskToUpdate.userId = newUser._id;

      const updatedTask = await taskToUpdate.save();

      return res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } else {
      taskToUpdate.title = title;
      taskToUpdate.content = content;
      taskToUpdate.status = status;

      const updatedTask = await taskToUpdate.save();
      return res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

exports.getAllUser = async(req,res)=>{
  try { 
    const user = await User.find();
    if (!user) {
    return res.status(404).json({ message: 'Server error' });
  }

  res.json({user:user});
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}
exports.getPaginationTasks = async (req, res) => {
  console.log("Method GET: /tasks");
  try {
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    let query = Task.find();
    // console.log(page,limit,search);
    if (search) {
      query = query.find({ $or: [{ title: { $regex: search, $options: 'i' } },
                        { content: { $regex: search, $options: 'i' } }] });
    }
    const totalTasks = await Task.countDocuments(query);
    const totalPages = Math.ceil(totalTasks / limit);

    const tasks = await query.find()
      .sort({ create_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId');  

    const result = tasks.map(task => {
      if (task.userId) {
        return {
          userId: task.userId._id,
          assignee: task.userId.assignee,
          taskId: task._id,
          title: task.title,
          content: task.content,
          status: task.status,
          create_at: task.create_at,
        };
      }});
    return res.status(200).json({
      result,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}




