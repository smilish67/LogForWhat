const {getMint, TOKEN_PROGRAM_ID} = require("@solana/spl-token");
const connection = require("./solana");
const {PublicKey, Keypair} = require("@solana/web3.js")
const anchor = require("@project-serum/anchor");
const sk = require("../lw-solana-wallet/my-keypair.json")

const idl = JSON.parse(
    require("fs").readFileSync('../lw-smart-contract/target/idl/survey_rewards.json', "utf8")
);
anchor.setProvider(connection);

class surveySmartContract {
    constructor(body){
        this.body = body;
    }

    async enrollSurveyContract(wallet, ata, fee, reward) {
        const anchorWallet = new anchor.Wallet(wallet);
        const provider = new anchor.AnchorProvider(connection, anchorWallet, connection);
        const programId = new anchor.web3.PublicKey("2m9zddeqaVarWy3MHk59BSTZ6xF8jeWuHZCRXvQw5Noh");
        const program = new anchor.Program(idl, programId, provider);
        let upzCoin = await getMint(connection, new PublicKey("8noBEitK1NVRAc8PDrR13peomDa1rtNvGUKab5zZ3pVb"));
        let vault_account_pda;
        let vault_account_bump;
        let vault_authority_pda;
        let response;

        const takerAmount = reward*1000;
        const initializerAmount = fee*1000;
        const escrowAccount = await anchor.web3.Keypair.generate();

        const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
            [escrowAccount.publicKey.toBytes()],
            program.programId
        );

        vault_account_pda = _vault_account_pda;
        vault_account_bump = _vault_account_bump;

        const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
            [escrowAccount.publicKey.toBytes()],
            program.programId
        );
        vault_authority_pda = _vault_authority_pda;

        console.log("Survey Rewards : 스마트 컨트랙트 Initialize");
        try {
            // response = await program.methods.initialize(
            //     vault_account_bump,
            //     new anchor.BN(initializerAmount),
            //     new anchor.BN(takerAmount))
            //     .accounts(
            // {
            //             accounts: {
            //                 initializer: wallet.publicKey,
            //                 vaultAccount: vault_account_pda,
            //                 mint: upzCoin.address,
            //                 initializerDepositTokenAccount: ata,
            //                 escrowAccount: escrowAccount.publicKey,
            //                 systemProgram: anchor.web3.SystemProgram.programId,
            //                 rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            //                 tokenProgram: TOKEN_PROGRAM_ID,
            //             },
            //             instructions: [
            //                 await program.account.escrowAccount.createInstruction(escrowAccount),
            //             ],
            //         },
            //     ).signers({
            //         signers: [escrowAccount, wallet]
            //     }).rpc();
            response = await program.rpc.initialize(
                vault_account_bump,
                new anchor.BN(initializerAmount),
                new anchor.BN(takerAmount),
                {
                    accounts: {
                        initializer: wallet.publicKey,
                        vaultAccount: vault_account_pda,
                        mint: upzCoin.address,
                        initializerDepositTokenAccount: ata,
                        escrowAccount: escrowAccount.publicKey,
                        systemProgram: anchor.web3.SystemProgram.programId,
                        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                        tokenProgram: TOKEN_PROGRAM_ID,
                    },
                    instructions: [
                        await program.account.escrowAccount.createInstruction(escrowAccount),
                    ],
                    signers: [escrowAccount, wallet],
                },
            );
        } catch (e) {
            console.log(e);
            return {success : false, msg: e.msg};
        }

        return {success: true, escrowAddress: escrowAccount.publicKey, txId: response};
    }

    async getReward(escrowAccount, takerWallet, ata, publisher, publisherATA) {
        const wallet = {publicKey: new PublicKey("dxBrT5i6WYgvKk1j4iSfgtWRE1StkvbKVcVjapGCvGD"), secretKey: Uint8Array.from(sk)}
        const anchorWallet = new anchor.Wallet(wallet);
        const provider = new anchor.AnchorProvider(connection, anchorWallet, connection);
        const programId = new anchor.web3.PublicKey("2m9zddeqaVarWy3MHk59BSTZ6xF8jeWuHZCRXvQw5Noh");
        const program = new anchor.Program(idl, programId, provider);
        let vault_account_pda;
        let vault_account_bump;
        let vault_authority_pda;
        let response;

        let EscrowAccount = new PublicKey(escrowAccount);

        const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
            [EscrowAccount.toBytes()],
            program.programId
        );

        vault_account_pda = _vault_account_pda;
        vault_account_bump = _vault_account_bump;

        const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
            [EscrowAccount.toBytes()],
            program.programId
        );
        vault_authority_pda = _vault_authority_pda;

        console.log("Survey Rewards : 스마트 컨트랙트 Exchange");
        try {
            response = await program.rpc.exchange({
                accounts: {
                    taker: takerWallet.publicKey,
                    takerReceiveTokenAccount: ata,
                    initializerDepositTokenAccount: publisherATA,
                    initializer: publisher,
                    escrowAccount: escrowAccount,
                    vaultAccount: vault_account_pda,
                    vaultAuthority: vault_authority_pda,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
                signers: [takerWallet]
            });
            console.log(response);
        } catch (e) {
            console.log(e);
            return {success : false, msg: e.msg};
        }

        return({success: true, txId: response});
    }

    async closeContract(wallet, escrowAccount, ata) {
        const anchorWallet = new anchor.Wallet(wallet);
        const provider = new anchor.Provider(connection, anchorWallet, connection);
        const programId = new anchor.web3.PublicKey("2m9zddeqaVarWy3MHk59BSTZ6xF8jeWuHZCRXvQw5Noh");
        const program = new anchor.Program(idl, programId, provider);
        let vault_account_pda;
        let vault_account_bump;
        let vault_authority_pda;
        let response;
        let EscrowAccount = new PublicKey(escrowAccount);

        const [_vault_account_pda, _vault_account_bump] = await PublicKey.findProgramAddress(
            [EscrowAccount.toBytes()],
            program.programId
        );

        vault_account_pda = _vault_account_pda;
        vault_account_bump = _vault_account_bump;

        const [_vault_authority_pda, _vault_authority_bump] = await PublicKey.findProgramAddress(
            [EscrowAccount.toBytes()],
            program.programId
        );
        vault_authority_pda = _vault_authority_pda;

        try {
            response = await program.rpc.cancel({
                accounts: {
                    initializer: wallet.publicKey,
                    initializerDepositTokenAccount: ata,
                    vaultAccount: vault_account_pda,
                    vaultAuthority: vault_authority_pda,
                    escrowAccount: escrowAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                },
                signers: [wallet]
            });
        } catch (e) {
            console.log(e);
            return {success: false, msg:e.msg};
        }

        return {success: true, txId: response};
    }
}

module.exports = surveySmartContract;
