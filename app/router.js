import dotenv from "dotenv";
import express from "express";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import BN from "bn.js";

dotenv.config(); // ✅ Charger .env
const router = express.Router();

// ✅ Utiliser le provider basé sur .env
anchor.setProvider(anchor.AnchorProvider.env());
const program = anchor.workspace.escrowVolanaka;

router.get("/teste", async(req, res) => {
  res.status(200).json({
    message : "yes"
  })
})

router.post("/init", async (req, res) => {
  try {
    const { sellerSecret, buyerPubkey, mintPubkey, amount } = req.body;

    const seller = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(sellerSecret)));
    const buyer = new PublicKey(buyerPubkey);
    const mint = new PublicKey(mintPubkey);
    const escrowAccount = Keypair.generate();
    const amountBN = new BN(amount.toString());
    console.log("seller  :", seller.publicKey)

    console.log("Escrow initialized with account:", escrowAccount.publicKey.toBase58());
    const tx = await program.methods
      .initialize(amountBN, mint)
      .accounts({
        escrowAccount: escrowAccount.publicKey,
        seller: seller.publicKey,
        buyer: buyer,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([escrowAccount, seller])
      .rpc();

    console.log("tx : ", tx)
    res.json({
      success: true,
      seller : seller.publicKey,
      buyer: buyer,
      escrowAccount: escrowAccount.publicKey.toBase58(),
      token_mint :  mint,
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
