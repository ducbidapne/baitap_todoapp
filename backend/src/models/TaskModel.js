const mongoose = require("mongoose");
const schema = mongoose.Schema;

const taskSchema = new schema({
    title:String,
    content:String,
    status:String,
    create_at: { type: Date }
});

module.exports=mongoose.model("Task",taskSchema);
