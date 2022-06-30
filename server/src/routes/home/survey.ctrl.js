"use strict"

const Survey = require("../../models/Survey");
const SurveyStorage = require("../../models/SurveyStorage");
const UserStorage = require("../../models/UserStorage");
const surveySmartContract = require("../../../surveySmartContract");
const {PublicKey} = require("@solana/web3.js");
const bs58 = require("bs58");
const converter = require("json-2-csv");
const fs = require('fs');
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK('48b3897047e499c370bd', '212424e67471ff3ef840e2e6cedb9d5b43349608af273bf5f21bf1b34512f047');

const output = {
    makeSurveyView: async (req, res) => {
        if(!req.session.user) {
            return res.send("잘못된 접근입니다. 로그인 되어있지 않습니다.");
        } else {
            return res.render("survey/makingSurvey",{pk: req.session.user.pk, ata: req.session.user.ata});
        }
    },

    getSurveyInfo: async (req, res) => {
        if(!req.session.user) {
            return res.send("잘못된 접근입니다. 로그인 되어있지 않습니다.");
        } else {
            const data = await SurveyStorage.getSurveyInfo(req.query.id);
            return res.render("survey/surveyInfo",  {data: data, pk: req.session.user.pk});
        }
    },

    getSurvey: async (req, res) => {
        if(!req.session.user) {
            return res.send("잘못된 접근입니다. 로그인 되어있지 않습니다.");
        } else {
            const surveyInfo = await SurveyStorage.getSurveyInfo(req.query.id);
            const data = await SurveyStorage.getSurvey(req.query.id);
            return res.render("survey/survey", {surveyInfo: surveyInfo, data: data});
        }
    },
}

const process = {
    enrollSurvey: async (req, res) => {
        if(!req.session.user) {
            return res.json({success: false, msg: "로그인 정보가 없습니다. 재로그인 후 시도해주세요."});
        } else {
            req.body.signer = req.session.user.pk;
            req.body.publisherATA = req.session.user.ata;
            const contract = new surveySmartContract();
            let sk = bs58.decode(req.body.sign);
            const enrollContract = await contract.enrollSurveyContract({publicKey: new PublicKey(req.session.user.pk), secretKey: Uint8Array.from(sk)}, req.session.user.ata, req.body.fee, req.body.reward);
            console.log(enrollContract);
            if(enrollContract.success) {
                req.body.escrowAddress = enrollContract.escrowAddress;
                const survey = new Survey(req.body);
                console.log("설문 등록", req.body);
                let response = await survey.enroll();
                response.txId = enrollContract.txId;
                console.log(response);
                return res.json(response);
            } else {
                return res.json(enrollContract);
            }
        }
    },

    submitSurvey: async (req, res) => {
        if(!req.session.user) {
            return res.json({success: false, msg: "로그인 정보가 없습니다. 재로그인 후 시도해주세요."});
        }  else {
            const userInfo = await UserStorage.getUserInfo(req.session.user.email);
            req.body.userInfo = userInfo;
            const survey = new Survey(req.body);
            console.log("응답 제출", req.body);
            const response = await survey.submit();
            if(response.success) {
                const contract = new surveySmartContract();
                let sk = bs58.decode(req.body.sign);
                const wallet = {publicKey: new PublicKey(req.session.user.pk), secretKey: Uint8Array.from(sk)}
                const txResponse = await contract.getReward(req.body.escrowAddress, wallet, req.session.user.ata, req.body.publisher, req.body.publisherATA);
                console.log(txResponse);
                return res.json(txResponse);
            }
            return res.json(response);
        }
    },


    finishSurvey: async (req, res) => {
        if(!req.session.user) {
            return res.json({success: false, msg: "로그인 정보가 없습니다. 재로그인 후 시도해주세요."});
        } else {
            const survey = await SurveyStorage.getSurveyInfo(req.body.surveyId);
            let surveyId = req.body.surveyId.toString().replace(/-/g,"");
            let origin_surveyId = req.body.surveyId;

            if(survey.publisher===req.session.user.pk) {
                const ansData = await SurveyStorage.getAnswer(surveyId);

                let data = await new Promise((resolve, reject) => {
                    converter.json2csv(ansData, (err, csv) => {
                        if(err) {
                            console.log(err);
                            return res.json({success: false, msg: err});
                        }
                        resolve(csv);
                    });
                })

                await fs.mkdirSync('survey_nft/asset/'+surveyId, {recursive: true});
                await fs.writeFileSync('survey_nft/asset/'+surveyId+"/0.csv", data, 'utf8');
                console.log("csv파일 저장완료");

                console.log("ipfs pinata 업로드");
                let csvIpfs;
                let readableStreamForFile = await fs.createReadStream('survey_nft/asset/'+surveyId+"/0.csv");
                let options = {
                    pinataMetadata: {
                        name: surveyId+".csv",
                        keyvalues: {
                        }
                    },
                    pinataOptions: {
                        cidVersion: 0
                    }
                };

                await pinata.pinFileToIPFS(readableStreamForFile, options).then((result) => {
                    //handle results here
                    console.log("ipfs 업로드 완료",result);
                    csvIpfs = result.IpfsHash;
                }).catch((err) => {
                    //handle error here
                    console.log(err);
                    return res.json({success:false, msg:err});
                });

                let csvPath = "https://gateway.pinata.cloud/ipfs/" + csvIpfs;

                const response = await SurveyStorage.uploadNFT(csvPath, origin_surveyId);
                if(response.success){
                    let resp = await SurveyStorage.finishSurvey(origin_surveyId);
                    return res.json(resp);
                } else {
                    return res.json(response);
                }
            } else {
                return res.json({success: false, msg: "고객님이 발행하신 설문이 아닙니다."});
            }
        }
    },
}


module.exports = {
    output,
    process,
}

