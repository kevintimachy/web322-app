const fs = require('fs');

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

