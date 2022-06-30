"use strict"

const db = require('../config/db');

class UserStorage {
    constructor(body){
        this.body = body;
    }

    static getUserLoginInfo(email){
        return new Promise((resolve, reject) => {
            const query = "SELECT userEmail, userPassword, userWalletAddress, userATA FROM user WHERE userEmail = ?;";
            db.query(query,
                [email],
                (err, data) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve(data[0]);
                    }
                });
        });
    }

    static getUserInfo(email){
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM user WHERE userEmail = ?;";
            db.query(query,
                [email],
                (err, data) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve(data[0]);
                    }
                });
        });
    }

    static save(userInfo){
        return new Promise((resolve, reject) => {
            const query = "INSERT INTO user(userEmail, userPassword, userGender, userAge, userWalletAddress) VALUES(?,?,?,?,?)";
            db.query(query,
                [userInfo.email, userInfo.password, userInfo.gender, userInfo.age, userInfo.walletAddress],
                (err) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else{
                        resolve({success : true});
                    }
                });
        });
    }

    static changeWalletAddress(userInfo){
        return new Promise((resolve, reject) => {
            const query = "UPDATE user SET userWalletAddress = "+ "'" +userInfo.walletAddress + "'"+", walletChangedDate = CURRENT_TIMESTAMP WHERE userEmail = " + "'"+ userInfo.email+"'";
            db.query(query,
                (err) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve({success : true});
                    }
                });
        });
    }

    static changeATA(pk, email){
        return new Promise((resolve, reject) => {
            const query = "UPDATE user SET userATA = "+ "'" + pk +"' WHERE userEmail = " + "'"+email+"'";
            db.query(query,
                (err) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve({success : true});
                    }
                });
        });
    }
}

module.exports = UserStorage;
