// http://localhost:8080/
/*************************************************************************
* WEB322– Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Kevin Timachy Student ID: 145075180 Date: 06/10/22
*
* Your app’s URL (from Cyclic) : https://lime-thankful-wildebeest.cyclic.app 
*
*************************************************************************/ 

var express = require("express");
var path = require("path");
var app = express();
var data_server = require("./data-server.js");
var multer = require("multer");
const fs = require('fs');
const { INSPECT_MAX_BYTES } = require("buffer");



var HTTP_PORT = process.env.PORT || 8080

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "./views/home.html"));
});

app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "./views/about.html"));
});

app.get("/employees", function (req, res) {
    if (req.query.status) {
        data_server.getEmployeesByStatus(req.query.status).then(result => res.json(result)).catch(err => res.json(err));
    }
    else if (req.query.department) {
        data_server.getEmployeesByDepartment(req.query.department).then(result => res.json(result)).catch(err => res.json(err));
    }
    else if (req.query.manager) {
        data_server.getEmployeesByManager(req.query.manager).then(result => res.json(result)).catch(err => res.json(err));
    }
    else {
        data_server.getAllEmployees().then(result => res.json(result)).catch(error => res.json(error));
    }
});

app.get("/employee/:value", (req, res) =>{
    data_server.getEmployeeByNum(req.params.value).then(result => res.json(result)).catch(error => res.json(error));
});

app.get("/managers", function (req, res) {
    data_server.getManagers().then(result => res.json(result)).catch(error => res.json(error));
});

app.get("/departments", function (req, res) {
    data_server.getDepartments().then(result => res.json(result)).catch(error => res.json(error));
});

app.get("/employees/add", (req, res) => {
    res.sendFile(path.join(__dirname, "views/addEmployee.html"));
});

app.post("/employees/add", (req, res) =>
{
    data_server.addEmployee(req.body).then(res.redirect("/employees")).catch(err => { res.json(err); })
});

app.get("/images/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addImage.html"));
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.get("/images", (req, res) => {
 
    fs.readdir("./public/images/uploaded", (err, items) => {
        

        res.json({ images: items });
        
    });
   
});


app.use(function (req, res) {
    res.status(404).sendFile(path.join(__dirname,"./views/404.html"));
});


function onHttpStart()
{
    console.log("Express http server listening on: " + HTTP_PORT);
}

data_server.initialize().then(() => { app.listen(HTTP_PORT, onHttpStart); }).catch(() => { console.log("Data not initialized cannot start app"); });

