const bcrypt = require('bcryptjs');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var uri = "mongodb+srv://ktimachy:NJDuRTyq2BM3tTN@senecaweb.qyruqul.mongodb.net/web322app?retryWrites=true&w=majority";

var userSchema = new Schema({
    "userName": {
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]

});

let User;

exports.initialize = function () {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function (error) {
            if (error) {
                reject("unable to connect");
            } else {
                User = db.model("users", userSchema);
                resolve();
            }
        });
    });
};

exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.password === "" || userData.password2 === "") {
            reject("Error: user name cannot be empty or only white spaces!");
        }
        if (userData.password != userData.password2) {
            reject("Error: Passwords do not match");
        } else {
            bcrypt.hash(userData.password, 10)
                .then(hash => {
                    userData.password = hash;
                    let newUser = new User(userData);
                    newUser.save()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            if (err.code == 11000)
                                reject("User Name already taken");
                            else
                                reject("There was an error creating the user: " + err)

                        });
                })
                .catch(err => reject("There was an error encrypting the password"));

        }
    });
};

exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.findOne({
                userName: userData.userName
            })
            .exec()
            .then((foundUser) => {
                if (foundUser == null)
                    reject("Unable to find user: " + userData.userName);

                bcrypt.compare(userData.password, foundUser.password)
                    .then((res) => {
                        if (!res) {
                            reject("Incorrect Password for user: " + userData.userName);
                        } else if (res){
                            foundUser.loginHistory.push({
                                dateTime: (new Date()).toString(),
                                userAgent: userData.userAgent
                            });
                            User.updateOne({
                                    userName: userData.userName
                                }, {
                                    $set: {
                                        loginHistory: foundUser.loginHistory
                                    }
                                }).exec()
                                .then(() => resolve(foundUser))
                                .catch((err) => reject("There was an error verifying the user: " + err));
                        }
                    });
            })
            .catch((err) => {
                reject("Unable to find user: " + userData.userName);
            });

    });
};