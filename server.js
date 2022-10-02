// http://localhost:8080/
/*************************************************************************
* WEB322– Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Kevin Timachy Student ID: 145075180 Date: 02/10/22
*
* Your app’s URL (from Cyclic) :
*
*************************************************************************/ 

var express = require("express");
var path = require("path");
var app = express();
var data_server = require("./data-server.js");


var HTTP_PORT = process.env.PORT || 8080

app.use(express.static("public"));


app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "./views/home.html"));
});

app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "./views/about.html"));
});

app.get("/employees", function (req, res) {
    data_server.getAllEmployees().then(result => res.json(result)).catch(error => res.json(error));
});

app.get("/managers", function (req, res) {
    data_server.getManagers().then(result => res.json(result)).catch(error => res.json(error));
});

app.get("/departments", function (req, res) {
    data_server.getDepartments().then(result => res.json(result)).catch(error => res.json(error));
});

app.use(function (req, res) {
    res.status(404).sendFile(path.join(__dirname,"./views/404.html"));
});


function onHttpStart()
{
    console.log("Express http server listening on: " + HTTP_PORT);
}

data_server.initialize().then(() => { app.listen(HTTP_PORT, onHttpStart); }).catch(() => { console.log("Data not initialized cannot start app"); });

//app.listen(HTTP_PORT, onHttpStart);