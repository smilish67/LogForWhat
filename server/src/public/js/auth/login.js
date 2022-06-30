"use strict"

const email = document.querySelector("#email");
const password = document.querySelector("#password");
const loginBtn = document.querySelector("#submit");

loginBtn.addEventListener("click",login);
window.addEventListener("keydown", function (e) {
    if(e.key === "Enter"){
        login();
    }
});

function login(){
    const req = {
        email : email.value,
        password : password.value,
    };

    if(email.value===""){
        alert("이메일을 입력하세요.");
        return;
    }
    if(password.value===""){
        alert("패스워드를 입력하세요.");
        return;
    }

    showSpinner();

    fetch("/api/user/login", {
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
                location.href = "/myWallet";
            } else{
                hideSpinner();
                alert(res.msg);
            }
        })
        .catch((err) => {
            hideSpinner();
            console.error(new Error("에러발생"), err);
            alert("오류가 발생했습니다. 회사측에 연락주세요.")
        });
}