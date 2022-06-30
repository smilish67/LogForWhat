"use strict"

const SurveyStorage = require("./SurveyStorage");

class Survey {
    constructor(body){
        this.body = body;
    }

    async enroll() {
        const surveyData = this.body;
        try{
            const response = await SurveyStorage.enroll(surveyData);
            return response;
        } catch(err){
            return {success : false, msg : err.msg};
        }
    }

    async submit() {
        const surveyData = this.body;
        try{
            const response = await SurveyStorage.submitSurvey(surveyData);
            return response;
        } catch(err){
            return {success : false, msg : err.msg};
        }
    }
}

module.exports = Survey;
