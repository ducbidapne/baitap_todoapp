const { id } = require("schema/lib/objecttools");
const Task = require("../models/TaskModel");
const User = require('../models/UserModel');


exports.getAllTasks = async (req,res)=>{
  console.log("Method GET: /");
    try {
        const users = await User.find().populate('task'); 
        if (!users.length) {
          return res.status(404).json({ message: 'No users found' });
        }
    
        const formattedUsers = users.map((user) => {
          return {
            userId: user._id,
            assignee: user.assignee,
            tasks: user.task,
          };
        });

    
        res.status(200).json({ users: formattedUsers });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
}
exports.getTaskById = async(req,res)=>{
    // try {
    //     const task = await Task.findById(req.params.id);
    //     if (task == null) {
    //         return res.status(404).json({ message: "Not found" });
    //     }
    //     res.json(task);
    // } catch (err) {
    //     return res.status(500).json({ message: err.message });
    // }
}
exports.addTask = async(req,res)=>{
  console.log("Method POST: /add-task");
     const task = new Task({
        title: req.body.title,
        content: req.body.content,
        // assignee: req.body.assignee,
        status: req.body.status,
        create_at:req.body.create_at
    });
    console.log("Create at:"+req.body.create_at);
    try {
    var assignee =req.body.assignee;
    const savedTask = await task.save();

    let user = await User.findOne({ assignee });
    if (!user) {
      user = new User({ assignee, task: [savedTask._id] });
    } else {
      user.task.push(savedTask._id);
    }
    
    await user.save();

    res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

}
exports.deleteTaskById = async (req,res)=>{
  console.log("Method DELETE:/delete");
    try {
        const taskId = req.query.taskId; 
        const userId = req.query.userId; 
    
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
  console.log("Method PUT: /update-task/");
  try {
    const taskId = req.params.taskId;
    const taskToUpdate = req.body;
    var assignee = req.body.assignee;

    const user = await User.findOne({ task: taskId }).populate('task');
    // const newUser = await User.findOne({assignee:assignee}).populate('task'); 
    var user_id = user._id;
    var assignee = req.body.assignee;
    if(user.assignee == assignee){
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        taskToUpdate,
        { new: true }
      );
  
      if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      res.status(200).json({ task: updatedTask });
    } else{
      const deletedTask = await Task.findByIdAndDelete(taskId);
      await User.findByIdAndUpdate(user_id, {
        $pull: { task: taskId }, 
      });

      const task = new Task({
        title: req.body.title,
        content: req.body.content,
        // assignee: req.body.assignee,
        status: req.body.status
        });

        var assignee =req.body.assignee;
        const savedTask = await task.save();

        var userUpdate = await User.findOne({ assignee });
        if (!userUpdate) {
          userUpdate = new User({ assignee, task: [savedTask._id] });
        } else {
          userUpdate.task.push(savedTask._id);
        }
        
        await userUpdate.save();

        res.status(201).json(user);
      
    }
  
 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
exports.getUserByTask = async(req,res)=>{
  try {
    const { taskId } = req.params;
    

    const user = await User.findOne({ task: taskId }).populate('task');
    if (!user) {
    return res.status(404).json({ message: 'Task not found' });
  }

  //   res.json({ assignee: user.assignee });
  const task = user.task.find(t => t._id.toString() === taskId);
  if (!task) {
  return res.status(404).json({ message: 'Task not found' });
  }

  res.json({
  assignee: user.assignee,
  task: {
      title: task.title,
      content: task.content,
      status: task.status,
      create_at: task.create_at
  }
  });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}


exports.getTasks = async (req, res) => {
    // let perPage = 4;
    // let page = req.query.page || 1;  
    // const skip = (page - 1) * perPage;
    // // try {
    //     const tasks = await Task.find().skip(skip).limit(perPage);
    //     const total = await Task.countDocuments();
    //     res.send(tasks);
    //     // res.json({
    //     //     tasks: tasks,
    //     //     totalPages: Math.ceil(total / perPage),
    //     //     currentPage: page
    //     // });
    // } catch (err) {
    //     console.log(err);
    //     res.status(500).json({ message: err.message });
    // }
};

