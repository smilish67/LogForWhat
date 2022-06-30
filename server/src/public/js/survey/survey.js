"use strict"

function submitSurvey(cnt, surveyId, escrowAddress, publisherATA, publisher) {
    parent.showSpinner();
    let jsonObject = new Object();
    let secretKey = $("#secretKey").val();
    let jsonArray = [];
    for(let i=1; i<=cnt; i++) {
        let jsonData = {
            num : i,
            ans : $('#'+i).val()
        }
        jsonArray.push(jsonData);
    }
    jsonObject.surveyId = surveyId;
    jsonObject.answer = jsonArray;
    jsonObject.escrowAddress = escrowAddress;
    jsonObject.publisherATA = publisherATA;
    jsonObject.publisher = publisher;
    jsonObject.sign = secretKey;

    fetch("/api/survey/submit", {
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
                parent.changeAddress("/txResult?id="+res.txId, '1020', '680');
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