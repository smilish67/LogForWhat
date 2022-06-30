"use strict"

const {Keypair} = solanaWeb3;
const keyGenDiv = document.querySelector('#keyGen');
const genButton = document.querySelector('#keyGenerator');
const newPK = document.querySelector('#newPK');
const newSK = document.querySelector('#newSK');
let sk, pk;


function KeypairGen() {
    let keypair = Keypair.generate();
    sk = bs58.encode(keypair.secretKey);
    pk = keypair.publicKey.toBase58();
    keyGenDiv.style.display = "block";
    newPK.innerHTML = pk;
    newSK.innerHTML = sk;
    genButton.innerHTML = "지갑저장";
    genButton.style.backgroundColor = "red";
    genButton.setAttribute("onClick", "KeypairEnroll()");
}

function KeypairEnroll() {
    showSpinner();
    const req = {
        walletAddress: pk
    };

    fetch("/api/user/changeWallet", {
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
                alert("지갑이 정상적으로 생성되었습니다.");
                location.href="/myWallet";
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
