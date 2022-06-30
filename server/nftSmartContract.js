"use strict"

const {TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createInitializeMintInstruction, MINT_SIZE} = require("@solana/spl-token");
const connection = require("./solana");
const {PublicKey, LAMPORTS_PER_SOL, Keypair, SystemProgram} = require("@solana/web3.js")
const anchor = require("@project-serum/anchor");
anchor.setProvider(connection);

const idl = JSON.parse(
    require("fs").readFileSync('../lw-nft-contract/target/idl/lw_nft_contract.json', "utf8")
);

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

class nft {
    constructor(body){
        this.body = body;
    }

    async mintNFT(wallet, jsonPath, tokenName) {
        const anchorWallet = new anchor.Wallet(wallet);
        const provider = new anchor.AnchorProvider(connection, anchorWallet, connection);
        const programId = new anchor.web3.PublicKey("8SLH9tEURNMmRgCj9wfiHLyifuhhEjUi653anC35FdVH");
        const program = new anchor.Program(idl, programId, provider);

        const lamports =
            await program.provider.connection.getMinimumBalanceForRentExemption(
                MINT_SIZE
            );

        const getMetadata = async (
            mint
        ) => {
            return (
                await anchor.web3.PublicKey.findProgramAddress(
                    [
                        Buffer.from("metadata"),
                        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                        mint.toBuffer(),
                    ],
                    TOKEN_METADATA_PROGRAM_ID
                )
            )[0];
        };
        const getMasterEdition = async (
            mint
        ) => {
            return (
                await anchor.web3.PublicKey.findProgramAddress(
                    [
                        Buffer.from("metadata"),
                        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                        mint.toBuffer(),
                        Buffer.from("edition"),
                    ],
                    TOKEN_METADATA_PROGRAM_ID
                )
            )[0];
        };

        const mintKey = anchor.web3.Keypair.generate();

        const NftTokenAccount = await getAssociatedTokenAddress(
            mintKey.publicKey,
            provider.wallet.publicKey
        );
        console.log("NFT Account: ", NftTokenAccount.toBase58());

        const mint_tx = new anchor.web3.Transaction().add(
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: provider.wallet.publicKey,
                newAccountPubkey: mintKey.publicKey,
                space: MINT_SIZE,
                programId: TOKEN_PROGRAM_ID,
                lamports,
            }),
            createInitializeMintInstruction(
                mintKey.publicKey,
                0,
                provider.wallet.publicKey,
                provider.wallet.publicKey
            ),
            createAssociatedTokenAccountInstruction(
                provider.wallet.publicKey,
                NftTokenAccount,
                provider.wallet.publicKey,
                mintKey.publicKey
            )
        );
        const res = await provider.sendAndConfirm(mint_tx, [mintKey]);
        console.log(
            await provider.connection.getParsedAccountInfo(mintKey.publicKey)
        );
        console.log("Account: ", res);
        console.log("Mint key: ", mintKey.publicKey.toString());
        console.log("User: ", provider.wallet.publicKey.toString());
        const metadataAddress = await getMetadata(mintKey.publicKey);
        const masterEdition = await getMasterEdition(mintKey.publicKey);
        console.log("Metadata address: ", metadataAddress.toBase58());
        console.log("MasterEdition: ", masterEdition.toBase58());


        const tx = await program.rpc.mintNft(
            mintKey.publicKey,
            jsonPath,
            tokenName,
            {
                accounts: {
                    mintAuthority: provider.wallet.publicKey,
                    mint: mintKey.publicKey,
                    tokenAccount: NftTokenAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    metadata: metadataAddress,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                    payer: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    masterEdition: masterEdition,
                },
            }
        );
        console.log("Your transaction signature", tx);

        return {success: true, txId: tx, nftAddr: mintKey.publicKey.toString()};
    }
}

module.exports = nft;