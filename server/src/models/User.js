"use strict"

const UserStorage = require("./UserStorage");
const bcrypt = require('bcrypt');
const spl = require('@solana/spl-token');
const {PublicKey} = require('@solana/web3.js');
const connection = require("../../solana");
const sk = require("../../../lw-solana-wallet/my-keypair.json");
const BN = require('bn.js');

class User {
    constructor(body){
        this.body = body;
    }

    async login() {
        const client = this.body;
        try{
            const {userEmail, userPassword, userWalletAddress, userATA} = await UserStorage.getUserLoginInfo(client.email);
            if(userEmail){
                //입력한 비밀번호간 해쉬가 같은지 확인
                if(userEmail===client.email &&
                    bcrypt.compareSync(client.password, userPassword)
                ){
                    return {success : true, pk: userWalletAddress, ata: userATA};
                }
                return {success : false, msg : "비밀번호가 틀렸습니다."};
            }
        } catch(err) {
            if(err instanceof TypeError) {
                return {success : false, msg: "존재하지 않는 이메일 입니다."};
            }
            return {success : false, msg: "예기치 않은 오류가 발생했습니다."};
        }
    }

    async signup() {
        const client = this.body;
        //bycrypt 암호화 salt 강도 10
        client.password = await bcrypt.hashSync(client.password, 10);
        try{
            let createTA;
            const response = await UserStorage.save(client);
            if(client.walletAddress!=="" && response.success){
                createTA = await this.changeWalletAddress();
            } else {
                return response;
            }
            return createTA;
        } catch(err){
            return {success : false, msg : err};
        }
    }

    async changeWalletAddress() {
        const client = this.body;
        try{
            let createTA;
            const response = await UserStorage.changeWalletAddress(client);
            if(response.success){
                createTA = await createAssTokenAccount(client.walletAddress, client.email);
                response['TA'] = createTA;
            }
            console.log("최종 결과");
            console.log(response);
            return response;
        } catch (err) {
            return {success : false, msg : err.msg};
        }
    }
}

async function createAssTokenAccount(PK, email) {
    let ata;
    try {
        console.log("토큰 어소시에이트 어카운트 발행 시도");
        ata = await spl.createAssociatedTokenAccount(connection,
            {publicKey: new PublicKey("dxBrT5i6WYgvKk1j4iSfgtWRE1StkvbKVcVjapGCvGD"), secretKey: Uint8Array.from(sk)},
            new PublicKey("8noBEitK1NVRAc8PDrR13peomDa1rtNvGUKab5zZ3pVb"),
            new PublicKey(PK))
    } catch (e) {
        console.log(e);
        let temp = await connection.getTokenAccountsByOwner(new PublicKey(PK), {
            mint: new PublicKey("8noBEitK1NVRAc8PDrR13peomDa1rtNvGUKab5zZ3pVb")
        });
        ata = temp.value[0].pubkey;
    }
    console.log("토큰 어소시에트 어카운트 발행 완료. 저장중");
    ata = publicKeyFromBn(ata);
    const response = await UserStorage.changeATA(ata, email);
    return response;
}

const publicKeyFromBn = (pubkey) => {
    const bN = new BN(pubkey._bn, 16)
    const decoded = { _bn: bN};
    return new PublicKey(decoded);
};

module.exports = User;
