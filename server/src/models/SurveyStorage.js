"use strict"

const db = require('../config/db');
const uuid = require('uuid')

class SurveyStorage {
    constructor(body){
        this.body = body;
    }

    static enroll(surveyInfo){
        return new Promise((resolve, reject) => {
            //survey에 새 설문 쿼리
            let surveyId = uuid.v4();

            let query = "INSERT INTO survey(surveyId, surveyTitle, publisher, publisherATA, maxAnswerer, addInfo, escrowAddress, reward, incentive, questionCnt) VALUES( ";
            query += "'"+surveyId+"', ";
            query += "'"+surveyInfo.surveyTitle+"', ";
            query += "'"+surveyInfo.signer+"', ";
            query += "'"+surveyInfo.publisherATA+"', ";
            query += "'"+surveyInfo.maxAnswerer+"', ";
            query += "'"+surveyInfo.addInfo+"', ";
            query += "'"+surveyInfo.escrowAddress+"', ";
            query += "'"+surveyInfo.reward+"', ";
            query += "'"+surveyInfo.incentive+"', ";
            query += "'"+surveyInfo.questionCnt+"'); ";

            //question에 문항정보 등록, (문항타입 0: 주관식, 1:객관식)
            query += "INSERT INTO question(questionId, surveyId, questionNum, questionTitle, questionType, maxLenAns) VALUES ";
            surveyInfo.qData.forEach (
                function(val, idx, data){
                    let questionId = uuid.v4();
                    query += "('"+questionId+"', ";
                    query += "'"+surveyId+"', ";
                    query += "'"+data[idx].qNum+"', ";
                    query += "'"+data[idx].qTitle+"', ";
                    query += "'"+data[idx].qType+"', ";
                    if(idx===data.length - 1) {
                        query += "'"+data[idx].qAnswerLength+"'); ";
                    } else {
                        query += "'"+data[idx].qAnswerLength+"'), ";
                    }
                }
            )


            //개별 설문 응답 Table 생성
            query+= "CREATE TABLE s"+ surveyId.toString().replace(/-/g,"") + " (";
            query+= "answerer varchar(45) not null, ";
            query+= "gender varchar(6) not null, ";
            query+= "age varchar(6) not null, ";
            surveyInfo.qData.forEach(
                function (data) {
                    if(data.qType===0) {
                        query+= "q"+data.qNum+" varchar(" + data.qAnswerLength +") NOT NULL, ";
                    }
                    else {
                        query+= "q"+data.qNum+" INT NOT NULL, ";
                    }
                }
            )
            query+= "answerDate DATETIME NULL DEFAULT CURRENT_TIMESTAMP)"

            db.query(query,
                (err) =>{
                    console.log("설문생성", query);
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else{
                        resolve({success : true});
                    }
                });
        });
    }

    static submitSurvey(data) {
        return new Promise((resolve, reject) => {
            let surveyId = data.surveyId;
            data.surveyId = surveyId.toString().replace(/-/g,"");
            let query = "INSERT INTO s"+data.surveyId + "(answerer, gender, age, ";

            data.answer.forEach((value, index, array) => {
                if(index === array.length-1) {
                    query += "q"+value.num +") VALUES "
                } else {
                    query += "q"+value.num + ", "
                }
            });

            query += "('" + data.userInfo.userATA + "', ";
            query += "'" + data.userInfo.userGender + "', ";
            query += "'" + data.userInfo.userAge + "', ";

            data.answer.forEach((value, index, array) => {
                if(index === array.length-1) {
                    query += "'"+value.ans +"');";
                } else {
                    query += "'"+value.ans + "', ";
                }
            });

            query +=" UPDATE survey SET curAnswerCnt = curAnswerCnt +1 WHERE surveyId = '" + surveyId +"';";
            console.log(query);

            db.query(query,
                (err) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve({success: true});
                    }
                });
        });
    }

    static getSurveyList() {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM survey ORDER BY enrollDate desc;";
            db.query(query,
                (err, data) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve(data);
                    }
                });
        });
    }

    static getSurveyInfo(id) {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM survey WHERE surveyId = '" + id + "'";
            db.query(query,
                (err, data) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve(data[0]);
                    }
                });
        });
    }

    static getSurvey(id) {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM question WHERE surveyId = '" + id + "'";
            console.log(query);
            db.query(query,
                (err, data) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve(data);
                    }
                });
        });
    }

    static getAnswer(surveyId) {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM s"+ surveyId + ";";
            console.log(query);
            db.query(query,
                (err, data) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve(JSON.parse(JSON.stringify(data)));
                    }
                });
        });
    }

    static finishSurvey(surveyId) {
        return new Promise((resolve, reject) => {
            const query = "UPDATE survey SET isFinished = 1 WHERE surveyId = '"+ surveyId + "';";
            console.log(query);
            db.query(query,
                (err) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve({success: true});
                    }
                });
        });
    }

    static uploadNFT(csvPath, surveyId) {
        return new Promise((resolve, reject) => {
            const query = "UPDATE survey SET csvPath = '"+csvPath+"' WHERE surveyId = '"+ surveyId + "';";
            console.log(query);
            db.query(query,
                (err) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve({success:true});
                    }
                });
        });
    }

    static getNFTFilePath(surveyId) {
        return new Promise((resolve, reject) => {
            const query = "SELECT csvPath FROM survey WHERE surveyId = '"+ surveyId + "';";
            console.log(query);
            db.query(query,
                (err, data) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve(data[0]);
                    }
                });
        });
    }

    static getAnswererList(id) {
        return new Promise((resolve, reject) => {
            let surveyId = id.toString().replace(/-/g,"");
            const query = "SELECT answerer FROM s" +surveyId;
            console.log(query);
            db.query(query,
                (err, data) =>{
                    if(err) resolve({success:false , msg:err.sqlMessage});
                    else {
                        resolve(data);
                    }
                });
        });
    }
}

module.exports = SurveyStorage;
