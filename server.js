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
* 
* Your app’s URL (from Heroku) : https://warm-stream-11031.herokuapp.com/
*************************************************************************/ 

var express = require("express");
var path = require("path");
var app = express();
var data_server = require("./data-server.js");
var multer = require("multer");
const fs = require('fs');
const { INSPECT_MAX_BYTES } = require("buffer");
const exphbs = require("express-handlebars");

var HTTP_PORT = process.env.PORT || 8080

app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            }
            else {
                return options.fn(this);
            }
           } 
    }
}));
app.set("view engine", ".hbs");
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

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
   });

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/about", function (req, res) {
    res.render("about")
});

app.get("/employees", function (req, res) {
    if (req.query.status) {
        data_server.getEmployeesByStatus(req.query.status).then(result => res.render("employees", {employees: result})).catch(err => res.render({message: "no results"}));
    }
    else if (req.query.department) {
        data_server.getEmployeesByDepartment(req.query.department).then(result => res.render("employees", {employees: result})).catch(err => res.render({message: "no results"}));
    }
    else if (req.query.manager) {
        data_server.getEmployeesByManager(req.query.manager).then(result => res.render("employees", {employees: result})).catch(err => res.render({message: "no results"}));
    }
    else {
        data_server.getAllEmployees().then(result => res.render("employees", {employees: result})).catch(error => res.render({message: "no results"}));
    }
});

app.get("/employee/:empNum", (req, res) =>{
    data_server.getEmployeeByNum(req.params.empNum).then(result => res.render("employee", {employee: result})).catch(error => res.render("employee", {message: "no results"}));
});

app.post("/employee/update", (req, res) => {
    data_server.updateEmployee(req.body).then(res.redirect("/employees"))
});
    

app.get("/managers", function (req, res) {
    data_server.getManagers().then(result => res.json(result)).catch(error => res.json(error));
});

app.get("/departments", function (req, res) {
    data_server.getDepartments().then(result => res.render("departments", {departments: result})).catch(error => res.json(error));
});

app.get("/employees/add", (req, res) => {
    res.render("addEmployee");
});

app.post("/employees/add", (req, res) =>
{
    data_server.addEmployee(req.body).then(res.redirect("/employees")).catch(err => { res.json(err); })
});

app.get("/images/add", (req, res) => {
    res.render("addImage");
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.get("/images", (req, res) => {
    fs.readdir("./public/images/uploaded", (err, items) => {
        res.render("images", {images: items});
    });
});


app.use(function (req, res) {
    res.status(404).render("404");
});


function onHttpStart()
{
    console.log("Express http server listening on: " + HTTP_PORT);
}

data_server.initialize().then(() => { app.listen(HTTP_PORT, onHttpStart); }).catch(() => { console.log("Data not initialized cannot start app"); });

