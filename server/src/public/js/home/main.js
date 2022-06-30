"use strict"

function logout(){
    let confirms = confirm("로그아웃 하시겠습니까?");
    if(confirms){
        fetch("/api/user/logout", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
        }).then((res)=>res.json())
            .then((res)=>{
                if(res.success){
                    alert("로그아웃 되었습니다.");
                    location.href="/";
                } else{
                    return alert(res.msg);
                }
            })
            .catch((err) => {
                console.error(new Error("에러발생"), err);
                alert("오류가 발생했습니다. 회사측에 연락주세요.")
            });
    }
}