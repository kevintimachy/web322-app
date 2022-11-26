// http://localhost:8080/
/*************************************************************************
* WEB322– Assignment 4
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Kevin Timachy Student ID: 145075180 Date: 11/11/22
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
        data_server.getEmployeesByStatus(req.query.status)
            .then( (data) => { 
                if (data.length > 0)
                    res.render("employees", { employees: data });
                else
                    res.render("employees",{ message: "no results" });
            })
            .catch(() => res.render({ message: "no results" }));
    }
    else if (req.query.department) {
        data_server.getEmployeesByDepartment(req.query.department)
            .then((data) => { 
                
                if (data.length > 0)
                {
                   
                    res.render("employees", { employees: data });
                }
                else
                    res.render("employees",{ message: "no results" });
        })
            .catch(() => {
                res.render("employees", { message: "no results" });
            });
    }
    else if (req.query.manager) {
        data_server.getEmployeesByManager(req.query.manager)
            .then( (data) => { 
                if (data.length > 0)
                    res.render("employees", { employees: data });
                else
                res.render("employees",{ message: "no results" });
            })
            .catch(err => res.render({ message: "no results" }));
    }
    else {
        data_server.getAllEmployees()
            .then((data) => { 
                if (data.length > 0)
                    res.render("employees", { employees: data });
                else
                res.render("employees",{ message: "no results" });
            })
            .catch(() => res.render("employees", { message: "no results" }));
    }
});

app.get("/employee/:empNum", (req, res) =>{
    // initialize an empty object to store the values
    let viewData = {};

    data_server.getEmployeeByNum(req.params.empNum)
        .then((data) => {
            if (data) {
                viewData.employee = data; //store employee data in the "viewData" object as "employee"
            } else {
                viewData.employee = null; // set employee to null if none were returned
    }})
        .catch(() => {
            viewData.employee = null; // set employee to null if there was an error
        })
        .then(data_server.getDepartments)
        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as "departments"
            // loop through viewData.departments and once we have found the departmentId that matches
             // the employee's "department" value, add a "selected" property to the matching
             // viewData.departments object 
            for (let i = 0; i < viewData.departments.length; i++) {
             if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
    }
            }
        })
        .catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        })
        .then(() => {
            if (viewData.employee == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData }); // render the "employee" view
    }
    });
});


app.post("/employee/update", (req, res) => {
    data_server.updateEmployee(req.body)
        .then(res.redirect("/employees"))
        .catch((err)=>{
            res.status(500).send("Unable to Update Employee");
           });
});
    

app.get("/managers", function (req, res) {
    data_server.getManagers().then(result => res.json(result)).catch(error => res.json(error));
});

app.get("/departments", function (req, res) {
    data_server.getDepartments()
        .then((data) => {
            if (data.length > 0)
                res.render("departments", { departments: data });
            else
                res.render("departments", { message: "no results" });
        })
        .catch(() => res.render("departments", { message: "no results" }));
});

app.get("/employees/add", (req, res) => {
    data_server.getDepartments()
        .then((data) => res.render("addEmployee", { departments: data }))
        .catch(() => res.render("addEmployee", {departments: []})) ;
});

app.post("/employees/add", (req, res) =>
{
    data_server.addEmployee(req.body)
        .then(res.redirect("/employees"))
        .catch((err)=>{
            res.status(500).send("Unable to Add Employee");
           });
});

app.get("/employees/delete/:empNum", (req, res) => {
    data_server.deleteEmployeeByNum(req.params.empNum)
        .then(() => res.redirect("/employees"))
        .catch(() => res.status(500).send( "Unable to Remove Employee / Employee not found"));
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

app.get("/departments/add", (req, res) => {
    res.render("addDepartment");
});

app.post("/departments/add", (req, res) => {
    data_server.addDepartment(req.body)
        .then(res.redirect("/departments"))
        .catch((err)=>{
            res.status(500).send("Unable to Add Department");
           });
});

app.post("/department/update", (req, res) => {
    data_server.updateDepartment(req.body)
        .then(res.redirect("/departments"))
        .catch((err)=>{
            res.status(500).send("Unable to Update Department");
           });
});

app.get("/department/:departmentId", (req, res) => {
    data_server.getDepartmentById(req.params.departmentId)
        .then(data => { 
            if (data != undefined)
                res.render("department", { department: data });
            else
                res.status(404).send("Department Not Found");
        })
        .catch(err => res.status(404).send("Department Not Found"));
});

app.use(function (req, res) {
    res.status(404).render("404");
});


function onHttpStart()
{
    console.log("Express http server listening on: " + HTTP_PORT);
}

data_server.initialize().then(() => { app.listen(HTTP_PORT, onHttpStart); }).catch(() => { console.log("Data not initialized cannot start app"); });

