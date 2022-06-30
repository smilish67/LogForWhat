"use strict"

const express = require("express");
const router = express.Router();
const authCtrl = require("./home/auth.ctrl");
const homeCtrl = require("./home/home.ctrl");
const surveyCtrl = require("./home/survey.ctrl");
const nftCtrl = require("./home/nft.ctrl");

//로그인 화면
router.get("/", authCtrl.output.main);
router.get("/auth/register", authCtrl.output.registerView);

//메인화면
router.get("/myWallet", homeCtrl.output.main);
router.get("/surveyInProgress", homeCtrl.output.getSurveyInProgress);
router.get("/surveyNFTStore", homeCtrl.output.getSurveyNFTStore);

//설문지 관련화면
router.get("/makeSurvey", surveyCtrl.output.makeSurveyView);
router.get("/getSurveyInfo", surveyCtrl.output.getSurveyInfo);
router.get("/getSurvey", surveyCtrl.output.getSurvey);

//회원기능 관련 요청
router.post("/api/user/login", authCtrl.process.login);
router.post("/api/user/logout", authCtrl.process.logout);
router.post("/api/user/register", authCtrl.process.register);
router.post("/api/user/changeWallet", authCtrl.process.changeWalletAddress);

//설문 관련 요청
router.post("/api/survey/enroll", surveyCtrl.process.enrollSurvey);
router.post("/api/survey/submit", surveyCtrl.process.submitSurvey);
router.post("/api/survey/finish", surveyCtrl.process.finishSurvey)

//트랜잭션 관련 요청
router.get("/txResult", homeCtrl.output.txResultView);

//NFT 마켓 관련 화면
router.get("/createNFT", nftCtrl.output.createNFTView);
router.get("/getNFTInfo", nftCtrl.output.getNFTInfo);

//NFT 관련 요청
router.post("/api/nft/create", nftCtrl.process.createNFT);
router.post("/api/nft/buy", nftCtrl.process.buyNFT);

module.exports = router;