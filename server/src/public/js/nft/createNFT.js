"use strict"

function createNFT(surveyId, pk) {
    parent.showSpinner();
    let jsonObject = new Object();
    let secretKey = $("#secretKey").val();
    let tokenName = $("#tokenName").val();
    let description = $("#description").val();
    let price = $("#price").val();

    jsonObject.secretKey = secretKey;
    jsonObject.tokenName = tokenName;
    jsonObject.description = description;
    jsonObject.surveyId = surveyId;
    jsonObject.price = price;
    jsonObject.pk = pk;

    fetch("/api/nft/create", {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(jsonObject)
    }).then((res)=>res.json())
        .then((res)=>{
            if(res.success){
                parent.hideSpinner();
                alert("정상적으로 생성되었습니다.");
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