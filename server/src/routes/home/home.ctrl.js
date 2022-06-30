"use strict"

const UserStorage = require("../../models/UserStorage");
const SurveyStorage = require("../../models/SurveyStorage");
const NFTStorage = require("../../models/NFTStorage");

const output = {
    main: async (req, res) => {
        if(!req.session.user){
            return res.redirect("/");
        } else {
            const userData = await UserStorage.getUserInfo(req.session.user.email);
            if(req.session.user.pk ===null || req.session.user.pk ===""){
                req.session.user.pk=userData['userWalletAddress'];
                req.session.user.ata= userData['userATA'];
            }
            return res.render("home/myWallet", {data: userData});
        }
    },

    getSurveyInProgress: async (req, res) => {
        if(!req.session.user){
            return res.redirect("/");
        } else {
            const data = await SurveyStorage.getSurveyList();
            return res.render("home/surveyInProgress", {data: data});
        }
    },

    getSurveyNFTStore: async (req, res) => {
        if(!req.session.user){
            return res.redirect("/");
        } else {
            const data = await NFTStorage.getNFTList();
            return res.render("home/surveyNFTStore", {data: data});
        }
    },

    txResultView: async (req, res) => {
        if(!req.session.user){
            return res.send("잘못된 접근입니다. 로그인되어있지 않습니다.");
        } else {
            return res.render("tx/txResult", {txId: req.query.id});
        }
    },
}

const process = {

}


module.exports = {
    output,
    process,
}
