"use strict"

const db = require('../config/db');
const uuid = require('uuid')

class SurveyStorage {
    constructor(body){
        this.body = body;
    }

    static enroll(nftInfo){
        return new Promise((resolve, reject) => {
            const query = "INSERT INTO nft(surveyId, tokenName, tokenDescription, tokenAddress, price) VALUES(?,?,?,?,?)";
            db.query(query,
                [nftInfo.surveyId, nftInfo.tokenName, nftInfo.description, nftInfo.nftAddr, nftInfo.price],
                (err) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else{
                        resolve({success : true});
                    }
                });
        });
    }

    static getNFTList() {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM nft ORDER BY enrollDate desc;";
            db.query(query,
                (err, data) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve(data);
                    }
                });
        });
    }

    static getNFTInfo(id) {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM nft WHERE surveyId = '" + id + "'";
            db.query(query,
                (err, data) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve(data[0]);
                    }
                });
        });
    }
}

module.exports = SurveyStorage;
