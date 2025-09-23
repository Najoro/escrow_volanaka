import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EscrowVolanaka } from "../target/types/escrow_volanaka";
import { assert } from "chai";
import { PublicKey } from "@solana/web3.js";

describe("escrow_volanaka", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.escrowVolanaka as Program<EscrowVolanaka>;

  const seller = anchor.web3.Keypair.generate();
  const buyer = anchor.web3.Keypair.generate();
  const mint = new PublicKey("vkQu6Hn7W5eAbpuGjwFHCjktb1BeByreAWhauftihoG");
  const escrowAccount = anchor.web3.Keypair.generate();
  const amount = new anchor.BN(1000);
  it("Initializes escrow account", async () => {

    console.log("Seller :", seller.publicKey.toBase58());
    console.log("Buyer  :", buyer.publicKey.toBase58());
    console.log("Mint   :", mint.toBase58());
    console.log("Escrow :", escrowAccount.publicKey.toBase58());
    console.log("Amount :", amount.toNumber());
    

    // Airdrop SOL to seller for fees
    const provider = anchor.AnchorProvider.env();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(seller.publicKey, 2e9),
      "confirmed"
    );

    await program.methods
      .initialize(amount, mint)
      .accounts({
        escrowAccount: escrowAccount.publicKey,
        seller: seller.publicKey,
        buyer: buyer.publicKey,
        // systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([escrowAccount, seller])
      .rpc();

    // Fetch and check escrow account
    const escrowState = await program.account.escrowAccount.fetch(escrowAccount.publicKey);

    assert.ok(escrowState.isInitialized);
    assert.equal(escrowState.seller.toBase58(), seller.publicKey.toBase58());
    assert.equal(escrowState.buyer.toBase58(), buyer.publicKey.toBase58());
    assert.equal(escrowState.amount.toNumber(), amount.toNumber());
    assert.equal(escrowState.mint.toBase58(), mint.toBase58());

    console.log("Escrow SUCCESS initialized:", escrowAccount.publicKey.toBase58());
  });

  it("Fetches escrow amount", async () => {
    // Assuming escrowAccount is already initialized in the previous test
    // const escrowAccount = anchor.web3.Keypair.generate(); // Replace with actual escrow account public key

    // const amount = await program.methods
    //   .getEscrowAmount()
    //   .accounts({ escrowAccount: escrowAccount.publicKey })
    //   .view();

    console.log("Montant dans l'escrow :", amount.toString());
  });
});