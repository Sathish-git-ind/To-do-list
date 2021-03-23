//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://sathish:sathish123@cluster0.nexst.mongodb.net/taskDB?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true});

const taskSchema = mongoose.Schema({
  task:{
    type: String,
    required: [true, "Title is mandatory field. Please try again including title."]
  },
  taskType:{
    type: Number,
    min: 0,
    max: 1
  }
});

const Task = mongoose.model("Task", taskSchema);

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

//For heroku ---|    For local ---|
const port = process.env.PORT || 3000;

app.listen(port, function(){
  console.log("Server is up and running in port " + port);
});

app.get("/", function(req,res){
  let day = date.getCurrentDate();
  const tasks = Task.find({taskType:0},function(err, tasks){
    if(err){
      console.log(err);
    }else{
      res.render("print_week_day",{day: day,tasks: tasks});
    }
  });
});

app.post("/", function(req,res){
  let list = req.body.list;
  let task = req.body.task;
  if(list === "Work"){
    new Task({
      task: task,
      taskType: 1
    }).save();
    res.redirect("/work");
  }else{
    new Task({
      task: task,
      taskType: 0
    }).save();
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  Task.find({taskType:1},function(err, workTasks){
    if(err){
      console.log(err);
    }else{
      res.render("print_week_day",{day: "Work List",tasks: workTasks});
    }
  });
});

app.post("/delete", function(req,res){
  const taskId = req.body.checkbox;
  const taskType = req.body.type;
  Task.findByIdAndRemove(taskId, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Successfully deleted "+taskId);
    }
  });

  if(taskType == 1){
    res.redirect("/work");
  }else{
    res.redirect("/");
  }


});
