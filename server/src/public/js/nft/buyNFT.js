"use strict"

function buyNFT(surveyId, pk, tokenAddr, price) {
    parent.showSpinner();
    let jsonObject = new Object();
    let secretKey = $("#secretKey").val();

    jsonObject.secretKey = secretKey;
    jsonObject.surveyId = surveyId;
    jsonObject.price = price;
    jsonObject.pk = pk;
    jsonObject.tokenAddress = tokenAddr;

    fetch("/api/nft/buy", {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(jsonObject)
    }).then((res)=>res.json())
        .then((res)=>{
            if(res.success){
                parent.hideSpinner();
                alert("구매하였습니다.");
                parent.location.href = "";
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