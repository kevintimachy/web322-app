const fs = require('fs');
const { resolve } = require('path');

var employees = [];
var departments = [];
             
exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        fs.readFile('./data/employees.json', (err, data) => {
            if (err) {
                console.log("Failure to read file employees.json!");
                reject();
            }
            else {
                employees = JSON.parse(data);
                fs.readFile('./data/departments.json', (err, data) => {
                    if (err) {
                        console.log("Failure to read file departments.json!");
                        reject();
                    }
                    else {
                        resolve();
                        departments = JSON.parse(data);
                    }
                });
            }
        });
    });
}
 
exports.getAllEmployees = function () {
    return new Promise(function (resolve, reject) { 
        if (employees.length == 0) {
            reject({message: "No results returned"});
        }
        else if (employees.length > 0) {
            resolve(employees);
        }
    });
}

exports.getManagers = function(){
    return new Promise((resolve, reject) => {
        var managers = employees.filter(element => element.isManager == true);
        console.log(managers);
        if (managers.length == 0) {
            reject({ message: "No results returned" });
        }
        else if (managers.length > 0){
            resolve(managers);
        }
    });
}
 
exports.getDepartments = function() {
    return new Promise((resolve, reject) => {
        if (departments.length == 0) {
            reject({ message: "No results returned" });
        }
        else if (departments.length > 0){
            resolve(departments);
        }
    });
}

exports.addEmployee = function (employeeData) {
    return new Promise((resolve, reject) => {
        if (employeeData.isManager == undefined) {
            employeeData.isManager = false;
        }
        else {
            employeeData.isManager = true;
        }
        employeeData.employeeNum = employees.length + 1;
        employees.push(employeeData);
        if (JSON.stringify(employees[employees.length]) === employeeData)
            resolve();
        else
            reject("Did not add employee properly");
        
    });
}

exports.getEmployeesByStatus = function (status) {
    return new Promise((resolve, reject) => {
        if (employees.filter(emps => emps.status === status).length > 0) {
            resolve(employees.filter(emps => emps.status === status));
        }
        else
            reject("no results returned");
    });
}

exports.getEmployeesByDepartment = function (department) {
    return new Promise((resolve, reject) => {
        if (employees.filter(emps => emps.department === parseInt(department)).length > 0) {
            resolve(employees.filter(emps => emps.department == parseInt(department)));
        }
        else
            reject("no results returned");
    });
}

exports.getEmployeesByManager = function (manager) {
    return new Promise((resolve, reject) => {
        if (employees.filter(emps => emps.employeeManagerNum === parseInt(manager)).length > 0) {
            resolve(employees.filter(emps => emps.employeeManagerNum === parseInt(manager)));
        }
        else
            reject("no results returned");
    });
}

exports.getEmployeeByNum = function (num) {
    return new Promise((resolve, reject) => {
        if (employees.find(emps => emps.employeeNum === parseInt(num))) {
            resolve(employees.find(emps => emps.employeeNum === parseInt(num)));
        }
        else
            reject("no results returned");
    });
}

exports.updateEmployee = function (employeeData) {
    return new Promise((resolve, reject) => {
        var index = employees.findIndex(emp => emp.employeeNum == employeeData.employeeNum);
        employees[index].firstName = employeeData.firstName;
        employees[index].lastName = employeeData.lastName;
        employees[index].email = employeeData.email;
        employees[index].SSN = employeeData.SSN;
        employees[index].addressStreet = employeeData.addressStreet;
        employees[index].addressCity = employeeData.addressCity;
        employees[index].addressState = employeeData.addressState;
        employees[index].addressPostal = employeeData.addressPostal;
        employees[index].addressCity = employeeData.addressCity;
        if (employeeData.isManager == undefined) {
            employees[index].isManager = false;
        }
        else {
            employees[index].isManager = true;
        }
        if (isNaN(parseInt(employeeData.employeeManagerNum))) {
            employees[index].employeeManagerNum = null;
        }
        else {
            employees[index].employeeManagerNum = parseInt(employeeData.employeeManagerNum);
        }
        employees[index].status = employeeData.status;
        employees[index].department = parseInt(employeeData.department);
        employees[index].hireDate = employeeData.hireDate;
        resolve();
    });
}
