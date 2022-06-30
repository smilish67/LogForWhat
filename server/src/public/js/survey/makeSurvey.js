"use strict"

const enrollBtn = document.querySelector("#enrollSurveyBtn");
const needTokenAmount = document.querySelector("#needTokenAmount");

let queryJson = [];
let i = 1;
let rewards;
let maxAnswerer;
let needToken;
let upzBalance;
let incentive = 0;

enrollBtn.addEventListener("click", enroll);

$("#subjectiveAddBtn").click(function() {
    let title = $("#subjectiveTitle").val();
    let answerMax = $("#subjectiveMax").val();

    if(title==="" || answerMax==="" || answerMax<=0){
        alert("질문을 정보를 올바르게 설정해주세요.");
        return;
    }

    let JsonObject = new Object();
    JsonObject.qNum = i;
    JsonObject.qTitle = title;
    JsonObject.qType = 0;
    JsonObject.qAnswerLength = parseInt(answerMax);
    $("#questionList").append("<p class='subjective'>"+i+". "+title+" </p>");
    i++;
    queryJson.push(JsonObject);

    $("#subjectiveTitle").val('');
    $("#subjectiveMax").val('');
    changeRewards();
});

$("#numOfAnswerer").change(function(){
    changeRewards();
});

$("#tradable").change(function () {
    changeRewards();
});

function enroll(){
    parent.showSpinner();
    let surveyTitle = $("#surveyTitle").val();
    let numOfAnswerer = $("#numOfAnswerer").val();
    let addInfo = $("#addInfo").val();
    let sign = $("#secretKey").val();

    if(surveyTitle===""){
        alert("설문 제목을 입력해주세요.");
        return;
    }
    if(numOfAnswerer ===""){
        alert("응답 인원 수를 입력해주세요.");
        return;
    }
    if(queryJson.length===0){
        alert("최소 1개이상의 질문이 필요합니다.");
        return;
    }

    if(needToken >= upzBalance) {
        alert("보유한 UPZ 토큰이 부족합니다.");
        return;
    }

    let jsonObject = new Object();
    jsonObject.surveyTitle = surveyTitle;
    jsonObject.maxAnswerer = numOfAnswerer;
    jsonObject.addInfo = addInfo;
    jsonObject.qData = queryJson;
    jsonObject.questionCnt = i-1;
    jsonObject.sign = sign;
    jsonObject.incentive = incentive;
    jsonObject.incentive === 0? jsonObject.reward = rewards : jsonObject.reward = rewards*0.7;
    jsonObject.fee = needToken;


    fetch("/api/survey/enroll", {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(jsonObject)
    }).then((res)=>res.json())
        .then((res)=>{
            if(res.success){
                parent.hideSpinner();
                alert("정상적으로 등록되었습니다.");
                parent.changeAddress("/txResult?id="+res.txId, '1020', '550');
            } else{
                parent.hideSpinner();
                return alert(res.msg);
            }
        })
        .catch((err) => {
            parent.hideSpinner();
            console.error(new Error("에러발생"), err);
            alert("오류가 발생했습니다. 회사측에 연락주세요.")
        });
}

function changeRewards() {
    if(i-1===0) {
        rewards = 0;
    } else if(i-1<=30) {
        rewards = 0.5;
    } else if(i-1<=60) {
        rewards = 1;
    } else if(i-1<=90) {
        rewards = 2;
    } else {
        rewards = 3;
    }
    maxAnswerer = $("#numOfAnswerer").val()
    let tmp = rewards*maxAnswerer;
    if($("#tradable").is(":checked")) {
        needToken = Math.ceil(0.7*tmp*1000)/1000;
        incentive = Math.ceil(rewards*0.03*1000)/1000;
    } else {
        needToken = tmp;
        incentive = 0;
    }
    needTokenAmount.innerHTML = needToken;
}