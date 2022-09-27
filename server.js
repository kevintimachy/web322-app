// http://localhost:8080/

var express = require("express");
var path = require("path");
var app = express();
var data_server = require("./data-server.js");


var HTTP_PORT = process.env.PORT || 8080

app.use(express.static('public'));

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

app.use(function (req, res, next) {
    res.status(404).send("Page Not Found");
});

function onHttpStart()
{
    console.log("Express http server listening on: " + HTTP_PORT);
}

data_server.initialize().then(() => { app.listen(HTTP_PORT, onHttpStart); }).catch(() => { console.log("Data not initialized cannot start app"); });

//app.listen(HTTP_PORT, onHttpStart);