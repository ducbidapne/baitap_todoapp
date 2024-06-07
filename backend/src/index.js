require('dotenv').config();
var express = require("express");
var cors = require("cors");
var app = express();
var http = require("http").createServer(app);
const { MongoClient } = require('mongodb');
var ObjectId = require("mongodb").ObjectId;
var bodyParser = require("body-parser");
const mongoose = require('mongoose');

const routes = require("./routes/route");

var mainURL = process.env.MAIN_URL+process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/",routes);


const mongoDBURL = process.env.MONGODB_URL;
 
mongoose.connect(mongoDBURL)
    .then(() => { console.log("Connection Successfull") })
    .catch((err) => { console.log("Received an Error") })


http.listen(3000, function () {
	console.log("Server started at "+mainURL);
	
}); 
