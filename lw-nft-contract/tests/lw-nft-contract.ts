import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { LwNftContract } from "../target/types/lw_nft_contract";

describe("lw-nft-contract", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.LwNftContract as Program<LwNftContract>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
