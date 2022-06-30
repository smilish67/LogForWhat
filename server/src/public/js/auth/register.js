"use strict"


const email = document.querySelector("#email");
const password = document.querySelector("#password");
const passwordCheck = document.querySelector("#passwordCheck");
const walletAddress = document.querySelector("#walletAddress");
const registerBtn = document.querySelector("#submit");

registerBtn.addEventListener("click",register);
window.addEventListener("keydown", function (e) {
    if(e.key === "Enter"){
        register();
    }
});


function register(){

    const gender = document.querySelector("input[name='gender']:checked");
    const age = document.querySelector("[name='age']");


    if(email.value===""){
        alert("이메일을 입력하세요.");
        return;
    }
    if(password.value===""){
        alert("패스워드를 입력하세요.");
        return;
    }
    if(age.value===""){
        alert("나이대를 선택해주세요.");
        return;
    }
    if(walletAddress.value!==""){
        if(validateSolAddress(walletAddress.value)){

        } else {
            alert("유효하지 않은 솔라나 지갑 주소입니다.");
            return;
        }
    }


    if(password.value !== passwordCheck.value){
        alert("비밀번호를 다시 확인해주세요.");
        return;
    }

    const req = {
        email : email.value,
        password : password.value,
        age : age.value,
        gender : gender.value,
        walletAddress : walletAddress.value
    };

    showSpinner();

    fetch("/api/user/register", {
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(req),
    })
        .then((res)=>res.json())
        .then((res)=>{
            if(res.success){
                hideSpinner();
                alert("회원가입되었습니다.");
                location.href = "/";
            } else{
                hideSpinner();
                return alert(res.msg);
            }
        })
        .catch((err) => {
            hideSpinner();
            console.error(new Error("에러발생"), err);
            alert("오류가 발생했습니다. 회사측에 연락주세요.")
        });
}

const {PublicKey} = solanaWeb3

function validateSolAddress(address){
    try {
        let pubkey = new PublicKey(address)
        let isSolana =  PublicKey.isOnCurve(pubkey.toBuffer())
        return isSolana
    } catch (error) {
        return false
    }
}