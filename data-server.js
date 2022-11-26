const Sequelize = require('sequelize');

var sequelize = new Sequelize('kywvqaem', 'kywvqaem', 'sDw5Y0OPcqfhfmJORWDNs5yEaVOnZ21l', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: true
   },
   query:{raw: true}
}); 
   

sequelize
    .authenticate()
    .then(() => console.log('Connection success.'))
    .catch((err) => console.log("Unable to connect to DB.", err));

var Employee = sequelize.define("Employee", {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    martialStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
});

var Department = sequelize.define("Department", {
    departmentId :{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName : Sequelize.STRING
});

             
exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize
            .sync()
            .then(() => resolve())
            .catch(() => reject("unable to sync the database"))
    });
}
 
exports.getAllEmployees = function () {
    return new Promise(function (resolve, reject) { 
        Employee.findAll({
            order: [
                ['employeeNum', 'ASC']
            ]
        })
            .then((data) => {
                resolve(data);
            })
            .catch(() => reject("no results returned"));
    });
}

exports.getManagers = function(){
    return new Promise((resolve, reject) => {
        reject();
    });
}
 
exports.getDepartments = function() {
    return new Promise((resolve, reject) => {
        Department.findAll({
            order: [
                ['departmentId', 'ASC']
            ]
        })
            .then((data) => { resolve(data); })
            .catch(() => reject("no results returned"));
    });
}

exports.addEmployee = function (employeeData) {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (const property in employeeData) {
            if (employeeData[property] === '') 
            employeeData[property]= null; 
        }
        console.log(employeeData);
        Employee.create(employeeData)
            .then(() => resolve())
            .catch(() => reject("unable to create employee"));
        
    });
}

exports.getEmployeesByStatus = function (status) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {
                status: status
            },
            order: [
                ['employeeNum', 'ASC']
            ]
        })
            .then((data) => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

exports.getEmployeesByDepartment = function (department) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {
                department: parseInt(department)
            },
            order: [
                ['employeeNum', 'ASC']
            ]
        })
            .then((data) => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

exports.getEmployeesByManager = function (manager) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {
                employeeManagerNum: parseInt(manager)
            },
            order: [
                ['employeeNum', 'ASC']
            ]
        })
            .then((data) => resolve(data))
            .catch(() => reject("no results returned"));
    });
}

exports.getEmployeeByNum = function (num) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {
                employeeNum: parseInt(num)
            }
        })
            .then((data) => {
                resolve(data[0]);
            })
            .catch(() => reject("no results returned"));
    });
}

exports.updateEmployee = function (employeeData) {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (const property in employeeData) {
            if (employeeData[property] === '') 
                employeeData[property]= null; 
        }

        Employee.update(employeeData, {
            where: {
                employeeNum: employeeData.employeeNum
            }
        })
            .then((data) => resolve(data))
            .catch(() => reject("unable to update employee"));
    });
}

exports.addDepartment = function (departmentData) {
    return new Promise((resolve, reject) => {
        if (departmentData.departmentName == "") 
            departmentData.departmentName = null; 
        
        Department.create(departmentData)
            .then(() => resolve())
            .catch(() => reject("unable to create department"));
    });
}

exports.updateDepartment = function (departmentData) {
    return new Promise((resolve, reject) => {
            if (departmentData.departmentName === '') 
                departmentData.departmentName = null; 
       
        Department.update({
            departmentName: departmentData.departmentName
        }, {
            where: {
                departmentId: parseInt(departmentData.departmentId)
            }
        })
            .then(() => resolve())
            .catch(() => reject("unable to create department"));
    });
}

exports.getDepartmentById = function (id) {
    return new Promise((resolve, reject) => {
        Department.findAll({
            where: {
                departmentId: id
            }
        })
            .then((data) => resolve(data[0]))
            .catch(() => reject("no results returned"));
    });
}

exports.deleteEmployeeByNum = function (empNum){
    return new Promise((resolve, reject) => {
        Employee.destroy({
            where: {
                employeeNum: empNum
            }
        })
            .then(() => resolve())
            .catch(() => reject());
    });
}